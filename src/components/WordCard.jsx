import React, { useState, useEffect } from 'react';
import { Volume2, Sparkles, Eye, EyeOff, BookOpen, Layers, ArrowRight, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { speakText, soundEffects } from '../services/ttsService.js';
import { RATING } from '../services/srsAlgorithm.js';
import PhoneticsGuideModal from './PhoneticsGuideModal.jsx';

export default function WordCard({ word, onRate, autoPlayAudio = true }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPhoneticsOpen, setIsPhoneticsOpen] = useState(false);

  // Reset reveal state when word changes
  useEffect(() => {
    setIsRevealed(false);
    if (autoPlayAudio && word?.word) {
      handlePronounce(word.word, 'en-US');
    }
  }, [word?.id]);

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        toggleReveal();
      } else if (e.key === '1') {
        handleRate(RATING.AGAIN);
      } else if (e.key === '2') {
        handleRate(RATING.HARD);
      } else if (e.key === '3') {
        handleRate(RATING.GOOD);
      } else if (e.key === '4') {
        handleRate(RATING.EASY);
      } else if (e.key === 'r' || e.key === 'R') {
        handlePronounce(word.word, 'en-US');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [word, isRevealed]);

  if (!word) return null;

  const toggleReveal = () => {
    soundEffects.playFlip();
    setIsRevealed((prev) => !prev);
  };

  const handlePronounce = async (text, accent = 'en-US', rate) => {
    setIsSpeaking(true);
    await speakText(text, accent, rate);
    setIsSpeaking(false);
  };

  const handleRate = (grade) => {
    if (grade >= RATING.GOOD) {
      soundEffects.playSuccess();
    } else {
      soundEffects.playAgain();
    }
    onRate(word, grade);
  };

  const getLevelBadge = (level) => {
    switch (level) {
      case 'L1':
        return { label: '500+ 基礎核心', bg: 'bg-amberGold-100 text-amberGold-700 border-amberGold-300' };
      case 'L2':
        return { label: '650+ 進階商務', bg: 'bg-latte-100 text-latte-700 border-latte-300' };
      case 'L3':
        return { label: '775+ 高分衝刺', bg: 'bg-sage-100 text-sage-700 border-sage-300' };
      default:
        return { label: '自訂生詞', bg: 'bg-cream-200 text-cozyDark-300 border-cream-300' };
    }
  };

  const badge = getLevelBadge(word.level);

  return (
    <div className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto transition-all duration-300">
      {/* Main Flashcard */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 paper-shadow border border-cream-300/80 relative overflow-hidden transition-all duration-300">
        
        {/* Top Meta Bar */}
        <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={`text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-full border shadow-sm ${badge.bg}`}>
              {badge.label}
            </span>
            {word.category && (
              <span className="text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full bg-cream-100 text-cozyDark-200 border border-cream-300">
                {word.category}
              </span>
            )}
          </div>

          {/* Quick Audio & Dictionary Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-cream-100 p-1.5 rounded-2xl border border-cream-200 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => handlePronounce(word.word, 'en-US')}
              className="text-xs sm:text-sm font-bold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white hover:bg-latte-100 text-latte-700 shadow-sm transition flex items-center gap-1 active:scale-95"
              title="美式標準發音 (按 R 鍵)"
            >
              <Volume2 className="w-3.5 h-3.5 text-latte-500" /> 🇺🇸 美音
            </button>
            <button
              onClick={() => handlePronounce(word.word, 'en-GB')}
              className="text-xs sm:text-sm font-bold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white hover:bg-latte-100 text-latte-700 shadow-sm transition flex items-center gap-1 active:scale-95"
              title="英式標準發音"
            >
              <Volume2 className="w-3.5 h-3.5 text-latte-500" /> 🇬🇧 英音
            </button>
            <button
              onClick={() => handlePronounce(word.word, 'en-US', 0.72)}
              className="text-xs sm:text-sm font-bold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-white hover:bg-amberGold-100 text-amberGold-800 shadow-sm transition flex items-center gap-1 active:scale-95"
              title="0.72x 慢速清晰朗讀"
            >
              <span>🐢 慢速</span>
            </button>
            <a
              href={`https://dictionary.cambridge.org/zht/%E8%A9%9E%E5%85%B8/%E8%8B%B1%E8%AA%9E-%E6%BC%A2%E8%AA%9E-%E7%B9%81%E9%AB%94/${encodeURIComponent(word.word)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm font-bold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-white hover:bg-latte-100 text-latte-700 shadow-sm transition flex items-center gap-1 active:scale-95"
              title="在劍橋詞典官方網站查閱詳細用法"
            >
              <ExternalLink className="w-3.5 h-3.5 text-latte-500" /> 劍橋
            </a>
          </div>
        </div>

        {/* Word Title & Phonetic */}
        <div className="text-center my-6 sm:my-8">
          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-latte-800 tracking-tight">
              {word.word}
            </h1>
            {word.pos && (
              <span className="text-base sm:text-lg font-bold italic text-latte-600 bg-latte-100/80 px-3 py-1 rounded-xl border border-latte-200">
                {word.pos}
              </span>
            )}
          </div>
          <div className="flex items-center justify-center gap-2.5 mt-2.5 flex-wrap">
            {word.ipa && (
              <span className="text-base sm:text-lg font-mono text-cozyDark-300">
                {word.ipa}
              </span>
            )}
            <button
              onClick={() => setIsPhoneticsOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl bg-cream-100 hover:bg-cream-200 text-latte-700 border border-cream-300 transition shadow-2xs cursor-pointer active:scale-95"
              title="查看 KK 音標 ⇄ 現代 IPA 對照手冊"
            >
              <BookOpen className="w-3 h-3 text-latte-500" />
              <span>KK 音標對照</span>
            </button>
          </div>
        </div>

        {/* Section 1: Simple English Definition (英英思維核心) */}
        <div className="mt-6 sm:mt-8 bg-cream-50 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-cream-200/80">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-latte-600 uppercase tracking-wider mb-2">
            <BookOpen className="w-4 h-4 sm:w-5 h-5 text-latte-500" /> Simple English Definition
          </div>
          {word.simpleDefinition?.trim() ? (
            <p className="text-base sm:text-xl text-cozyDark-400 leading-relaxed font-normal">
              "{word.simpleDefinition}"
            </p>
          ) : (
            <p className="text-sm sm:text-base text-cozyDark-200 italic leading-relaxed">
              （尚未設定英英定義，可於 Google 試算表編輯或展開下方中文考點）
            </p>
          )}
        </div>

        {/* Section 2: TOEIC Collocation (黃金搭配詞) */}
        {word.collocation && (
          <div className="mt-4 sm:mt-5 bg-amberGold-100/50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-amberGold-200/70">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-amberGold-700 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 sm:w-5 h-5 text-amberGold-600" /> TOEIC Collocation (常考搭配)
            </div>
            <p className="text-base sm:text-xl font-bold text-latte-800">
              {word.collocation}
            </p>
          </div>
        )}

        {/* Section 3: Business Example Context (商務情境例句) */}
        {word.example && (
          <div className="mt-4 sm:mt-5 bg-cream-100/70 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-cream-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-cozyDark-200 uppercase tracking-wider">
                <Layers className="w-4 h-4 sm:w-5 h-5 text-latte-500" /> Business Context Example
              </div>
              <button
                onClick={() => handlePronounce(word.example, 'en-US')}
                className="text-xs sm:text-sm text-latte-600 hover:text-latte-800 flex items-center gap-1.5 font-bold transition px-2 py-1 rounded-lg hover:bg-white"
                title="聆聽整句朗讀"
              >
                <Volume2 className="w-4 h-4" /> 朗讀例句
              </button>
            </div>
            <p className="text-sm sm:text-lg text-cozyDark-400 leading-relaxed italic">
              "{word.example}"
            </p>
          </div>
        )}

        {/* Section 4: Reveal on Demand (中文隨需展開遮罩) */}
        <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-cream-200">
          <button
            onClick={toggleReveal}
            className="w-full py-3 sm:py-4 px-5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 bg-cream-200/70 hover:bg-cream-200 text-latte-800 active:scale-[0.99] shadow-sm"
          >
            {isRevealed ? (
              <>
                <EyeOff className="w-4 h-4 sm:w-5 h-5 text-latte-600" /> 隱藏中文釋義 (按 Space 鍵)
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 sm:w-5 h-5 text-latte-600" /> 👁️ 點擊或按空白鍵 (Space) 展開繁中考點釋義
              </>
            )}
          </button>

          {/* Chinese Content (Animated Reveal) */}
          <div
            className={`transition-all duration-300 overflow-hidden ${
              isRevealed ? 'max-h-[600px] opacity-100 mt-5' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="bg-latte-100/50 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-latte-200 space-y-3.5 text-left">
              <div>
                <div className="text-xs sm:text-sm font-bold text-latte-600">繁體中文釋義：</div>
                <div className="text-lg sm:text-2xl font-bold text-latte-800 mt-0.5">{word.chinese}</div>
              </div>

              {word.exampleZh && (
                <div>
                  <div className="text-xs sm:text-sm font-bold text-latte-600">例句中文翻譯：</div>
                  <div className="text-sm sm:text-base text-cozyDark-300 mt-0.5">{word.exampleZh}</div>
                </div>
              )}

              {word.toeicTip && (
                <div className="bg-white/90 p-3.5 sm:p-4 rounded-2xl border border-latte-200/80 text-xs sm:text-sm text-latte-800 leading-relaxed shadow-sm">
                  💡 <span className="font-bold">多益應考要點：</span>{word.toeicTip}
                </div>
              )}

              {word.derivatives && (
                <div className="text-xs sm:text-sm text-cozyDark-300">
                  <span className="font-bold text-latte-600">詞性家族/衍生字：</span>{word.derivatives}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 5: SM-2 Spaced Repetition Rating Buttons */}
        <div className="mt-8 pt-6 border-t border-cream-300/80">
          <div className="text-center text-xs sm:text-sm font-semibold text-cozyDark-200 mb-4">
            依據記憶熟練度自評（可使用鍵盤數字鍵 1 ~ 4）
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* 1: Again */}
            <button
              onClick={() => handleRate(RATING.AGAIN)}
              className="py-3.5 sm:py-5 px-3 rounded-2xl border-2 border-terracotta-200 bg-terracotta-100/60 hover:bg-terracotta-200 text-terracotta-700 font-bold text-xs sm:text-base flex flex-col items-center justify-center gap-1 transition shadow-sm hover:shadow active:scale-95"
            >
              <span>1. 忘記</span>
              <span className="text-[10px] sm:text-xs font-normal opacity-80">10 分鐘後</span>
            </button>

            {/* 2: Hard */}
            <button
              onClick={() => handleRate(RATING.HARD)}
              className="py-3.5 sm:py-5 px-3 rounded-2xl border-2 border-amberGold-300 bg-amberGold-100 hover:bg-amberGold-200 text-amberGold-700 font-bold text-xs sm:text-base flex flex-col items-center justify-center gap-1 transition shadow-sm hover:shadow active:scale-95"
            >
              <span>2. 困難</span>
              <span className="text-[10px] sm:text-xs font-normal opacity-80">1 天後</span>
            </button>

            {/* 3: Good */}
            <button
              onClick={() => handleRate(RATING.GOOD)}
              className="py-3.5 sm:py-5 px-3 rounded-2xl border-2 border-latte-300 bg-latte-100 hover:bg-latte-200 text-latte-800 font-bold text-xs sm:text-base flex flex-col items-center justify-center gap-1 transition shadow-sm hover:shadow active:scale-95"
            >
              <span>3. 良好</span>
              <span className="text-[10px] sm:text-xs font-normal opacity-80">3 天後</span>
            </button>

            {/* 4: Easy */}
            <button
              onClick={() => handleRate(RATING.EASY)}
              className="py-3.5 sm:py-5 px-3 rounded-2xl border-2 border-sage-300 bg-sage-100 hover:bg-sage-200 text-sage-700 font-bold text-xs sm:text-base flex flex-col items-center justify-center gap-1 transition shadow-sm hover:shadow active:scale-95"
            >
              <span>4. 簡單</span>
              <span className="text-[10px] sm:text-xs font-normal opacity-80">6 天後</span>
            </button>
          </div>
        </div>
      </div>

      {/* Phonetics Guide Modal (KK ⇄ IPA) */}
      <PhoneticsGuideModal
        isOpen={isPhoneticsOpen}
        onClose={() => setIsPhoneticsOpen(false)}
      />
    </div>
  );
}
