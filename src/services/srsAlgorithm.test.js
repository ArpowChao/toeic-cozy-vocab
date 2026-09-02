import { describe, it, expect } from 'vitest';
import {
  calculateNextReview,
  RATING,
  isWordDue,
  filterDueWords,
  estimateToeicScore,
  calculateLearningStats,
} from './srsAlgorithm.js';

describe('SM-2 SRS Algorithm', () => {
  const baseWord = {
    id: 'word-1',
    word: 'accommodate',
    repetition: 0,
    interval: 0,
    easeFactor: 2.5,
    state: 'new',
  };

  it('should schedule new word for 1 day interval on GOOD rating', () => {
    const reviewed = calculateNextReview(baseWord, RATING.GOOD, new Date('2026-09-01'));
    expect(reviewed.repetition).toBe(1);
    expect(reviewed.interval).toBe(1);
    expect(reviewed.dueDate).toBe('2026-09-02');
    expect(reviewed.state).toBe('learning');
  });

  it('should schedule new word for 3 days interval on EASY rating', () => {
    const reviewed = calculateNextReview(baseWord, RATING.EASY, new Date('2026-09-01'));
    expect(reviewed.repetition).toBe(1);
    expect(reviewed.interval).toBe(3);
    expect(reviewed.dueDate).toBe('2026-09-04');
    expect(reviewed.easeFactor).toBeGreaterThan(2.5);
  });

  it('should reset repetition and set interval to 1 on AGAIN rating', () => {
    const experiencedWord = {
      ...baseWord,
      repetition: 3,
      interval: 10,
      easeFactor: 2.6,
      state: 'learning',
    };
    const reviewed = calculateNextReview(experiencedWord, RATING.AGAIN, new Date('2026-09-01'));
    expect(reviewed.repetition).toBe(0);
    expect(reviewed.interval).toBe(1);
    expect(reviewed.state).toBe('relearning');
    expect(reviewed.easeFactor).toBe(2.4);
  });

  it('should advance interval exponentially after consecutive GOOD ratings', () => {
    let word = { ...baseWord };
    // Review 1 (Good)
    word = calculateNextReview(word, RATING.GOOD, new Date('2026-09-01'));
    expect(word.interval).toBe(1);

    // Review 2 (Good)
    word = calculateNextReview(word, RATING.GOOD, new Date('2026-09-02'));
    expect(word.interval).toBe(3);

    // Review 3 (Good)
    word = calculateNextReview(word, RATING.GOOD, new Date('2026-09-05'));
    expect(word.interval).toBeGreaterThanOrEqual(7);

    // Review 4 (Good)
    word = calculateNextReview(word, RATING.GOOD, new Date('2026-09-12'));
    expect(word.interval).toBeGreaterThanOrEqual(14);
    expect(word.state).toBe('mastered');
  });

  it('should correctly identify due words', () => {
    const words = [
      { id: '1', word: 'due1', dueDate: '2026-09-01', state: 'learning' },
      { id: '2', word: 'due2', dueDate: '2026-09-02', state: 'learning' },
      { id: '3', word: 'future', dueDate: '2026-09-10', state: 'learning' },
      { id: '4', word: 'newWord', state: 'new' },
    ];

    const dueToday = filterDueWords(words, '2026-09-02');
    expect(dueToday.length).toBe(3); // due1, due2, newWord
    expect(dueToday.map((w) => w.id)).toEqual(['1', '2', '4']);
  });

  it('should estimate TOEIC score progression towards 775', () => {
    const emptyScore = estimateToeicScore([]);
    expect(emptyScore).toBe(350);

    const masteredList = Array.from({ length: 600 }, (_, i) => ({
      id: `w-${i}`,
      state: 'mastered',
    }));
    const advancedScore = estimateToeicScore(masteredList);
    expect(advancedScore).toBeGreaterThanOrEqual(680);
  });
});
