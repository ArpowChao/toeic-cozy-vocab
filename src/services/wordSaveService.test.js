import { describe, expect, it, vi } from 'vitest';
import { saveWordAndSync, saveWordsAndSync } from './wordSaveService.js';

describe('local save with Google Sheets auto-sync', () => {
  it('uploads the complete local word list after saving one word', async () => {
    const newWord = { id: 'new-1', word: 'allocate' };
    const completeList = [{ id: 'old-1', word: 'budget' }, newWord];
    const saveLocal = vi.fn().mockResolvedValue(newWord);
    const getAllLocal = vi.fn().mockResolvedValue(completeList);
    const pushCloud = vi.fn().mockResolvedValue({ success: true, count: 2 });

    const result = await saveWordAndSync(newWord, { saveLocal, getAllLocal, pushCloud });

    expect(saveLocal).toHaveBeenCalledWith(newWord);
    expect(getAllLocal).toHaveBeenCalledOnce();
    expect(pushCloud).toHaveBeenCalledWith(completeList);
    expect(result.synced).toBe(true);
  });

  it('keeps a successful local save when cloud sync is temporarily unavailable', async () => {
    const words = [{ id: 'new-1', word: 'allocate' }];
    const saveLocal = vi.fn().mockResolvedValue(words);
    const getAllLocal = vi.fn().mockResolvedValue(words);
    const pushCloud = vi.fn().mockRejectedValue(new Error('offline'));

    const result = await saveWordsAndSync(words, { saveLocal, getAllLocal, pushCloud });

    expect(result.synced).toBe(false);
    expect(result.error.message).toBe('offline');
    expect(saveLocal).toHaveBeenCalledWith(words);
  });
});
