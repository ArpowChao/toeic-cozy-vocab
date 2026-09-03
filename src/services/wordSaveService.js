import { getAllWords, saveWord, saveWordsBatch } from './storageService.js';
import { pushWordsToGas } from './gasSyncService.js';

async function syncAfterLocalSave(saveLocal, getAllLocal, pushCloud) {
  const saved = await saveLocal();
  const completeWordList = await getAllLocal();

  try {
    const response = await pushCloud(completeWordList);
    return { saved, synced: true, count: completeWordList.length, response };
  } catch (error) {
    console.warn('Google Sheets auto-sync failed; local save was kept:', error);
    return { saved, synced: false, count: completeWordList.length, error };
  }
}

export async function saveWordAndSync(word, overrides = {}) {
  const saveLocal = overrides.saveLocal || saveWord;
  return syncAfterLocalSave(
    () => saveLocal(word),
    overrides.getAllLocal || getAllWords,
    overrides.pushCloud || pushWordsToGas
  );
}

export async function saveWordsAndSync(words, overrides = {}) {
  const saveLocal = overrides.saveLocal || saveWordsBatch;
  return syncAfterLocalSave(
    () => saveLocal(words),
    overrides.getAllLocal || getAllWords,
    overrides.pushCloud || pushWordsToGas
  );
}
