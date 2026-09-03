import { describe, expect, it, vi } from 'vitest';
import { repairFabricatedWordData } from './wordDataRepairService.js';

describe('repairFabricatedWordData', () => {
  it('replaces old generated placeholders while preserving identity and study progress', async () => {
    const fakeWord = {
      id: 'custom-1',
      word: 'allocate',
      simpleDefinition: 'to manage or apply allocate',
      collocation: 'allocate [in business context]',
      example: 'Please review the allocate for the upcoming meeting.',
      chinese: '（可於複習時隨時查看）',
      state: 'learning',
      repetition: 3,
      interval: 6,
    };
    const seedWord = { id: 'toeic-l1-001', word: 'accommodate', simpleDefinition: 'correct' };
    const lookup = vi.fn().mockResolvedValue({
      word: 'allocate',
      pos: 'v.',
      simpleDefinition: 'to distribute according to a plan',
      example: 'The company allocated funds to training.',
      chinese: '分配',
    });
    const saveWords = vi.fn().mockResolvedValue({ synced: true });

    const result = await repairFabricatedWordData([fakeWord, seedWord], { lookup, saveWords });

    expect(result.repairedCount).toBe(1);
    expect(lookup).toHaveBeenCalledWith('allocate');
    expect(result.words[0]).toMatchObject({
      id: 'custom-1',
      state: 'learning',
      repetition: 3,
      interval: 6,
      simpleDefinition: 'to distribute according to a plan',
      example: 'The company allocated funds to training.',
      chinese: '分配',
    });
    expect(result.words[1]).toEqual(seedWord);
    expect(saveWords).toHaveBeenCalledWith([result.words[0]]);
  });

  it('does nothing when no fabricated placeholders are present', async () => {
    const words = [{ id: 'custom-1', word: 'budget', simpleDefinition: 'a plan for spending money' }];
    const lookup = vi.fn();
    const saveWords = vi.fn();

    const result = await repairFabricatedWordData(words, { lookup, saveWords });

    expect(result).toEqual({ words, repairedCount: 0, synced: null });
    expect(lookup).not.toHaveBeenCalled();
    expect(saveWords).not.toHaveBeenCalled();
  });
});
