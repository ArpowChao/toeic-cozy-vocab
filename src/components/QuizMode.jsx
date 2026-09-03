import React, { useState, useEffect } from 'react';
import { Volume2, Sparkles, CheckCircle2, XCircle, RotateCcw, ArrowRight, Award } from 'lucide-react';
import { speakText, soundEffects } from '../services/ttsService.js';
import { buildChoiceClue, buildChoices, buildQuizTargets, isCustomWord } from '../services/quizService.js';
import confetti from 'canvas-confetti';

export default function QuizMode({ words = [], onCompleteQuiz }) {
  const [quizList, setQuizList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [quizType, setQuizType] = useState('choice'); // 'choice' | 'dictation'
  const [quizScope, setQuizScope] = useState('all'); // 'all' | 'custom' | 'builtin'
  const [userInput, setUserInput] = useState('');

  useEffect(() => {
    startNewQuiz();
  }, [words, quizScope, quizType]);

  const startNewQuiz = () => {
    if (!words || words.length === 0) return;
    setQuizList(buildQuizTargets(words, { scope: quizScope, quizType }));
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
    setUserInput('');
  };

  const currentWord = quizList[currentIndex];
  const currentClue = buildChoiceClue(currentWord);
  const customWordCount = words.filter(isCustomWord).length;

  const [choices, setChoices] = useState([]);
  useEffect(() => {
    if (currentWord && quizType === 'choice') {
      setChoices(buildChoices(currentWord, words));
    }
  }, [currentWord, quizType, words]);

  const handleSelectChoice = (choice) => {
    if (isAnswered) return;
    setSelectedOption(choice);
    setIsAnswered(true);

    const isCorrect = choice.id === currentWord.id;
    if (isCorrect) {
      soundEffects.playSuccess();
      setScore((prev) => prev + 1);
    } else {
      soundEffects.playAgain();
    }
  };

  const handleCheckDictation = (e) => {
    e?.preventDefault();
    if (isAnswered) return;
    setIsAnswered(true);

    const isCorrect = userInput.trim().toLowerCase() === currentWord.word.toLowerCase();
    if (isCorrect) {
      soundEffects.playSuccess();
      setScore((prev) => prev + 1);
    } else {
      soundEffects.playAgain();
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < quizList.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setUserInput('');
    } else {
      setIsFinished(true);
      if (score >= 7) {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
      if (onCompleteQuiz) onCompleteQuiz(score);
    }
  };

  if (!words || words.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center max-w-xl mx-auto paper-shadow border border-cream-300">
        <p className="text-base font-bold text-latte-700">
          單字庫目前沒有單字，請先新增或匯入單字！
        </p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="bg-white rounded-3xl p-10 sm:p-14 text-center max-w-xl mx-auto paper-shadow border border-cream-300 space-y-6 animate-fade-in">
        <div className="w-20 h-20 bg-amberGold-100 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">
          🏆
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-latte-800">測驗挑戰完成！</h2>
        
        <div className="p-6 bg-cream-50 rounded-3xl border border-cream-200 space-y-1">
          <div className="text-xs sm:text-sm font-semibold text-cozyDark-200">本次測驗得分</div>
          <div className="text-4xl sm:text-5xl font-black text-latte-800">
            {score} / {quizList.length}
          </div>
          <div className="text-sm font-bold text-sage-600 pt-1">
            正確率：{Math.round((score / quizList.length) * 100)}%
          </div>
        </div>

        <button
          onClick={startNewQuiz}
          className="w-full py-4 bg-latte-600 hover:bg-latte-700 text-white font-bold text-base rounded-2xl shadow-sm transition flex items-center justify-center gap-2 active:scale-98"
        >
          <RotateCcw className="w-5 h-5" /> 再測驗一回
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto space-y-6">
      {/* Top Header: Progress & Mode Switch */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-cream-300 paper-shadow">
        <div className="flex items-center gap-2 text-sm sm:text-base font-black text-latte-800">
          <Award className="w-5 h-5 text-amberGold-500" />
          <span>進度：{currentIndex + 1} / {quizList.length}</span>
        </div>

        <div className="flex bg-cream-100 p-1.5 rounded-2xl text-xs sm:text-sm font-bold text-cozyDark-200">
          <button
            onClick={() => { setQuizType('choice'); setIsAnswered(false); }}
            className={`px-3.5 sm:px-4 py-1.5 rounded-xl transition ${
              quizType === 'choice' ? 'bg-white text-latte-800 shadow-sm' : 'hover:text-latte-600'
            }`}
          >
            搭配詞 & 釋義四選一
          </button>
          <button
            onClick={() => { setQuizType('dictation'); setIsAnswered(false); }}
            className={`px-3.5 sm:px-4 py-1.5 rounded-xl transition ${
              quizType === 'dictation' ? 'bg-white text-latte-800 shadow-sm' : 'hover:text-latte-600'
            }`}
          >
            聽音拼寫 (Dictation)
          </button>
        </div>

        <div className="w-full pt-3 border-t border-cream-200 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-cozyDark-200 mr-1">出題範圍：</span>
          {[
            { id: 'all', label: `全部 (${words.length})` },
            { id: 'custom', label: `我的匯入 (${customWordCount})` },
            { id: 'builtin', label: `內建 (${words.length - customWordCount})` },
          ].map((scope) => (
            <button
              key={scope.id}
              onClick={() => setQuizScope(scope.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                quizScope === scope.id
                  ? 'bg-latte-600 text-white shadow-sm'
                  : 'bg-cream-100 text-latte-700 hover:bg-cream-200'
              }`}
            >
              {scope.label}
            </button>
          ))}
        </div>
      </div>

      {quizList.length === 0 && (
        <div className="bg-white rounded-3xl p-8 text-center paper-shadow border border-cream-300 space-y-2">
          <p className="font-black text-latte-800">這個範圍目前沒有可用題目</p>
          <p className="text-sm text-cozyDark-200">
            {quizScope === 'custom' && quizType === 'choice'
              ? '匯入單字需要英英定義、搭配詞或例句，才能產生選擇題；你也可以切換成聽音拼寫。'
              : '請改選其他出題範圍或新增單字。'}
          </p>
        </div>
      )}

      {/* Main Question Card */}
      {currentWord && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 paper-shadow border border-cream-300 space-y-6 sm:space-y-8">
          {quizType === 'choice' ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs sm:text-sm font-extrabold text-latte-500 uppercase tracking-wider">
                  Target Concept & Context
                </span>
                {!isAnswered ? (
                  currentClue && (
                    <button
                      onClick={() => speakText(currentClue.text)}
                      className="text-xs sm:text-sm font-bold text-latte-600 flex items-center gap-1.5 hover:underline px-2.5 py-1 rounded-xl hover:bg-cream-100"
                      title="朗讀題幹語境"
                    >
                      <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-latte-500" /> 朗讀題幹語境
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => speakText(currentWord.word)}
                    className="text-xs sm:text-sm font-bold text-latte-600 flex items-center gap-1.5 hover:underline px-2.5 py-1 rounded-xl hover:bg-cream-100 animate-fade-in"
                    title="聽單字發音"
                  >
                    <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-latte-500" /> 聽正確發音 ({currentWord.word})
                  </button>
                )}
              </div>

              {/* Best available clue: collocation, example, then definition */}
              {currentClue && (
                <div className="p-5 sm:p-7 bg-amberGold-50/70 rounded-3xl border border-amberGold-200 mb-4">
                  <div className="text-xs sm:text-sm font-black text-amberGold-700 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amberGold-600" /> {currentClue.label}：
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-latte-800 leading-relaxed">
                    {currentClue.text}
                  </div>
                </div>
              )}

              {/* 4 Choices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                {choices.map((choice) => {
                  let btnClass = 'bg-cream-50 hover:bg-cream-100 border-2 border-cream-300 text-latte-800';
                  if (isAnswered) {
                    if (choice.id === currentWord.id) {
                      btnClass = 'bg-sage-100 border-2 border-sage-500 text-sage-800 font-black';
                    } else if (selectedOption?.id === choice.id) {
                      btnClass = 'bg-terracotta-100 border-2 border-terracotta-400 text-terracotta-800';
                    } else {
                      btnClass = 'opacity-40 border-cream-200';
                    }
                  }

                  return (
                    <button
                      key={choice.id}
                      onClick={() => handleSelectChoice(choice)}
                      disabled={isAnswered}
                      className={`p-5 sm:p-6 rounded-2xl sm:rounded-3xl text-base sm:text-lg font-bold transition text-left flex items-center justify-between shadow-xs ${btnClass}`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{choice.word}</span>
                        {choice.pos && (
                          <span className="text-xs font-mono opacity-60">({choice.pos})</span>
                        )}
                      </div>
                      {isAnswered && choice.id === currentWord.id && (
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-sage-600 flex-shrink-0" />
                      )}
                      {isAnswered && selectedOption?.id === choice.id && choice.id !== currentWord.id && (
                        <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-terracotta-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Learning Card (Only shown AFTER answering) */}
              {isAnswered && (
                <div className="mt-6 p-5 sm:p-6 bg-cream-50 rounded-2xl border border-cream-300 space-y-2.5 animate-fade-in text-xs sm:text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-latte-700 uppercase tracking-wider">💡 題解核心 (Answer Details)</span>
                    <span className="font-mono text-cozyDark-200">{currentWord.ipa}</span>
                  </div>
                  <div>
                    <strong className="text-latte-800 text-sm sm:text-base font-black">{currentWord.word}</strong>
                    {currentWord.pos && (
                      <span className="ml-1.5 font-bold italic text-latte-600 bg-latte-100 px-2 py-0.5 rounded-md">
                        {currentWord.pos}
                      </span>
                    )}
                    {currentWord.chinese && (
                      <span className="ml-2 font-bold text-latte-800">：{currentWord.chinese}</span>
                    )}
                  </div>
                  {currentWord.simpleDefinition && (
                    <div className="text-cozyDark-400">
                      <strong className="text-latte-700">英英釋義：</strong>"{currentWord.simpleDefinition}"
                    </div>
                  )}
                  {currentWord.exampleZh && (
                    <div className="text-cozyDark-300">
                      <strong className="text-latte-700">例句翻譯：</strong>{currentWord.exampleZh}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Dictation Mode */
            <form onSubmit={handleCheckDictation} className="space-y-6">
              <div className="text-center py-4 sm:py-6">
                <button
                  type="button"
                  onClick={() => speakText(currentWord.word)}
                  className="w-20 h-20 sm:w-24 sm:h-24 bg-latte-100 hover:bg-latte-200 text-latte-700 rounded-full flex items-center justify-center mx-auto shadow-sm transition active:scale-95"
                  title="點擊聽發音"
                >
                  <Volume2 className="w-9 h-9 sm:w-11 sm:h-11" />
                </button>
                <p className="text-xs sm:text-sm text-cozyDark-200 mt-3 font-semibold">
                  點擊按鈕聆聽單字發音，並在下方輸入正確拼寫
                </p>
              </div>

              {currentWord.simpleDefinition && <div className="p-4 sm:p-5 bg-cream-50 rounded-2xl border border-cream-200 text-xs sm:text-base text-cozyDark-300 text-center">
                <strong>英英提示：</strong> "{currentWord.simpleDefinition}"
              </div>}

              <input
                type="text"
                autoFocus
                disabled={isAnswered}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="輸入單字拼寫..."
                className="w-full text-center px-5 py-4 sm:py-5 rounded-2xl sm:rounded-3xl border-2 border-cream-300 text-lg sm:text-2xl font-black text-latte-800 focus:outline-none focus:ring-2 focus:ring-latte-400 font-mono shadow-inner"
              />

              {!isAnswered ? (
                <button
                  type="submit"
                  disabled={!userInput.trim()}
                  className="w-full py-4 sm:py-5 bg-latte-600 hover:bg-latte-700 text-white font-black text-base sm:text-lg rounded-2xl sm:rounded-3xl shadow-sm transition disabled:opacity-50"
                >
                  確認答案
                </button>
              ) : (
                <div className={`p-5 rounded-2xl sm:rounded-3xl text-center text-base sm:text-xl font-black border-2 ${
                  userInput.trim().toLowerCase() === currentWord.word.toLowerCase()
                    ? 'bg-sage-100 border-sage-300 text-sage-800'
                    : 'bg-terracotta-100 border-terracotta-300 text-terracotta-800'
                }`}>
                  {userInput.trim().toLowerCase() === currentWord.word.toLowerCase()
                    ? '🎉 拼寫完全正確！'
                    : `❌ 正確拼寫為：${currentWord.word}`}
                </div>
              )}
            </form>
          )}

          {/* Next Button */}
          {isAnswered && (
            <div className="pt-2">
              <button
                onClick={handleNext}
                className="w-full py-4 sm:py-5 bg-latte-600 hover:bg-latte-700 text-white font-black text-base sm:text-lg rounded-2xl sm:rounded-3xl shadow-sm transition flex items-center justify-center gap-2 active:scale-98"
              >
                <span>下一題</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
