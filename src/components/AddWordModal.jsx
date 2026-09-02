import React, { useState } from 'react';
import { X, Sparkles, Plus, Layers, Loader2, Check } from 'lucide-react';
import { lookupWordOnline } from '../services/dictionaryService.js';
import { saveWord, saveWordsBatch } from '../services/storageService.js';

export default function AddWordModal({ isOpen, onClose, onWordAdded }) {
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'batch'
  const [isLoading, setIsLoading] = useState(false);
  const [wordInput, setWordInput] = useState('');
  
  // Single Word Form State
  const [formData, setFormData] = useState({
    word: '',
    ipa: '',
    pos: 'v.',
    level: 'L2',
    category: '商務日常',
    simpleDefinition: '',
    collocation: '',
    example: '',
    exampleZh: '',
    chinese: '',
    toeicTip: '',
  });

  // Batch Form State
  const [batchText, setBatchText] = useState('');
  const [batchLevel, setBatchLevel] = useState('L2');
  const [batchCategory, setBatchCategory] = useState('自訂生詞');

  if (!isOpen) return null;

  // Auto Lookup for Single Word
  const handleAutoLookup = async (e) => {
    e?.preventDefault();
    const query = (formData.word || wordInput).trim();
    if (!query) return;

    setIsLoading(true);
    try {
      const result = await lookupWordOnline(query);
      if (result) {
        setFormData((prev) => ({
          ...prev,
          ...result,
          level: prev.level || result.level,
          category: prev.category || result.category,
        }));
      }
    } catch (err) {
      console.error('Lookup failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSingle = async (e) => {
    e.preventDefault();
    if (!formData.word.trim()) return;

    const newWord = {
      ...formData,
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      state: 'new',
      repetition: 0,
      interval: 0,
      easeFactor: 2.5,
      dueDate: null,
    };

    await saveWord(newWord);
    onWordAdded(newWord);
    resetForm();
    onClose();
  };

  const handleSaveBatch = async (e) => {
    e.preventDefault();
    const lines = batchText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;

    setIsLoading(true);
    const wordsToSave = lines.map((w, index) => ({
      id: `batch-${Date.now()}-${index}`,
      word: w,
      ipa: `/${w}/`,
      pos: 'n./v.',
      level: batchLevel,
      category: batchCategory,
      simpleDefinition: `English concept for ${w}`,
      collocation: `${w} in business context`,
      example: `Please make sure to review the ${w} carefully.`,
      exampleZh: '',
      chinese: '（待複習時補充中文）',
      toeicTip: '自訂匯入單字，請多利用搭配詞記憶。',
      state: 'new',
      repetition: 0,
      interval: 0,
      easeFactor: 2.5,
      dueDate: null,
    }));

    await saveWordsBatch(wordsToSave);
    onWordAdded(wordsToSave);
    setIsLoading(false);
    setBatchText('');
    onClose();
  };

  const resetForm = () => {
    setWordInput('');
    setFormData({
      word: '',
      ipa: '',
      pos: 'v.',
      level: 'L2',
      category: '商務日常',
      simpleDefinition: '',
      collocation: '',
      example: '',
      exampleZh: '',
      chinese: '',
      toeicTip: '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cozyDark-500/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden paper-shadow border border-cream-300 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200 bg-cream-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amberGold-100 flex items-center justify-center text-amberGold-600">
              <Plus className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-latte-800">新增個人單字</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-cozyDark-100 hover:text-cozyDark-400 hover:bg-cream-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex px-6 pt-3 border-b border-cream-200 gap-4 bg-white">
          <button
            onClick={() => setActiveTab('single')}
            className={`pb-2.5 text-sm font-semibold transition border-b-2 ${
              activeTab === 'single'
                ? 'border-latte-500 text-latte-700'
                : 'border-transparent text-cozyDark-100 hover:text-latte-600'
            }`}
          >
            單筆智能解析錄入
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`pb-2.5 text-sm font-semibold transition border-b-2 ${
              activeTab === 'batch'
                ? 'border-latte-500 text-latte-700'
                : 'border-transparent text-cozyDark-100 hover:text-latte-600'
            }`}
          >
            批次快速貼上匯入
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'single' ? (
            <form onSubmit={handleSaveSingle} className="space-y-4">
              {/* Word Input + Auto Enrich Button */}
              <div>
                <label className="block text-xs font-bold text-latte-700 uppercase mb-1">
                  英文單字 (English Word)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="例: negotiate, prospective..."
                    value={formData.word}
                    onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-latte-400 text-sm font-semibold text-latte-800"
                  />
                  <button
                    type="button"
                    onClick={handleAutoLookup}
                    disabled={isLoading || !formData.word}
                    className="px-4 py-2.5 bg-amberGold-400 hover:bg-amberGold-500 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    自動解析
                  </button>
                </div>
                <p className="text-[11px] text-cozyDark-100 mt-1">
                  輸入單字後點擊「自動解析」，將為您自動補全音標、英英釋義、搭配詞與例句。
                </p>
              </div>

              {/* Meta row: POS, Level, Category */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-cozyDark-200 mb-1">詞性</label>
                  <input
                    type="text"
                    value={formData.pos}
                    onChange={(e) => setFormData({ ...formData, pos: e.target.value })}
                    placeholder="v. / n. / adj."
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs text-cozyDark-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cozyDark-200 mb-1">多益目標級別</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs text-cozyDark-300 bg-white"
                  >
                    <option value="L1">L1 (500+ 核心)</option>
                    <option value="L2">L2 (650+ 進階)</option>
                    <option value="L3">L3 (775+ 衝刺)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cozyDark-200 mb-1">商務分類</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="人事/合約/行銷"
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs text-cozyDark-300"
                  />
                </div>
              </div>

              {/* Simple English Definition */}
              <div>
                <label className="block text-xs font-bold text-latte-700 mb-1">
                  Simple English Definition (英英核心定義)
                </label>
                <textarea
                  rows={2}
                  value={formData.simpleDefinition}
                  onChange={(e) => setFormData({ ...formData, simpleDefinition: e.target.value })}
                  placeholder="用簡單英文理解單字..."
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs text-cozyDark-300 focus:outline-none focus:ring-1 focus:ring-latte-400"
                />
              </div>

              {/* Collocation */}
              <div>
                <label className="block text-xs font-bold text-amberGold-600 mb-1">
                  TOEIC Collocation (常考搭配詞)
                </label>
                <input
                  type="text"
                  value={formData.collocation}
                  onChange={(e) => setFormData({ ...formData, collocation: e.target.value })}
                  placeholder="例: negotiate contract terms"
                  className="w-full px-3 py-2 rounded-xl border border-amberGold-200 bg-amberGold-50/50 text-xs text-latte-800"
                />
              </div>

              {/* Business Example */}
              <div>
                <label className="block text-xs font-semibold text-cozyDark-200 mb-1">
                  商務情境例句 (Business Example)
                </label>
                <textarea
                  rows={2}
                  value={formData.example}
                  onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                  placeholder="例句..."
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs text-cozyDark-300"
                />
              </div>

              {/* Chinese Definition */}
              <div>
                <label className="block text-xs font-bold text-latte-700 mb-1">
                  繁體中文考點釋義 (按需展開內容)
                </label>
                <input
                  type="text"
                  value={formData.chinese}
                  onChange={(e) => setFormData({ ...formData, chinese: e.target.value })}
                  placeholder="中文意思..."
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs text-latte-800 font-medium"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-latte-600 hover:bg-latte-700 text-white font-bold text-sm rounded-2xl shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> 儲存至生詞本
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSaveBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-latte-700 uppercase mb-1">
                  貼上單字清單（一行一個單字）
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder={"comply\naccommodate\nreimburse\nexpedite\nnegotiate..."}
                  value={batchText}
                  onChange={(e) => setBatchText(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-cream-300 text-sm font-mono text-cozyDark-400 focus:outline-none focus:ring-2 focus:ring-latte-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-cozyDark-200 mb-1">批次設定級別</label>
                  <select
                    value={batchLevel}
                    onChange={(e) => setBatchLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs bg-white text-cozyDark-300"
                  >
                    <option value="L1">L1 (500+ 核心)</option>
                    <option value="L2">L2 (650+ 進階)</option>
                    <option value="L3">L3 (775+ 衝刺)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cozyDark-200 mb-1">標籤分類</label>
                  <input
                    type="text"
                    value={batchCategory}
                    onChange={(e) => setBatchCategory(e.target.value)}
                    placeholder="例如: 模擬考錯題"
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs text-cozyDark-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !batchText.trim()}
                className="w-full py-3 bg-latte-600 hover:bg-latte-700 text-white font-bold text-sm rounded-2xl shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                一鍵批次匯入
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
