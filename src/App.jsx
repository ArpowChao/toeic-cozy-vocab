import React, { useState, useEffect, useRef } from 'react';
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
  saveWordsBatch,
  recordStudyActivity,
  getStudyLogs,
} from './services/storageService.js';
import {
  calculateNextReview,
  filterDueWords,
  calculateLearningStats,
} from './services/srsAlgorithm.js';
import { repairFabricatedWordData } from './services/wordDataRepairService.js';
import { syncWithCloud, pushWordsToGas, getSavedGasUrl } from './services/gasSyncService.js';
import confetti from 'canvas-confetti';
import { Sparkles, CheckCircle2, RotateCcw, Plus, Flame } from 'lucide-react';

export default function App() {
  const [words, setWords] = useState([]);
  const [studyLogs, setStudyLogs] = useState({});
  const [activeTab, setActiveTab] = useState('study'); // 'study' | 'quiz' | 'list' | 'garden'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [todayCompletedCount, setTodayCompletedCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'error'

  const pushTimerRef = useRef(null);

  // Load initial words and logs from IndexedDB, then auto-sync from cloud in background
  useEffect(() => {
    loadData();
    return () => {
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    };
  }, []);

  const loadData = async () => {
    // 1. Fast local load
    const loadedWords = await initStorage();
    const repairResult = await repairFabricatedWordData(loadedWords);
    setWords(repairResult.words);
    const logs = await getStudyLogs();
    setStudyLogs(logs);
    const todayStr = new Date().toISOString().split('T')[0];
    setTodayCompletedCount(logs[todayStr] || 0);

    // 2. Background Auto-Pull from Google Sheets
    const gasUrl = getSavedGasUrl();
    if (gasUrl) {
      setSyncStatus('syncing');
      try {
        const syncResult = await syncWithCloud(repairResult.words, gasUrl);
        if (syncResult.synced) {
          await saveWordsBatch(syncResult.words);
          const cloudRepair = await repairFabricatedWordData(syncResult.words);
          setWords(cloudRepair.words);
          setSyncStatus('synced');
        } else {
          setSyncStatus('error');
        }
      } catch (err) {
        console.warn('Background auto-pull failed:', err);
        setSyncStatus('error');
      }
    }
  };

  // Debounced background cloud push for review progress
  const scheduleCloudPush = (latestWords, immediate = false) => {
    const gasUrl = getSavedGasUrl();
    if (!gasUrl) return;

    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);

    const executePush = async () => {
      try {
        setSyncStatus('syncing');
        await pushWordsToGas(latestWords, gasUrl);
        setSyncStatus('synced');
      } catch (err) {
        console.warn('Background auto-push failed:', err);
        setSyncStatus('error');
      }
    };

    if (immediate) {
      executePush();
    } else {
      pushTimerRef.current = setTimeout(executePush, 2500);
    }
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
    const nextWords = words.map((w) => (w.id === updated.id ? updated : w));
    setWords(nextWords);
    setTodayCompletedCount((prev) => prev + 1);

    const isLastDueWord = dueWords.length === 1;
    scheduleCloudPush(nextWords, isLastDueWord);

    // If this was the last due word, celebrate!
    if (isLastDueWord) {
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
    setSyncStatus('synced');
  };

  const handleWordDeleted = (deletedId) => {
    setWords((prev) => {
      const next = prev.filter((w) => w.id !== deletedId);
      scheduleCloudPush(next, true);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col font-sans pb-24 sm:pb-12">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAdd={() => setIsAddModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        dueCount={dueWords.length}
        syncStatus={syncStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl lg:max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10">
        {/* Tab 1: Study & Immersion Flashcard */}
        {activeTab === 'study' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Top Compact Progress Bar */}
            <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto flex items-center justify-between text-xs sm:text-sm font-bold text-latte-700 bg-white/90 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-cream-300 paper-shadow">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-amberGold-500 animate-ping" />
                <span>今日待複習：<strong className="text-latte-900 text-sm sm:text-base">{dueWords.length}</strong> 個</span>
              </div>
              <div className="flex items-center gap-2 text-latte-700 font-bold">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-amberGold-500" />
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
              <div className="bg-white rounded-3xl p-8 sm:p-14 text-center max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto paper-shadow border border-cream-300 space-y-6 sm:space-y-8 animate-fade-in">
                <div className="w-24 h-24 bg-amberGold-100 rounded-full flex items-center justify-center mx-auto text-5xl shadow-inner">
                  ☕
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-black text-latte-800 tracking-tight">
                    太棒了！今日複習任務全部完成
                  </h2>
                  <p className="text-sm sm:text-base text-cozyDark-200 max-w-lg mx-auto leading-relaxed">
                    休息一下喝杯咖啡，讓大腦鞏固英英記憶。小植物今天也喝得飽飽的，朝 775 藍證更靠近一步！
                  </p>
                </div>

                {/* Score badge */}
                <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-cream-100 border border-cream-300 text-sm font-bold text-latte-700 shadow-xs">
                  <span>當前多益預估分數：</span>
                  <span className="text-xl sm:text-2xl font-black text-latte-900">{stats.predictedScore} 分</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 max-w-md mx-auto">
                  <button
                    onClick={() => setActiveTab('quiz')}
                    className="py-4 px-6 bg-latte-600 hover:bg-latte-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-sm transition flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" /> 進行實戰測驗
                  </button>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="py-4 px-6 bg-white hover:bg-cream-200 border border-cream-300 text-latte-700 font-bold text-sm sm:text-base rounded-2xl shadow-sm transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> 新增生詞筆記
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
          <div className="space-y-8">
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
