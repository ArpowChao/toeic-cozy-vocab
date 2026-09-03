import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Plus, Layers, Loader2, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { lookupWordOnline } from '../services/dictionaryService.js';
import { saveWordAndSync, saveWordsAndSync } from '../services/wordSaveService.js';
import { soundEffects } from '../services/ttsService.js';

export default function AddWordModal({ isOpen, onClose, onWordAdded }) {
  const [activeTab, setActiveTab] = useState('quick'); // 'quick' | 'batch'
  const [wordInput, setWordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastAddedWord, setLastAddedWord] = useState(null);
  const [batchText, setBatchText] = useState('');
  const [batchProgress, setBatchProgress] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [syncNotice, setSyncNotice] = useState(null);
  
  // Optional advanced manual overrides
  const [advancedData, setAdvancedData] = useState({
    pos: 'v.',
    level: 'L2',
    category: '自訂生詞',
    simpleDefinition: '',
    collocation: '',
    example: '',
    chinese: '',
  });

  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setLastAddedWord(null);
      setSyncNotice(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Ultra-Fast Zero-Effort Quick Add
  const handleQuickAdd = async (e) => {
    e?.preventDefault();
    const query = wordInput.trim();
    if (!query) return;

    setIsLoading(true);
    setLastAddedWord(null);
    setSyncNotice(null);

    try {
      // 1. Fully automate online lookup (IPA, POS, English Definition, Collocation, Example, Chinese)
      const enriched = await lookupWordOnline(query);
      
      const newWord = {
        ...(enriched || {}),
        word: query,
        id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        level: advancedData.level || enriched?.level || 'L2',
        category: advancedData.category || enriched?.category || '自訂生詞',
        simpleDefinition: advancedData.simpleDefinition || enriched?.simpleDefinition || '',
        collocation: advancedData.collocation || enriched?.collocation || '',
        example: advancedData.example || enriched?.example || '',
        chinese: advancedData.chinese || enriched?.chinese || '',
        state: 'new',
        repetition: 0,
        interval: 0,
        easeFactor: 2.5,
        dueDate: null,
      };

      const saveResult = await saveWordAndSync(newWord);
      onWordAdded(newWord);
      soundEffects.playSuccess();

      setLastAddedWord(newWord);
      setSyncNotice(saveResult.synced
        ? { type: 'success', text: `已同步到 Google Sheet（共 ${saveResult.count} 個單字）` }
        : { type: 'warning', text: '單字已存到本機，但 Google Sheet 同步失敗；請到設定檢查連線。' });
      setWordInput('');
      setAdvancedData({
        pos: 'v.',
        level: 'L2',
        category: '自訂生詞',
        simpleDefinition: '',
        collocation: '',
        example: '',
        chinese: '',
      });
      setShowAdvanced(false);

      // Keep focus for next rapid word entry
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (err) {
      console.error('Quick add failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Batch Add with Automated Enrichment
  const handleBatchAdd = async (e) => {
    e?.preventDefault();
    const rawWords = batchText
      .split(/[\n,]+/)
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w.length > 0);

    if (rawWords.length === 0) return;

    setIsLoading(true);
    setSyncNotice(null);
    const enrichedList = [];

    for (let i = 0; i < rawWords.length; i++) {
      const w = rawWords[i];
      setBatchProgress(`正在自動解析 (${i + 1}/${rawWords.length})：${w}...`);
      try {
        const enriched = await lookupWordOnline(w);
        enrichedList.push({
          ...(enriched || {}),
          word: w,
          id: `batch-${Date.now()}-${i}`,
          state: 'new',
          repetition: 0,
          interval: 0,
          easeFactor: 2.5,
          dueDate: null,
        });
      } catch {
        enrichedList.push({
          id: `batch-${Date.now()}-${i}`,
          word: w,
          ipa: '',
          pos: '',
          level: 'L2',
          category: '自訂生詞',
          simpleDefinition: '',
          collocation: '',
          example: '',
          exampleZh: '',
          chinese: '',
          state: 'new',
          repetition: 0,
          interval: 0,
          easeFactor: 2.5,
          dueDate: null,
        });
      }
    }

    const saveResult = await saveWordsAndSync(enrichedList);
    onWordAdded(enrichedList);
    soundEffects.playSuccess();
    setIsLoading(false);
    setBatchProgress(null);
    setBatchText('');
    setSyncNotice(saveResult.synced
      ? { type: 'success', text: `已新增 ${enrichedList.length} 個單字並同步到 Google Sheet（共 ${saveResult.count} 個）` }
      : { type: 'warning', text: `已新增 ${enrichedList.length} 個單字到本機，但 Google Sheet 同步失敗。` });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cozyDark-500/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden paper-shadow border border-cream-300 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-cream-200 bg-cream-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amberGold-100 flex items-center justify-center text-amberGold-700 font-bold shadow-xs">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-latte-800">快速加入生詞</h2>
              <p className="text-xs text-cozyDark-200">只需輸入英文，其餘（音標/英英/搭配詞/例句）系統全自動搞定</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-cozyDark-100 hover:text-cozyDark-400 hover:bg-cream-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex px-6 sm:px-8 pt-3 border-b border-cream-200 gap-6 bg-white text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('quick')}
            className={`pb-3 font-bold transition border-b-2 ${
              activeTab === 'quick'
                ? 'border-latte-600 text-latte-800'
                : 'border-transparent text-cozyDark-200 hover:text-latte-600'
            }`}
          >
            ⚡ 極速單字錄入 (只打字按 Enter)
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`pb-3 font-bold transition border-b-2 ${
              activeTab === 'batch'
                ? 'border-latte-600 text-latte-800'
                : 'border-transparent text-cozyDark-200 hover:text-latte-600'
            }`}
          >
            📋 一次貼上多個單字
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-5">
          {syncNotice && (
            <div className={`p-3 rounded-2xl border text-xs sm:text-sm font-bold flex items-start gap-2 ${
              syncNotice.type === 'success'
                ? 'bg-sage-50 border-sage-200 text-sage-800'
                : 'bg-amberGold-50 border-amberGold-200 text-amberGold-800'
            }`}>
              {syncNotice.type === 'success'
                ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
              <span>{syncNotice.text}</span>
            </div>
          )}
          {activeTab === 'quick' ? (
            <form onSubmit={handleQuickAdd} className="space-y-5">
              {/* Success Notification */}
              {lastAddedWord && (
                <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 text-sage-800 text-xs sm:text-sm animate-fade-in flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-sage-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">
                      🎉 已自動補全並加入「{lastAddedWord.word}」！
                    </div>
                    <div className="text-xs text-sage-700 mt-1">
                      釋義：{lastAddedWord.simpleDefinition}
                    </div>
                    <div className="text-[11px] text-sage-600 mt-0.5">
                      搭配詞：{lastAddedWord.collocation}
                    </div>
                  </div>
                </div>
              )}

              {/* Big Clean Input Box */}
              <div>
                <label className="block text-xs sm:text-sm font-black text-latte-800 mb-2">
                  🔤 請輸入英文單字 (English Word)
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    required
                    disabled={isLoading}
                    placeholder="例如: consolidate, allocate, prospect..."
                    value={wordInput}
                    onChange={(e) => setWordInput(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-cream-300 text-lg sm:text-xl font-bold text-latte-800 focus:outline-none focus:ring-2 focus:ring-latte-400 shadow-inner disabled:bg-cream-100"
                  />
                </div>
                <p className="text-xs text-cozyDark-200 mt-2 font-medium">
                  💡 打完單字直接按鍵盤 <kbd className="px-1.5 py-0.5 bg-cream-200 rounded text-latte-800 font-bold">Enter</kbd>，系統將自動解析音標、英英定義、商務搭配詞與例句並直接存入！
                </p>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isLoading || !wordInput.trim()}
                className="w-full py-4 sm:py-4.5 bg-latte-600 hover:bg-latte-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-sm transition active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>AI 自動解析與補全中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amberGold-300" />
                    <span>一鍵智能補全並加入自習室 (Enter)</span>
                  </>
                )}
              </button>

              {/* Optional Collapsible Advanced Details */}
              <div className="pt-2 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs font-bold text-cozyDark-200 hover:text-latte-700 flex items-center gap-1 transition"
                >
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <span>{showAdvanced ? '收合進階自訂欄位' : '⚙️ 想手動微調特定欄位？點此展開（選填）'}</span>
                </button>

                {showAdvanced && (
                  <div className="mt-3 p-4 bg-cream-50 rounded-2xl border border-cream-300 space-y-3 animate-fade-in text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-cozyDark-300">多益等級</label>
                        <select
                          value={advancedData.level}
                          onChange={(e) => setAdvancedData({ ...advancedData, level: e.target.value })}
                          className="w-full p-2 mt-1 rounded-xl border border-cream-300 bg-white"
                        >
                          <option value="L1">L1 (500+)</option>
                          <option value="L2">L2 (650+)</option>
                          <option value="L3">L3 (775+)</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-cozyDark-300">自訂中文</label>
                        <input
                          type="text"
                          placeholder="留空則自動翻譯..."
                          value={advancedData.chinese}
                          onChange={(e) => setAdvancedData({ ...advancedData, chinese: e.target.value })}
                          className="w-full p-2 mt-1 rounded-xl border border-cream-300"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>
          ) : (
            <form onSubmit={handleBatchAdd} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-black text-latte-800 mb-2">
                  📋 貼上一串單字（可用換行或逗號隔開）
                </label>
                <textarea
                  rows={6}
                  required
                  disabled={isLoading}
                  placeholder={"comply\naccommodate\nreimburse\nexpedite\nnegotiate\nmandatory..."}
                  value={batchText}
                  onChange={(e) => setBatchText(e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-cream-300 text-sm sm:text-base font-mono text-latte-800 focus:outline-none focus:ring-2 focus:ring-latte-400 shadow-inner"
                />
              </div>

              {batchProgress && (
                <div className="p-3 bg-amberGold-50 border border-amberGold-200 rounded-xl text-xs font-bold text-amberGold-700 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{batchProgress}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !batchText.trim()}
                className="w-full py-4 bg-latte-600 hover:bg-latte-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-sm transition active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>批次解析與匯入中...</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-5 h-5 text-amberGold-300" />
                    <span>🚀 一鍵全部智能補全並存入</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
