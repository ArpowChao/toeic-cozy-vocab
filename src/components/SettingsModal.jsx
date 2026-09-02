import React, { useState } from 'react';
import { X, Cloud, CloudUpload, CloudDownload, Download, Upload, RotateCcw, Volume2, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { getSavedGasUrl, saveGasUrl, testGasConnection, pushWordsToGas, pullWordsFromGas } from '../services/gasSyncService.js';
import { exportToJSON, saveWordsBatch, resetToDefault } from '../services/storageService.js';
import { setTTSConfig } from '../services/ttsService.js';

export default function SettingsModal({ isOpen, onClose, words, onReloadWords }) {
  const [gasUrl, setGasUrl] = useState(getSavedGasUrl());
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: string }
  const [isLoading, setIsLoading] = useState(false);
  const [accent, setAccent] = useState('en-US');
  const [speechRate, setSpeechRate] = useState(1.0);

  if (!isOpen) return null;

  const showStatus = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleSaveUrl = () => {
    saveGasUrl(gasUrl);
    showStatus('success', 'GAS Web App 網址已儲存！');
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      saveGasUrl(gasUrl);
      const res = await testGasConnection(gasUrl);
      showStatus('success', `連線成功！試算表目前包含 ${res.count || 0} 個單字。`);
    } catch (err) {
      showStatus('error', err.message || '連線失敗，請檢查網址或權限設定。');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePush = async () => {
    setIsLoading(true);
    try {
      saveGasUrl(gasUrl);
      const res = await pushWordsToGas(words, gasUrl);
      showStatus('success', res.message || '成功備份至 Google 試算表！');
    } catch (err) {
      showStatus('error', err.message || '備份失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePull = async () => {
    if (!confirm('從 Google 試算表同步將會覆蓋或合併現有本地單字，是否確定？')) return;
    setIsLoading(true);
    try {
      saveGasUrl(gasUrl);
      const pulledWords = await pullWordsFromGas(gasUrl);
      if (pulledWords.length > 0) {
        await saveWordsBatch(pulledWords);
        onReloadWords();
        showStatus('success', `成功從 Google 試算表同步 ${pulledWords.length} 個單字！`);
      } else {
        showStatus('error', '試算表內目前無單字資料。');
      }
    } catch (err) {
      showStatus('error', err.message || '同步失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJsonImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result);
        if (json.words && Array.isArray(json.words)) {
          await saveWordsBatch(json.words);
          onReloadWords();
          showStatus('success', `成功從備份檔案匯入 ${json.words.length} 個單字！`);
        } else {
          showStatus('error', '檔案格式不符，未找到 words 欄位。');
        }
      } catch {
        showStatus('error', '無法解析 JSON 檔案。');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    if (confirm('確定要重置為預設多益高頻單字庫嗎？所有個人自訂進度將被重置。')) {
      await resetToDefault();
      onReloadWords();
      showStatus('success', '已成功重置為預設多益單字庫！');
    }
  };

  const handleAccentChange = (newAccent) => {
    setAccent(newAccent);
    setTTSConfig({ accent: newAccent, rate: speechRate });
  };

  const handleRateChange = (newRate) => {
    setSpeechRate(newRate);
    setTTSConfig({ accent, rate: newRate });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cozyDark-500/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden paper-shadow border border-cream-300 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200 bg-cream-50">
          <h2 className="text-lg font-bold text-latte-800 flex items-center gap-2">
            ⚙️ 系統設定與雲端同步
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-cozyDark-100 hover:text-cozyDark-400 hover:bg-cream-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Status Alert */}
          {statusMessage && (
            <div
              className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in ${
                statusMessage.type === 'success'
                  ? 'bg-sage-100 text-sage-700 border border-sage-200'
                  : 'bg-terracotta-100 text-terracotta-700 border border-terracotta-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Section 1: Google Sheets & GAS Sync */}
          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-300 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-latte-800 flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-latte-500" /> Google Sheets / GAS 雙向雲端同步
              </h3>
            </div>
            
            <p className="text-xs text-cozyDark-200">
              將單字與複習進度即時備份至您的專屬 Google 試算表（詳細請見 <code>gas/README.md</code> 教學）。
            </p>

            <div>
              <label className="block text-[11px] font-bold text-cozyDark-300 mb-1 uppercase">
                GAS Web App 網址 (URL)
              </label>
              <input
                type="text"
                value={gasUrl}
                onChange={(e) => setGasUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs font-mono text-cozyDark-400 focus:outline-none focus:ring-2 focus:ring-latte-400"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={handleTestConnection}
                disabled={isLoading || !gasUrl}
                className="py-2 px-2.5 bg-white hover:bg-cream-200 border border-cream-300 text-latte-700 rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
              >
                測試連線
              </button>
              <button
                onClick={handlePush}
                disabled={isLoading || !gasUrl}
                className="py-2 px-2.5 bg-latte-500 hover:bg-latte-600 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CloudUpload className="w-3.5 h-3.5" />}
                上傳備份
              </button>
              <button
                onClick={handlePull}
                disabled={isLoading || !gasUrl}
                className="py-2 px-2.5 bg-sage-500 hover:bg-sage-600 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1"
              >
                <CloudDownload className="w-3.5 h-3.5" /> 下載同步
              </button>
            </div>
          </div>

          {/* Section 2: Speech Synthesis Preference */}
          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-300 space-y-3">
            <h3 className="text-sm font-bold text-latte-800 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-latte-500" /> 語音朗讀偏好 (TTS)
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-cozyDark-200 mb-1">預設口音</label>
                <select
                  value={accent}
                  onChange={(e) => handleAccentChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs bg-white text-latte-800"
                >
                  <option value="en-US">🇺🇸 美式英語 (en-US)</option>
                  <option value="en-GB">🇬🇧 英式英語 (en-GB)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-cozyDark-200 mb-1">朗讀語速 ({speechRate}x)</label>
                <select
                  value={speechRate}
                  onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs bg-white text-latte-800"
                >
                  <option value="0.8">0.8x (清晰慢速)</option>
                  <option value="1.0">1.0x (標準速度)</option>
                  <option value="1.2">1.2x (多益聽力挑戰)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: JSON File Backup & Reset */}
          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-300 space-y-3">
            <h3 className="text-sm font-bold text-latte-800">本機備份與重置</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={exportToJSON}
                className="py-2.5 px-3 bg-white hover:bg-cream-200 border border-cream-300 rounded-xl text-xs font-semibold text-latte-700 flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-4 h-4" /> 匯出 JSON 備份檔
              </button>

              <label className="py-2.5 px-3 bg-white hover:bg-cream-200 border border-cream-300 rounded-xl text-xs font-semibold text-latte-700 flex items-center justify-center gap-1.5 transition cursor-pointer text-center">
                <Upload className="w-4 h-4" /> 匯入 JSON 備份
                <input type="file" accept=".json" onChange={handleJsonImport} className="hidden" />
              </label>
            </div>

            <div className="pt-2">
              <button
                onClick={handleReset}
                className="w-full py-2 px-3 border border-terracotta-200 bg-white hover:bg-terracotta-50 text-terracotta-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> 重置為預設多益單字庫
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
