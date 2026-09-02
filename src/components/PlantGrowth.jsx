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
        title: '🌱 破土嫩芽 (基礎積累階段)',
        desc: '正在打下多益 500 分日常核心基礎詞彙',
        icon: '🌱',
        bg: 'from-amberGold-100/90 via-cream-50 to-cream-100',
        textColor: 'text-amberGold-700',
      };
    } else if (score < 650) {
      return {
        stage: 2,
        title: '🌿 翠綠盆栽 (職場自如階段)',
        desc: '已掌握進階商務會議、合約談判與採購詞彙',
        icon: '🌿',
        bg: 'from-sage-100/90 via-cream-50 to-cream-100',
        textColor: 'text-sage-700',
      };
    } else if (score < 750) {
      return {
        stage: 3,
        title: '🌸 開花灌木 (衝刺準藍證階段)',
        desc: '熟悉高頻商務搭配詞與長篇雙篇閱讀解析',
        icon: '🌸',
        bg: 'from-latte-100/90 via-cream-50 to-cream-100',
        textColor: 'text-latte-700',
      };
    } else {
      return {
        stage: 4,
        title: '🌳 茂盛金色常青樹 (多益藍證菁英)',
        desc: '恭喜！已具備多益 775+ 卓越商務直覺語感',
        icon: '🌳',
        bg: 'from-amberGold-200 via-cream-50 to-sage-100',
        textColor: 'text-latte-800',
      };
    }
  };

  const plantInfo = getPlantStage(predictedScore);

  const handleCelebrate = () => {
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#8C5E3C', '#E59866', '#5E937A', '#F39C12'],
    });
    if (onWaterPlant) onWaterPlant();
  };

  // Progress to 775
  const progressPercent = Math.min(100, Math.max(0, Math.round(((predictedScore - 350) / (775 - 350)) * 100)));

  return (
    <div className={`rounded-3xl p-6 sm:p-10 lg:p-12 bg-gradient-to-b ${plantInfo.bg} border border-cream-300 paper-shadow relative overflow-hidden transition-all duration-300`}>
      
      {/* Top Bar: Stage & Streak */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-black px-4 py-2 rounded-full bg-white/95 text-latte-800 shadow-xs border border-cream-300 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amberGold-500" /> 多益成長花園
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amberGold-100 text-amberGold-800 text-xs sm:text-sm font-black border border-amberGold-300 shadow-xs">
          <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-amberGold-600 animate-bounce" />
          <span>今日複習: {todayCompletedCount} 字</span>
        </div>
      </div>

      {/* Center Plant Graphic */}
      <div className="text-center my-6 sm:my-8 relative">
        <div 
          onClick={handleCelebrate}
          className="inline-block text-7xl sm:text-8xl lg:text-9xl p-6 sm:p-8 bg-white/90 rounded-full shadow-inner border border-cream-200 cursor-pointer hover:scale-110 active:scale-95 transition transform duration-200"
          title="點擊給小植物澆水成長！"
        >
          {plantInfo.icon}
        </div>
        <h3 className={`text-xl sm:text-2xl lg:text-3xl font-black mt-4 sm:mt-5 ${plantInfo.textColor}`}>
          {plantInfo.title}
        </h3>
        <p className="text-xs sm:text-base text-cozyDark-200 mt-1 font-semibold">
          {plantInfo.desc}
        </p>
      </div>

      {/* Score Progress Bar (350 -> 775) */}
      <div className="mt-8 bg-white/95 p-5 sm:p-8 rounded-3xl border border-cream-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs sm:text-base font-black">
          <span className="text-cozyDark-200">當前預估：<strong className="text-latte-800 text-base sm:text-xl">{predictedScore}</strong> 分</span>
          <span className="text-latte-700 font-extrabold">目標：775 藍證</span>
        </div>
        
        <div className="w-full h-4 sm:h-5 bg-cream-200 rounded-full overflow-hidden p-0.5 border border-cream-300">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amberGold-400 via-latte-500 to-sage-500 transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] sm:text-xs text-cozyDark-200 font-mono font-bold pt-1">
          <span>起點 350分</span>
          <span>550 綠證</span>
          <span>目標 775 藍證 ({progressPercent}%)</span>
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="mt-6 p-4 sm:p-5 bg-white/80 rounded-2xl border border-cream-200 text-center shadow-xs">
        <p className="text-xs sm:text-base font-bold text-latte-700 italic">
          " {quote} "
        </p>
      </div>
    </div>
  );
}
