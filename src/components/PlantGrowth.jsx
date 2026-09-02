import React from 'react';
import confetti from 'canvas-confetti';
import { Flame, Sparkles, Droplets, Trophy } from 'lucide-react';

const MOTIVATIONAL_QUOTES = [
  "Step by step, day by day! 每背一個單字，都是邁向 775 藍證的堅實腳印。",
  "Don't translate in your head! 讓英文在大腦中直接生根發芽。",
  "Small daily improvements over time lead to stunning results!",
  "多益閱讀要快，關鍵在於商務搭配詞的直覺反應！",
  "Great job today! 給你的自習小植物澆澆水吧 🌱",
];

export default function PlantGrowth({ stats, todayCompletedCount = 0, onWaterPlant }) {
  const predictedScore = stats?.predictedScore || 350;
  const quote = MOTIVATIONAL_QUOTES[Math.floor((predictedScore / 50) % MOTIVATIONAL_QUOTES.length)];

  // Determine Plant Stage & Emoji
  const getPlantStage = (score) => {
    if (score < 500) {
      return {
        stage: 1,
        title: '🌱 破土嫩芽 (基礎積累)',
        desc: '正在打下多益 500 分日常核心基礎',
        icon: '🌱',
        bg: 'from-amberGold-100 to-cream-100',
        textColor: 'text-amberGold-600',
      };
    } else if (score < 650) {
      return {
        stage: 2,
        title: '🌿 翠綠盆栽 (職場自如)',
        desc: '已掌握進階商務會議與合約詞彙',
        icon: '🌿',
        bg: 'from-sage-100 to-cream-100',
        textColor: 'text-sage-600',
      };
    } else if (score < 750) {
      return {
        stage: 3,
        title: '🌸 開花灌木 (衝刺準藍證)',
        desc: '熟悉商務高頻搭配詞與長篇閱讀',
        icon: '🌸',
        bg: 'from-latte-100 to-cream-100',
        textColor: 'text-latte-600',
      };
    } else {
      return {
        stage: 4,
        title: '🌳 茂盛金色常青樹 (多益藍證菁英)',
        desc: '恭喜！已具備多益 775+ 卓越商務語感',
        icon: '🌳',
        bg: 'from-amberGold-200 to-sage-100',
        textColor: 'text-latte-700',
      };
    }
  };

  const plantInfo = getPlantStage(predictedScore);

  const handleCelebrate = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#8C5E3C', '#E59866', '#5E937A', '#F39C12'],
    });
    if (onWaterPlant) onWaterPlant();
  };

  // Progress to 775
  const progressPercent = Math.min(100, Math.max(0, Math.round(((predictedScore - 350) / (775 - 350)) * 100)));

  return (
    <div className={`rounded-3xl p-6 bg-gradient-to-b ${plantInfo.bg} border border-cream-300 paper-shadow relative overflow-hidden transition-all duration-300`}>
      
      {/* Top Bar: Stage & Streak */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/90 text-latte-700 shadow-sm border border-cream-300 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amberGold-500" /> 多益成長花園
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amberGold-100 text-amberGold-700 text-xs font-bold border border-amberGold-300 shadow-sm">
          <Flame className="w-4 h-4 text-amberGold-600 animate-bounce" />
          <span>今日複習: {todayCompletedCount} 字</span>
        </div>
      </div>

      {/* Center Plant Graphic */}
      <div className="text-center my-4 relative">
        <div 
          onClick={handleCelebrate}
          className="inline-block text-6xl sm:text-7xl p-5 bg-white/80 rounded-full shadow-inner border border-cream-200/80 cursor-pointer hover:scale-110 active:scale-95 transition transform duration-200"
          title="點擊給小植物澆水成長！"
        >
          {plantInfo.icon}
        </div>
        <h3 className={`text-lg font-bold mt-3 ${plantInfo.textColor}`}>
          {plantInfo.title}
        </h3>
        <p className="text-xs text-cozyDark-200 mt-0.5">
          {plantInfo.desc}
        </p>
      </div>

      {/* Score Progress Bar (350 -> 775) */}
      <div className="mt-5 bg-white/90 p-4 rounded-2xl border border-cream-200 shadow-sm">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="text-cozyDark-200">當前預估：<strong className="text-latte-700 text-sm">{predictedScore}</strong> 分</span>
          <span className="text-latte-600 font-bold">目標：775 藍證</span>
        </div>
        
        <div className="w-full h-3.5 bg-cream-200 rounded-full overflow-hidden p-0.5 border border-cream-300">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amberGold-400 via-latte-500 to-sage-500 transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-cozyDark-100 font-mono mt-1.5">
          <span>起點 350分</span>
          <span>550 綠證</span>
          <span>目標 775 藍證 ({progressPercent}%)</span>
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="mt-4 p-3 bg-white/60 rounded-xl border border-cream-200 text-center">
        <p className="text-xs font-medium text-latte-700 italic">
          " {quote} "
        </p>
      </div>
    </div>
  );
}
