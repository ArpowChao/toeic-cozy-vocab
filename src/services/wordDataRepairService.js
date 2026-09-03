import { lookupWordOnline } from './dictionaryService.js';
import { saveWordsAndSync } from './wordSaveService.js';

const FABRICATED_PATTERNS = [
  /^to (?:act, use, or manage|manage or apply)\b/i,
  /^concept for\b/i,
  /^please (?:make sure to )?review\b/i,
  /^the management decided to\b/i,
  /\[(?:in )?(?:the workplace|business context)/i,
  /^（(?:待複習|可於複習時隨時查看|點擊手動輸入中文釋義)）$/,
  /^Hard, difficult; wearisome, tedious\.$/i,
  /^you(?:'re| are) a bloody liability\b/i,
];

function containsFabricatedData(word) {
  if (!word?.id?.startsWith('custom-') && !word?.id?.startsWith('batch-')) return false;
  return ['simpleDefinition', 'collocation', 'example', 'chinese'].some((field) =>
    FABRICATED_PATTERNS.some((pattern) => pattern.test(word[field] || ''))
  );
}

export async function repairFabricatedWordData(words, overrides = {}) {
  const lookup = overrides.lookup || lookupWordOnline;
  const saveWords = overrides.saveWords || saveWordsAndSync;
  const repairedById = new Map();

  for (const word of words) {
    if (!containsFabricatedData(word)) continue;

    const sourced = await lookup(word.word);
    const repaired = {
      ...word,
      ...(sourced || {}),
      id: word.id,
      word: word.word,
      state: word.state,
      repetition: word.repetition,
      interval: word.interval,
      easeFactor: word.easeFactor,
      dueDate: word.dueDate,
      lastReviewed: word.lastReviewed,
    };
    repairedById.set(word.id, repaired);
  }

  if (repairedById.size === 0) {
    return { words, repairedCount: 0, synced: null };
  }

  const repairedWords = Array.from(repairedById.values());
  const saveResult = await saveWords(repairedWords);
  const updatedWords = words.map((word) => repairedById.get(word.id) || word);

  return {
    words: updatedWords,
    repairedCount: repairedWords.length,
    synced: saveResult.synced,
  };
}
