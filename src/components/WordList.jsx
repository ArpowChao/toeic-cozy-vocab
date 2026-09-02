import React, { useState } from 'react';
import { Search, Volume2, Trash2, Eye, Tag, Filter } from 'lucide-react';
import { speakText } from '../services/ttsService.js';
import { deleteWord } from '../services/storageService.js';

export default function WordList({ words = [], onWordDeleted }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedState, setSelectedState] = useState('ALL');
  const [expandedWordId, setExpandedWordId] = useState(null);

  const filteredWords = words.filter((w) => {
    const matchesSearch =
      w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.chinese.includes(searchTerm) ||
      (w.collocation && w.collocation.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLevel = selectedLevel === 'ALL' || w.level === selectedLevel;
    const matchesState = selectedState === 'ALL' || (selectedState === 'due' ? w.dueDate <= new Date().toISOString().split('T')[0] : w.state === selectedState);

    return matchesSearch && matchesLevel && matchesState;
  });

  const handleDelete = async (id, wordStr) => {
    if (confirm(`確定要刪除「${wordStr}」嗎？`)) {
      await deleteWord(id);
      if (onWordDeleted) onWordDeleted(id);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-cream-300 paper-shadow space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-cozyDark-100 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜尋單字、搭配詞或中文..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 text-xs font-semibold text-latte-800 focus:outline-none focus:ring-2 focus:ring-latte-400"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {/* Level Filter */}
          <div className="flex items-center gap-1 bg-cream-100 p-1 rounded-xl">
            {['ALL', 'L1', 'L2', 'L3'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  selectedLevel === lvl
                    ? 'bg-latte-500 text-white shadow-sm'
                    : 'text-cozyDark-200 hover:text-latte-700'
                }`}
              >
                {lvl === 'ALL' ? '全部級別' : lvl}
              </button>
            ))}
          </div>

          {/* State Filter */}
          <div className="flex items-center gap-1 bg-cream-100 p-1 rounded-xl">
            {[
              { id: 'ALL', label: '全部狀態' },
              { id: 'new', label: '新單字' },
              { id: 'learning', label: '學習中' },
              { id: 'mastered', label: '已掌握' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedState(st.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  selectedState === st.id
                    ? 'bg-latte-500 text-white shadow-sm'
                    : 'text-cozyDark-200 hover:text-latte-700'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Word Count */}
      <div className="flex justify-between items-center px-2 text-xs text-cozyDark-100 font-semibold">
        <span>顯示 {filteredWords.length} 個單字 (共 {words.length} 個)</span>
      </div>

      {/* Words List */}
      <div className="space-y-3">
        {filteredWords.map((item) => {
          const isExpanded = expandedWordId === item.id;
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 border border-cream-300/90 paper-shadow hover:border-latte-300 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-bold text-latte-800">{item.word}</span>
                    <span className="text-xs font-mono text-cozyDark-100">{item.ipa}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cream-200 text-latte-700">
                      {item.pos}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-latte-100 text-latte-600 font-semibold">
                      {item.level || 'L2'}
                    </span>
                  </div>

                  <p className="text-xs text-cozyDark-300 mt-1 line-clamp-2">
                    "{item.simpleDefinition}"
                  </p>

                  {item.collocation && (
                    <p className="text-xs font-semibold text-amberGold-600 mt-1">
                      🔗 {item.collocation}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => speakText(item.word)}
                    className="p-2 rounded-xl text-latte-600 hover:bg-latte-100 transition"
                    title="播放發音"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setExpandedWordId(isExpanded ? null : item.id)}
                    className="p-2 rounded-xl text-latte-600 hover:bg-latte-100 transition"
                    title="展開/收合考點詳情"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.word)}
                    className="p-2 rounded-xl text-terracotta-400 hover:text-terracotta-600 hover:bg-terracotta-50 transition"
                    title="刪除單字"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Detail View */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-cream-200 text-xs space-y-2 animate-fade-in bg-cream-50 p-3 rounded-xl">
                  <div>
                    <span className="font-bold text-latte-700">繁中釋義：</span> {item.chinese}
                  </div>
                  {item.example && (
                    <div>
                      <span className="font-bold text-latte-700">商務例句：</span> {item.example}
                    </div>
                  )}
                  {item.exampleZh && (
                    <div className="text-cozyDark-200">
                      <span className="font-bold text-latte-700">例句翻譯：</span> {item.exampleZh}
                    </div>
                  )}
                  {item.toeicTip && (
                    <div className="text-amberGold-700">
                      <span className="font-bold">多益重點：</span> {item.toeicTip}
                    </div>
                  )}
                  <div className="flex gap-4 text-[10px] text-cozyDark-100 pt-1 font-mono">
                    <span>複習次數: {item.repetition || 0}</span>
                    <span>間隔天數: {item.interval || 0}天</span>
                    <span>下次複習日: {item.dueDate || '尚未排程'}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredWords.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-cream-300 text-xs text-cozyDark-100">
            查無相符單字，請嘗試切換篩選條件或點擊右上角新增單字！
          </div>
        )}
      </div>
    </div>
  );
}
