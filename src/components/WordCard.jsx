import React, { useState, useEffect } from 'react';
import { Volume2, Sparkles, Eye, EyeOff, BookOpen, Layers, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { speakText, soundEffects } from '../services/ttsService.js';
import { RATING } from '../services/srsAlgorithm.js';

export default function WordCard({ word, onRate, autoPlayAudio = true }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

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
      } else if (e.key.toLowerCase() === 'r') {
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

  const handlePronounce = async (text, accent = 'en-US') => {
    setIsSpeaking(true);
    await speakText(text, accent);
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
        return { label: '500+ 基礎核心', bg: 'bg-amberGold-100 text-amberGold-600 border-amberGold-200' };
      case 'L2':
        return { label: '650+ 進階商務', bg: 'bg-latte-100 text-latte-600 border-latte-200' };
      case 'L3':
        return { label: '775+ 高分衝刺', bg: 'bg-sage-100 text-sage-600 border-sage-200' };
      default:
        return { label: '自訂生詞', bg: 'bg-cream-200 text-cozyDark-200 border-cream-300' };
    }
  };

  const badge = getLevelBadge(word.level);

  return (
    <div className="w-full max-w-xl mx-auto transition-all duration-300">
      {/* Main Flashcard */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 paper-shadow border border-cream-300/80 relative overflow-hidden transition-all duration-300">
        
        {/* Top Meta Bar */}
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badge.bg}`}>
              {badge.label}
            </span>
            {word.category && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-cream-100 text-cozyDark-100 border border-cream-300">
                {word.category}
              </span>
            )}
          </div>

          {/* Quick Audio Controls */}
          <div className="flex items-center gap-1.5 bg-cream-100 p-1 rounded-2xl border border-cream-200">
            <button
              onClick={() => handlePronounce(word.word, 'en-US')}
              className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-white hover:bg-latte-100 text-latte-600 shadow-sm transition flex items-center gap-1 active:scale-95"
              title="美式發音 (Press R)"
            >
              <Volume2 className="w-3.5 h-3.5" /> 🇺🇸 美音
            </button>
            <button
              onClick={() => handlePronounce(word.word, 'en-GB')}
              className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-white hover:bg-latte-100 text-latte-600 shadow-sm transition flex items-center gap-1 active:scale-95"
              title="英式發音"
            >
              <Volume2 className="w-3.5 h-3.5" /> 🇬🇧 英音
            </button>
          </div>
        </div>

        {/* Word Title & Phonetic */}
        <div className="text-center my-4">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-latte-800 tracking-tight">
              {word.word}
            </h1>
            {word.pos && (
              <span className="text-sm font-semibold italic text-latte-500 bg-latte-100 px-2 py-0.5 rounded-md">
                {word.pos}
              </span>
            )}
          </div>
          {word.ipa && (
            <p className="text-sm font-mono text-cozyDark-100 mt-1">
              {word.ipa}
            </p>
          )}
        </div>

        {/* Section 1: Simple English Definition (英英思維核心) */}
        <div className="mt-6 bg-cream-50 rounded-2xl p-4 border border-cream-200/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-latte-500 uppercase tracking-wider mb-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Simple English Definition
          </div>
          <p className="text-base text-cozyDark-400 leading-relaxed font-normal">
            "{word.simpleDefinition}"
          </p>
        </div>

        {/* Section 2: TOEIC Collocation (黃金搭配詞) */}
        {word.collocation && (
          <div className="mt-3.5 bg-amberGold-100/50 rounded-2xl p-4 border border-amberGold-200/60">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amberGold-600 uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3.5 h-3.5" /> TOEIC Collocation (常考搭配)
            </div>
            <p className="text-sm sm:text-base font-semibold text-latte-700">
              {word.collocation}
            </p>
          </div>
        )}

        {/* Section 3: Business Example Context (商務情境例句) */}
        {word.example && (
          <div className="mt-3.5 bg-cream-100/60 rounded-2xl p-4 border border-cream-200/60">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cozyDark-100 uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5" /> Business Context Example
              </div>
              <button
                onClick={() => handlePronounce(word.example, 'en-US')}
                className="text-xs text-latte-500 hover:text-latte-700 flex items-center gap-1 font-medium transition"
                title="聆聽整句朗讀"
              >
                <Volume2 className="w-3.5 h-3.5" /> 朗讀例句
              </button>
            </div>
            <p className="text-sm text-cozyDark-300 leading-relaxed italic">
              "{word.example}"
            </p>
          </div>
        )}

        {/* Section 4: Reveal on Demand (中文隨需展開遮罩) */}
        <div className="mt-5 pt-4 border-t border-cream-200">
          <button
            onClick={toggleReveal}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 bg-cream-200/60 hover:bg-cream-200 text-latte-700 active:scale-[0.99]"
          >
            {isRevealed ? (
              <>
                <EyeOff className="w-4 h-4 text-latte-500" /> 隱藏中文釋義 (按 Space 鍵)
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-latte-500" /> 👁️ 點擊或按空白鍵 (Space) 展開繁中考點釋義
              </>
            )}
          </button>

          {/* Chinese Content (Animated Reveal) */}
          <div
            className={`transition-all duration-300 overflow-hidden ${
              isRevealed ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="bg-latte-100/40 rounded-2xl p-4 border border-latte-200 space-y-2.5 text-left">
              <div>
                <div className="text-xs font-bold text-latte-600">繁體中文釋義：</div>
                <div className="text-base font-bold text-latte-800">{word.chinese}</div>
              </div>

              {word.exampleZh && (
                <div>
                  <div className="text-xs font-bold text-latte-600">例句中文翻譯：</div>
                  <div className="text-xs text-cozyDark-300">{word.exampleZh}</div>
                </div>
              )}

              {word.toeicTip && (
                <div className="bg-white/80 p-2.5 rounded-xl border border-latte-200/60 text-xs text-latte-700 leading-relaxed">
                  💡 <span className="font-semibold">多益應考要點：</span>{word.toeicTip}
                </div>
              )}

              {word.derivatives && (
                <div className="text-xs text-cozyDark-200">
                  <span className="font-semibold text-latte-600">詞性家族/衍生字：</span>{word.derivatives}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 5: SM-2 Spaced Repetition Rating Buttons */}
        <div className="mt-6 pt-5 border-t border-cream-300/80">
          <div className="text-center text-xs font-medium text-cozyDark-100 mb-3">
            依據記憶熟練度自評（可使用數字鍵 1 ~ 4）
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* 1: Again */}
            <button
              onClick={() => handleRate(RATING.AGAIN)}
              className="py-3 px-2 rounded-2xl border border-terracotta-200 bg-terracotta-100/60 hover:bg-terracotta-200 text-terracotta-600 font-semibold text-xs sm:text-sm flex flex-col items-center justify-center gap-1 transition shadow-sm hover:shadow active:scale-95"
            >
              <div className="flex items-center gap-1">
                <span>1. 忘記</span>
              </div>
              <span className="text-[10px] font-normal opacity-80">10 分鐘後</span>
            </button>

            {/* 2: Hard */}
            <button
              onClick={() => handleRate(RATING.HARD)}
              className="py-3 px-2 rounded-2xl border border-amberGold-300 bg-amberGold-100 hover:bg-amberGold-200 text-amberGold-600 font-semibold text-xs sm:text-sm flex flex-col items-center justify-center gap-1 transition shadow-sm hover:shadow active:scale-95"
            >
              <div className="flex items-center gap-1">
                <span>2. 困難</span>
              </div>
              <span className="text-[10px] font-normal opacity-80">1 天後</span>
            </button>

            {/* 3: Good */}
            <button
              onClick={() => handleRate(RATING.GOOD)}
              className="py-3 px-2 rounded-2xl border border-latte-300 bg-latte-100 hover:bg-latte-200 text-latte-700 font-semibold text-xs sm:text-sm flex flex-col items-center justify-center gap-1 transition shadow-sm hover:shadow active:scale-95"
            >
              <div className="flex items-center gap-1">
                <span>3. 良好</span>
              </div>
              <span className="text-[10px] font-normal opacity-80">3 天後</span>
            </button>

            {/* 4: Easy */}
            <button
              onClick={() => handleRate(RATING.EASY)}
              className="py-3 px-2 rounded-2xl border border-sage-300 bg-sage-100 hover:bg-sage-200 text-sage-600 font-semibold text-xs sm:text-sm flex flex-col items-center justify-center gap-1 transition shadow-sm hover:shadow active:scale-95"
            >
              <div className="flex items-center gap-1">
                <span>4. 簡單</span>
              </div>
              <span className="text-[10px] font-normal opacity-80">6 天後</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
