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
    const matchesState =
      selectedState === 'ALL' ||
      (selectedState === 'due'
        ? w.dueDate <= new Date().toISOString().split('T')[0]
        : w.state === selectedState);

    return matchesSearch && matchesLevel && matchesState;
  });

  const handleDelete = async (id, wordStr) => {
    if (confirm(`確定要刪除「${wordStr}」嗎？`)) {
      await deleteWord(id);
      if (onWordDeleted) onWordDeleted(id);
    }
  };

  return (
    <div className="max-w-5xl lg:max-w-6xl mx-auto space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-cream-300 paper-shadow space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-cozyDark-200 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜尋單字、搭配詞或中文釋義..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 sm:py-3.5 rounded-2xl border border-cream-300 text-sm sm:text-base font-semibold text-latte-800 focus:outline-none focus:ring-2 focus:ring-latte-400 shadow-xs"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          {/* Level Filter */}
          <div className="flex items-center gap-1.5 bg-cream-100 p-1.5 rounded-2xl border border-cream-200">
            {[
              { id: 'ALL', label: '全部級別' },
              { id: 'L1', label: 'L1 (500+)' },
              { id: 'L2', label: 'L2 (650+)' },
              { id: 'L3', label: 'L3 (775+)' },
            ].map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => setSelectedLevel(lvl.id)}
                className={`px-3 sm:px-4 py-1.5 rounded-xl font-bold transition ${
                  selectedLevel === lvl.id
                    ? 'bg-latte-600 text-white shadow-xs'
                    : 'text-cozyDark-200 hover:text-latte-800'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>

          {/* State Filter */}
          <div className="flex items-center gap-1.5 bg-cream-100 p-1.5 rounded-2xl border border-cream-200">
            {[
              { id: 'ALL', label: '全部狀態' },
              { id: 'new', label: '新單字' },
              { id: 'learning', label: '學習中' },
              { id: 'mastered', label: '已掌握' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedState(st.id)}
                className={`px-3 sm:px-4 py-1.5 rounded-xl font-bold transition ${
                  selectedState === st.id
                    ? 'bg-latte-600 text-white shadow-xs'
                    : 'text-cozyDark-200 hover:text-latte-800'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Word Count */}
      <div className="flex justify-between items-center px-2 text-xs sm:text-sm text-cozyDark-200 font-bold">
        <span>顯示 {filteredWords.length} 個單字 (共 {words.length} 個)</span>
      </div>

      {/* Words Responsive Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {filteredWords.map((item) => {
          const isExpanded = expandedWordId === item.id;
          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-cream-300 paper-shadow hover:border-latte-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xl sm:text-2xl font-black text-latte-800 tracking-tight">
                      {item.word}
                    </span>
                    <span className="text-xs sm:text-sm font-mono text-cozyDark-200">{item.ipa}</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-cream-200 text-latte-700">
                      {item.pos}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-latte-100 text-latte-700 font-bold border border-latte-200">
                      {item.level || 'L2'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => speakText(item.word)}
                      className="p-2 sm:p-2.5 rounded-xl text-latte-600 hover:bg-latte-100 transition"
                      title="播放發音"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setExpandedWordId(isExpanded ? null : item.id)}
                      className="p-2 sm:p-2.5 rounded-xl text-latte-600 hover:bg-latte-100 transition"
                      title="展開/收合考點詳情"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.word)}
                      className="p-2 sm:p-2.5 rounded-xl text-terracotta-400 hover:text-terracotta-600 hover:bg-terracotta-50 transition"
                      title="刪除單字"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-cozyDark-300 mt-2 line-clamp-2 leading-relaxed">
                  "{item.simpleDefinition}"
                </p>

                {item.collocation && (
                  <p className="text-xs sm:text-sm font-bold text-amberGold-700 mt-2 bg-amberGold-50/70 p-2.5 rounded-xl border border-amberGold-200/60">
                    🔗 {item.collocation}
                  </p>
                )}
              </div>

              {/* Expanded Detail View */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-cream-200 text-xs sm:text-sm space-y-2.5 animate-fade-in bg-cream-50 p-4 rounded-2xl">
                  <div>
                    <span className="font-bold text-latte-700">繁中釋義：</span>
                    <strong className="text-latte-800 text-sm sm:text-base ml-1">{item.chinese}</strong>
                  </div>
                  {item.example && (
                    <div>
                      <span className="font-bold text-latte-700">商務例句：</span> {item.example}
                    </div>
                  )}
                  {item.exampleZh && (
                    <div className="text-cozyDark-300">
                      <span className="font-bold text-latte-700">例句翻譯：</span> {item.exampleZh}
                    </div>
                  )}
                  {item.toeicTip && (
                    <div className="text-amberGold-800 bg-white p-2.5 rounded-xl border border-amberGold-200/80">
                      💡 <span className="font-bold">多益考點：</span> {item.toeicTip}
                    </div>
                  )}
                  <div className="flex gap-4 text-xs text-cozyDark-200 pt-1 font-mono">
                    <span>複習次數: {item.repetition || 0}</span>
                    <span>間隔: {item.interval || 0}天</span>
                    <span>到期日: {item.dueDate || '尚未排程'}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredWords.length === 0 && (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-cream-300 text-sm text-cozyDark-200">
            查無相符單字，請嘗試切換篩選條件或點擊右上角新增單字！
          </div>
        )}
      </div>
    </div>
  );
}
