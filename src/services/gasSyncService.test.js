import { describe, expect, it, vi, afterEach } from 'vitest';
import { mergeWordLists, syncWithCloud } from './gasSyncService.js';

describe('gasSyncService - mergeWordLists', () => {
  it('adds new words from cloud that do not exist locally', () => {
    const localWords = [
      { id: 'l-1', word: 'budget', repetition: 1, lastReviewed: '2026-09-01' },
    ];
    const cloudWords = [
      { id: 'c-2', word: 'revenue', repetition: 0, chinese: '營收' },
    ];

    const merged = mergeWordLists(localWords, cloudWords);

    expect(merged).toHaveLength(2);
    expect(merged.find((w) => w.word === 'revenue')).toMatchObject({
      word: 'revenue',
      chinese: '營收',
      state: 'new',
    });
  });

  it('adopts cloud review progress when cloud has newer lastReviewed date', () => {
    const localWords = [
      {
        id: '1',
        word: 'allocate',
        lastReviewed: '2026-09-01',
        dueDate: '2026-09-02',
        repetition: 1,
        interval: 1,
        state: 'learning',
        chinese: '分配',
      },
    ];
    const cloudWords = [
      {
        id: '1',
        word: 'allocate',
        lastReviewed: '2026-09-03',
        dueDate: '2026-09-06',
        repetition: 2,
        interval: 3,
        state: 'learning',
      },
    ];

    const merged = mergeWordLists(localWords, cloudWords);

    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({
      word: 'allocate',
      lastReviewed: '2026-09-03',
      dueDate: '2026-09-06',
      repetition: 2,
      interval: 3,
      chinese: '分配', // preserves local metadata
    });
  });

  it('keeps local review progress when local has newer lastReviewed date', () => {
    const localWords = [
      {
        id: '1',
        word: 'warranty',
        lastReviewed: '2026-09-03',
        dueDate: '2026-09-06',
        repetition: 2,
        interval: 3,
      },
    ];
    const cloudWords = [
      {
        id: '1',
        word: 'warranty',
        lastReviewed: '2026-09-01',
        dueDate: '2026-09-02',
        repetition: 1,
        interval: 1,
        example: 'One year warranty included.',
      },
    ];

    const merged = mergeWordLists(localWords, cloudWords);

    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({
      word: 'warranty',
      lastReviewed: '2026-09-03',
      dueDate: '2026-09-06',
      repetition: 2,
      interval: 3,
      example: 'One year warranty included.', // merges cloud example
    });
  });

  it('updates word definitions, chinese, and examples when edited in Google Sheet', () => {
    const localWords = [
      {
        id: '1',
        word: 'liability',
        chinese: '負債',
        example: 'Old example',
        lastReviewed: '2026-09-03',
      },
    ];
    const cloudWords = [
      {
        id: '1',
        word: 'liability',
        chinese: '負擔、責任、妨礙',
        example: 'He is considered a liability.',
      },
    ];

    const merged = mergeWordLists(localWords, cloudWords);

    expect(merged).toHaveLength(1);
    expect(merged[0].chinese).toBe('負擔、責任、妨礙');
    expect(merged[0].example).toBe('He is considered a liability.');
  });
});

describe('gasSyncService - syncWithCloud', () => {
  afterEach(() => vi.restoreAllMocks());

  it('pulls from cloud and merges seamlessly', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        words: [
          { word: 'delegate', chinese: '指派', lastReviewed: '2026-09-03' },
        ],
      }),
    }));

    const result = await syncWithCloud(
      [{ word: 'delegate', chinese: '代表', lastReviewed: '2026-09-01' }],
      'https://script.google.com/test'
    );

    expect(result.synced).toBe(true);
    expect(result.pulledCount).toBe(1);
    expect(result.words[0].lastReviewed).toBe('2026-09-03');
  });
});
