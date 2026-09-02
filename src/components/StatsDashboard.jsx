import React from 'react';
import { BookOpen, CheckCircle, Clock, Zap, BarChart2, Award, Calendar } from 'lucide-react';

export default function StatsDashboard({ stats, words = [], studyLogs = {} }) {
  const { total, dueToday, mastered, learning, newWords, predictedScore, masteryPercentage } = stats;

  const l1Count = words.filter((w) => w.level === 'L1').length;
  const l2Count = words.filter((w) => w.level === 'L2').length;
  const l3Count = words.filter((w) => w.level === 'L3').length;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl lg:max-w-6xl mx-auto">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white p-5 sm:p-7 rounded-3xl border border-cream-300 paper-shadow">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-latte-500 mb-2">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" /> 詞庫總量
          </div>
          <div className="text-3xl sm:text-4xl font-black text-latte-800">{total}</div>
          <div className="text-xs text-cozyDark-200 mt-1">累計單字數</div>
        </div>

        <div className="bg-white p-5 sm:p-7 rounded-3xl border border-amberGold-200 paper-shadow bg-amberGold-50/40">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-amberGold-600 mb-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" /> 今日待複習
          </div>
          <div className="text-3xl sm:text-4xl font-black text-amberGold-700">{dueToday}</div>
          <div className="text-xs text-amberGold-600 font-semibold mt-1">SM-2 智慧排程</div>
        </div>

        <div className="bg-white p-5 sm:p-7 rounded-3xl border border-sage-200 paper-shadow bg-sage-50/40">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-sage-600 mb-2">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> 已牢記掌握
          </div>
          <div className="text-3xl sm:text-4xl font-black text-sage-700">{mastered}</div>
          <div className="text-xs text-sage-600 font-semibold mt-1">熟練度 {masteryPercentage}%</div>
        </div>

        <div className="bg-white p-5 sm:p-7 rounded-3xl border border-latte-300 paper-shadow bg-latte-50/40">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-latte-600 mb-2">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5" /> 學習記憶中
          </div>
          <div className="text-3xl sm:text-4xl font-black text-latte-800">{learning}</div>
          <div className="text-xs text-latte-600 font-semibold mt-1">間隔重複中</div>
        </div>
      </div>

      {/* TOEIC Tier Breakdown */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-cream-300 paper-shadow space-y-6">
        <h3 className="text-base sm:text-lg font-black text-latte-800 flex items-center gap-2.5">
          <Award className="w-5 h-5 text-amberGold-500" /> 多益階梯分級詞彙掌握狀況
        </h3>

        <div className="space-y-5">
          {/* L1: 500+ */}
          <div>
            <div className="flex justify-between text-xs sm:text-sm font-bold mb-1.5">
              <span className="text-latte-700">L1 基礎商務核心 (500分必備)</span>
              <span className="text-cozyDark-200">{l1Count} 字</span>
            </div>
            <div className="w-full h-3 sm:h-3.5 bg-cream-200 rounded-full overflow-hidden">
              <div className="h-full bg-amberGold-400 rounded-full" style={{ width: `${Math.min(100, (l1Count / (total || 1)) * 100)}%` }} />
            </div>
          </div>

          {/* L2: 650+ */}
          <div>
            <div className="flex justify-between text-xs sm:text-sm font-bold mb-1.5">
              <span className="text-latte-700">L2 進階商務職場 (650分必備)</span>
              <span className="text-cozyDark-200">{l2Count} 字</span>
            </div>
            <div className="w-full h-3 sm:h-3.5 bg-cream-200 rounded-full overflow-hidden">
              <div className="h-full bg-latte-500 rounded-full" style={{ width: `${Math.min(100, (l2Count / (total || 1)) * 100)}%` }} />
            </div>
          </div>

          {/* L3: 775+ */}
          <div>
            <div className="flex justify-between text-xs sm:text-sm font-bold mb-1.5">
              <span className="text-latte-700">L3 高分衝刺陷阱 (775分必備)</span>
              <span className="text-cozyDark-200">{l3Count} 字</span>
            </div>
            <div className="w-full h-3 sm:h-3.5 bg-cream-200 rounded-full overflow-hidden">
              <div className="h-full bg-sage-500 rounded-full" style={{ width: `${Math.min(100, (l3Count / (total || 1)) * 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Study Tips Box */}
      <div className="p-6 sm:p-8 bg-latte-100/60 rounded-3xl border border-latte-200 text-xs sm:text-sm text-latte-800 leading-relaxed space-y-3 shadow-xs">
        <div className="font-black text-sm sm:text-base flex items-center gap-2 text-latte-800">
          💡 多益 350 → 775 高分自習守則
        </div>
        <ul className="list-disc list-inside space-y-1.5 text-cozyDark-400 font-medium">
          <li><strong>堅持英英思維</strong>：先看英語定義與情境，培養不經翻譯的瞬時反應力。</li>
          <li><strong>秒殺 Part 5 靠搭配詞</strong>：多複習黃金 Collocations，看到動詞立刻聯想對應介系詞。</li>
          <li><strong>每天複習 15~20 分鐘</strong>：SM-2 演算法會在您快忘記的黃金時間提醒您，持之以恆最關鍵。</li>
        </ul>
      </div>
    </div>
  );
}
