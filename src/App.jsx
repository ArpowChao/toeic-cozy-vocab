import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import WordCard from './components/WordCard.jsx';
import AddWordModal from './components/AddWordModal.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import PlantGrowth from './components/PlantGrowth.jsx';
import StatsDashboard from './components/StatsDashboard.jsx';
import QuizMode from './components/QuizMode.jsx';
import WordList from './components/WordList.jsx';

import {
  initStorage,
  getAllWords,
  saveWord,
  recordStudyActivity,
  getStudyLogs,
} from './services/storageService.js';
import {
  calculateNextReview,
  filterDueWords,
  calculateLearningStats,
} from './services/srsAlgorithm.js';
import confetti from 'canvas-confetti';
import { Sparkles, CheckCircle2, RotateCcw, Plus, Flame } from 'lucide-react';

export default function App() {
  const [words, setWords] = useState([]);
  const [studyLogs, setStudyLogs] = useState({});
  const [activeTab, setActiveTab] = useState('study'); // 'study' | 'quiz' | 'list' | 'garden'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [todayCompletedCount, setTodayCompletedCount] = useState(0);

  // Load initial words and logs from IndexedDB
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loadedWords = await initStorage();
    setWords(loadedWords);
    const logs = await getStudyLogs();
    setStudyLogs(logs);
    const todayStr = new Date().toISOString().split('T')[0];
    setTodayCompletedCount(logs[todayStr] || 0);
  };

  // Filter due words for today's review session
  const dueWords = filterDueWords(words);
  const currentWord = dueWords.length > 0 ? dueWords[0] : null;

  // Compute overall stats
  const stats = calculateLearningStats(words, studyLogs);

  // Handle SM-2 rating on WordCard
  const handleRateWord = async (word, grade) => {
    const updated = calculateNextReview(word, grade);
    await saveWord(updated);
    await recordStudyActivity(1);

    // Update in-memory state
    setWords((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    setTodayCompletedCount((prev) => prev + 1);

    // If this was the last due word, celebrate!
    if (dueWords.length === 1) {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.6 },
      });
    }
  };

  // Handle new word added
  const handleWordAdded = (newWordOrWords) => {
    if (Array.isArray(newWordOrWords)) {
      setWords((prev) => [...newWordOrWords, ...prev]);
    } else {
      setWords((prev) => [newWordOrWords, ...prev]);
    }
  };

  const handleWordDeleted = (deletedId) => {
    setWords((prev) => prev.filter((w) => w.id !== deletedId));
  };

  // Force reset word state to 'new' for extra practice
  const handleExtraPractice = async () => {
    const resetList = words.map((w) => ({
      ...w,
      dueDate: new Date().toISOString().split('T')[0],
    }));
    setWords(resetList);
    setActiveTab('study');
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col font-sans pb-20 sm:pb-10">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAdd={() => setIsAddModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        dueCount={dueWords.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Tab 1: Study & Immersion Flashcard */}
        {activeTab === 'study' && (
          <div className="space-y-6">
            {/* Top Compact Progress Bar */}
            <div className="max-w-xl mx-auto flex items-center justify-between text-xs font-bold text-latte-700 bg-white/80 p-3.5 rounded-2xl border border-cream-300 paper-shadow">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amberGold-500 animate-ping" />
                <span>今日待複習：<strong className="text-latte-800">{dueWords.length}</strong> 個</span>
              </div>
              <div className="flex items-center gap-1.5 text-latte-600">
                <Flame className="w-4 h-4 text-amberGold-500" />
                <span>今日已完成：{todayCompletedCount} 字</span>
              </div>
            </div>

            {currentWord ? (
              <div className="animate-fade-in">
                <WordCard
                  key={currentWord.id}
                  word={currentWord}
                  onRate={handleRateWord}
                />
              </div>
            ) : (
              /* All Completed Celebration View */
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto paper-shadow border border-cream-300 space-y-6 animate-fade-in">
                <div className="w-20 h-20 bg-amberGold-100 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">
                  ☕
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-latte-800 tracking-tight">
                    太棒了！今日複習任務全部完成
                  </h2>
                  <p className="text-sm text-cozyDark-200 max-w-md mx-auto leading-relaxed">
                    休息一下喝杯咖啡，讓大腦鞏固英英記憶。小植物今天也喝得飽飽的，朝 775 藍證更靠近一步！
                  </p>
                </div>

                {/* Score badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-cream-100 border border-cream-200 text-xs font-bold text-latte-700">
                  <span>當前多益預估分數：</span>
                  <span className="text-base text-latte-800">{stats.predictedScore} 分</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab('quiz')}
                    className="py-3 px-4 bg-latte-600 hover:bg-latte-700 text-white font-bold text-xs rounded-2xl shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" /> 進行實戰測驗
                  </button>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="py-3 px-4 bg-white hover:bg-cream-200 border border-cream-300 text-latte-700 font-bold text-xs rounded-2xl shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> 新增生詞筆記
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Quiz Mode */}
        {activeTab === 'quiz' && (
          <QuizMode
            words={words}
            onCompleteQuiz={() => {
              recordStudyActivity(2);
              loadData();
            }}
          />
        )}

        {/* Tab 3: Word Library & Search */}
        {activeTab === 'list' && (
          <WordList
            words={words}
            onWordDeleted={handleWordDeleted}
          />
        )}

        {/* Tab 4: Garden & Analytics */}
        {activeTab === 'garden' && (
          <div className="space-y-6">
            <PlantGrowth
              stats={stats}
              todayCompletedCount={todayCompletedCount}
              onWaterPlant={() => recordStudyActivity(1)}
            />
            <StatsDashboard
              stats={stats}
              words={words}
              studyLogs={studyLogs}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <AddWordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onWordAdded={handleWordAdded}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        words={words}
        onReloadWords={loadData}
      />
    </div>
  );
}
