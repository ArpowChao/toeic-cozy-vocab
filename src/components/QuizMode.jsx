import React, { useState, useEffect } from 'react';
import { Volume2, Sparkles, CheckCircle2, XCircle, RotateCcw, ArrowRight, Award } from 'lucide-react';
import { speakText, soundEffects } from '../services/ttsService.js';
import confetti from 'canvas-confetti';

export default function QuizMode({ words = [], onCompleteQuiz }) {
  const [quizList, setQuizList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [quizType, setQuizType] = useState('choice'); // 'choice' | 'dictation'
  const [userInput, setUserInput] = useState('');

  useEffect(() => {
    startNewQuiz();
  }, [words]);

  const startNewQuiz = () => {
    if (!words || words.length === 0) return;
    // Shuffle and pick up to 10 words
    const shuffled = [...words].sort(() => 0.5 - Math.random()).slice(0, 10);
    setQuizList(shuffled);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
    setUserInput('');
  };

  const currentWord = quizList[currentIndex];

  // Generate 4 multiple choices for current word
  const generateChoices = () => {
    if (!currentWord) return [];
    const correct = currentWord;
    const others = words
      .filter((w) => w.id !== correct.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    return [correct, ...others].sort(() => 0.5 - Math.random());
  };

  const [choices, setChoices] = useState([]);
  useEffect(() => {
    if (currentWord && quizType === 'choice') {
      setChoices(generateChoices());
    }
  }, [currentWord, quizType]);

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

  if (!words || words.length < 4) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center max-w-md mx-auto paper-shadow border border-cream-300">
        <p className="text-sm font-semibold text-latte-700">
          單字庫單字數量不足（至少需 4 個單字），請先新增或匯入單字！
        </p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center max-w-md mx-auto paper-shadow border border-cream-300 space-y-5 animate-fade-in">
        <div className="w-16 h-16 bg-amberGold-100 rounded-full flex items-center justify-center mx-auto text-3xl">
          🏆
        </div>
        <h2 className="text-xl font-bold text-latte-800">測驗挑戰完成！</h2>
        
        <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
          <div className="text-xs text-cozyDark-200">本次測驗得分</div>
          <div className="text-3xl font-bold text-latte-700 mt-1">
            {score} / {quizList.length}
          </div>
          <div className="text-xs text-sage-600 font-semibold mt-1">
            正確率：{Math.round((score / quizList.length) * 100)}%
          </div>
        </div>

        <button
          onClick={startNewQuiz}
          className="w-full py-3 bg-latte-600 hover:bg-latte-700 text-white font-bold text-sm rounded-2xl shadow-sm transition flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> 再測驗一回
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Top Header: Progress & Mode Switch */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-cream-300 paper-shadow">
        <div className="flex items-center gap-1.5 text-xs font-bold text-latte-700">
          <Award className="w-4 h-4 text-amberGold-500" />
          <span>題數：{currentIndex + 1} / {quizList.length}</span>
        </div>

        <div className="flex bg-cream-100 p-1 rounded-xl text-xs font-semibold text-cozyDark-200">
          <button
            onClick={() => { setQuizType('choice'); setIsAnswered(false); }}
            className={`px-3 py-1 rounded-lg transition ${
              quizType === 'choice' ? 'bg-white text-latte-800 shadow-sm' : 'hover:text-latte-600'
            }`}
          >
            搭配詞 & 釋義四選一
          </button>
          <button
            onClick={() => { setQuizType('dictation'); setIsAnswered(false); }}
            className={`px-3 py-1 rounded-lg transition ${
              quizType === 'dictation' ? 'bg-white text-latte-800 shadow-sm' : 'hover:text-latte-600'
            }`}
          >
            聽音拼寫 (Dictation)
          </button>
        </div>
      </div>

      {/* Main Question Card */}
      {currentWord && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 paper-shadow border border-cream-300 space-y-6">
          {quizType === 'choice' ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-latte-500 uppercase tracking-wider">
                  Question: Target Concept
                </span>
                <button
                  onClick={() => speakText(currentWord.word)}
                  className="text-xs font-semibold text-latte-600 flex items-center gap-1 hover:underline"
                >
                  <Volume2 className="w-4 h-4" /> 聽目標單字發音
                </button>
              </div>

              {/* Collocation Clue */}
              <div className="p-4 bg-amberGold-50/60 rounded-2xl border border-amberGold-200/80 mb-3">
                <div className="text-xs font-bold text-amberGold-600 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> 多益常考搭配語境 (Collocation)：
                </div>
                <div className="text-base font-bold text-latte-800">
                  {currentWord.collocation.replace(new RegExp(currentWord.word, 'gi'), '_____')}
                </div>
              </div>

              {/* English Definition */}
              <div className="p-3 bg-cream-50 rounded-xl border border-cream-200 text-xs text-cozyDark-300">
                <strong className="text-latte-700">Simple English:</strong> "{currentWord.simpleDefinition}"
              </div>

              {/* 4 Choices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                {choices.map((choice) => {
                  let btnClass = 'bg-cream-50 hover:bg-cream-100 border-cream-300 text-latte-800';
                  if (isAnswered) {
                    if (choice.id === currentWord.id) {
                      btnClass = 'bg-sage-100 border-sage-400 text-sage-800 font-bold';
                    } else if (selectedOption?.id === choice.id) {
                      btnClass = 'bg-terracotta-100 border-terracotta-400 text-terracotta-800';
                    } else {
                      btnClass = 'opacity-40 border-cream-200';
                    }
                  }

                  return (
                    <button
                      key={choice.id}
                      onClick={() => handleSelectChoice(choice)}
                      disabled={isAnswered}
                      className={`p-4 rounded-2xl border text-sm font-semibold transition text-left flex items-center justify-between ${btnClass}`}
                    >
                      <span>{choice.word}</span>
                      {isAnswered && choice.id === currentWord.id && (
                        <CheckCircle2 className="w-4 h-4 text-sage-600 flex-shrink-0" />
                      )}
                      {isAnswered && selectedOption?.id === choice.id && choice.id !== currentWord.id && (
                        <XCircle className="w-4 h-4 text-terracotta-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Dictation Mode */
            <form onSubmit={handleCheckDictation} className="space-y-4">
              <div className="text-center py-4">
                <button
                  type="button"
                  onClick={() => speakText(currentWord.word)}
                  className="w-16 h-16 bg-latte-100 hover:bg-latte-200 text-latte-700 rounded-full flex items-center justify-center mx-auto shadow-sm transition active:scale-95"
                  title="點擊聽發音"
                >
                  <Volume2 className="w-7 h-7" />
                </button>
                <p className="text-xs text-cozyDark-200 mt-2">
                  點擊按鈕聆聽單字發音，並在下方輸入正確拼寫
                </p>
              </div>

              <div className="p-3 bg-cream-50 rounded-xl border border-cream-200 text-xs text-cozyDark-300 text-center">
                <strong>英英提示：</strong> "{currentWord.simpleDefinition}"
              </div>

              <input
                type="text"
                autoFocus
                disabled={isAnswered}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="輸入單字拼寫..."
                className="w-full text-center px-4 py-3 rounded-2xl border border-cream-300 text-base font-bold text-latte-800 focus:outline-none focus:ring-2 focus:ring-latte-400 font-mono"
              />

              {!isAnswered ? (
                <button
                  type="submit"
                  disabled={!userInput.trim()}
                  className="w-full py-3 bg-latte-600 hover:bg-latte-700 text-white font-bold text-sm rounded-2xl shadow-sm transition disabled:opacity-50"
                >
                  確認答案
                </button>
              ) : (
                <div className={`p-4 rounded-2xl text-center text-sm font-bold border ${
                  userInput.trim().toLowerCase() === currentWord.word.toLowerCase()
                    ? 'bg-sage-100 border-sage-300 text-sage-700'
                    : 'bg-terracotta-100 border-terracotta-300 text-terracotta-700'
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
                className="w-full py-3.5 bg-latte-600 hover:bg-latte-700 text-white font-bold text-sm rounded-2xl shadow-sm transition flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>下一題</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
