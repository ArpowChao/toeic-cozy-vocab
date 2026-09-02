/**
 * SM-2 Spaced Repetition System (SRS) Algorithm Implementation
 * Tailored for TOEIC Vocabulary Retention
 */

export const RATING = {
  AGAIN: 1, // 忘記 - 重置記憶間隔
  HARD: 2,  // 困難 - 輕微減速
  GOOD: 3,  // 良好 - 標準增長
  EASY: 4,  // 簡單 - 快速跨越
};

/**
 * Calculate the next review schedule for a word
 * @param {Object} word - The vocabulary object
 * @param {number} grade - Rating from 1 (Again) to 4 (Easy)
 * @param {Date} [currentDate=new Date()] - Reference date
 * @returns {Object} Updated word SRS fields
 */
export function calculateNextReview(word, grade, currentDate = new Date()) {
  let repetition = word.repetition || 0;
  let interval = word.interval || 0;
  let easeFactor = word.easeFactor || 2.5;
  const history = word.history || [];

  const now = new Date(currentDate);
  const nowStr = now.toISOString().split('T')[0];

  if (grade < RATING.GOOD) {
    // 評分小於 3（忘記或極其困難）
    if (grade === RATING.AGAIN) {
      repetition = 0;
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    } else {
      // HARD (2)
      repetition = Math.max(0, repetition - 1);
      interval = Math.max(1, Math.floor(interval * 1.2));
      easeFactor = Math.max(1.3, easeFactor - 0.15);
    }
  } else {
    // 評分 3 (Good) 或 4 (Easy)
    if (repetition === 0) {
      interval = grade === RATING.EASY ? 3 : 1;
    } else if (repetition === 1) {
      interval = grade === RATING.EASY ? 6 : 3;
    } else {
      interval = Math.round(interval * easeFactor);
      if (grade === RATING.EASY) {
        interval = Math.round(interval * 1.3);
      }
    }

    repetition += 1;
    // 更新 Ease Factor: EF' = EF + (0.1 - (4 - grade) * (0.08 + (4 - grade) * 0.02))
    const delta = 0.1 - (4 - grade) * (0.08 + (4 - grade) * 0.02);
    easeFactor = Math.max(1.3, +(easeFactor + delta).toFixed(2));
  }

  // 計算下一次到期日期
  const nextDueDate = new Date(now);
  nextDueDate.setDate(nextDueDate.getDate() + interval);
  const dueDateStr = nextDueDate.toISOString().split('T')[0];

  // 判斷單字狀態
  let state = 'learning';
  if (repetition >= 4 && interval >= 14) {
    state = 'mastered';
  } else if (repetition === 0 && grade === RATING.AGAIN) {
    state = 'relearning';
  }

  return {
    ...word,
    repetition,
    interval,
    easeFactor,
    dueDate: dueDateStr,
    lastReviewed: nowStr,
    state,
    reviewCount: (word.reviewCount || 0) + 1,
    history: [
      ...history,
      {
        date: nowStr,
        grade,
        interval,
        easeFactor,
      },
    ],
  };
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDate(date = new Date()) {
  return date.toISOString().split('T')[0];
}

/**
 * Check if a word is due for review today
 */
export function isWordDue(word, targetDate = new Date()) {
  if (!word) return false;
  const targetDateStr = typeof targetDate === 'string' ? targetDate : formatDate(targetDate);
  // 新單字 (沒有 dueDate) 或 已達複習日
  if (!word.dueDate || word.state === 'new') return true;
  return word.dueDate <= targetDateStr;
}

/**
 * Filter words that are due for review
 */
export function filterDueWords(words, targetDate = new Date()) {
  if (!Array.isArray(words)) return [];
  return words.filter((w) => isWordDue(w, targetDate));
}

/**
 * Calculate predicted TOEIC score (350 ~ 775+)
 * @param {Array} words - All words in the library
 * @returns {number} Estimated score
 */
export function estimateToeicScore(words = []) {
  if (!words || words.length === 0) return 350;

  const total = words.length;
  const mastered = words.filter((w) => w.state === 'mastered').length;
  const learning = words.filter((w) => w.state === 'learning' || w.state === 'relearning').length;

  // 基礎分 350
  // 滿點 775+（以掌握 800+ 核心商務單字為目標藍證標準）
  const masteredWeight = mastered * 0.55;
  const learningWeight = learning * 0.18;
  const scoreBoost = Math.min(425, Math.round(masteredWeight + learningWeight));

  return Math.min(850, 350 + scoreBoost);
}

/**
 * Calculate overall learning statistics
 */
export function calculateLearningStats(words = [], studyLog = {}) {
  const total = words.length;
  const dueToday = filterDueWords(words).length;
  const mastered = words.filter((w) => w.state === 'mastered').length;
  const learning = words.filter((w) => w.state === 'learning' || w.state === 'relearning').length;
  const newWords = words.filter((w) => !w.dueDate || w.state === 'new').length;

  const predictedScore = estimateToeicScore(words);
  const masteryPercentage = total > 0 ? Math.round((mastered / total) * 100) : 0;

  return {
    total,
    dueToday,
    mastered,
    learning,
    newWords,
    predictedScore,
    masteryPercentage,
  };
}
