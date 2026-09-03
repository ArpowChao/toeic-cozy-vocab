import { TOEIC_SEED_WORDS } from '../data/toeicSeedWords.js';

function shuffle(items, random = Math.random) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds an inflection-aware regex for masking word in text.
 * Covers:
 * - base form
 * - plurals / 3rd person singular (-s, -es, -ies)
 * - past tense / participle (-d, -ed, -ied)
 * - progressive / gerund (-ing, including dropping 'e' or doubled consonants)
 */
export function buildWordMaskRegex(word) {
  const clean = (word || '').trim().toLowerCase();
  if (!clean) return null;

  const stems = new Set();
  stems.add(escapeRegExp(clean));

  if (clean.endsWith('e') && clean.length > 2) {
    const withoutE = escapeRegExp(clean.slice(0, -1));
    stems.add(`${withoutE}(?:e[ds]?|ing|es)?`);
  } else if (clean.endsWith('y') && clean.length > 2) {
    const withoutY = escapeRegExp(clean.slice(0, -1));
    stems.add(`${withoutY}(?:y|ies|ied|ying)`);
  } else {
    const escaped = escapeRegExp(clean);
    const lastChar = clean.slice(-1);
    if (/[bdfglmnprt]/.test(lastChar) && clean.length > 2) {
      stems.add(`${escaped}(?:${lastChar}(?:ed|ing))?`);
    }
    stems.add(`${escaped}(?:s|es|ed|ing|d)?`);
  }

  const pattern = Array.from(stems).join('|');
  return new RegExp(`\\b(?:${pattern})\\b`, 'gi');
}

export function maskWord(text, word) {
  if (!text || !word) return text || '';
  const regex = buildWordMaskRegex(word);
  if (!regex) return text;
  return text.replace(regex, '_______');
}

export function isCustomWord(word) {
  return Boolean(
    word?.id?.startsWith('custom-') ||
    word?.id?.startsWith('batch-') ||
    word?.category === '自訂生詞'
  );
}

export function buildChoiceClue(word) {
  const collocation = word?.collocation?.trim();
  if (collocation) {
    return {
      label: '多益常考搭配語境 (Collocation)',
      text: maskWord(collocation, word.word),
    };
  }

  const example = word?.example?.trim();
  if (example) {
    return {
      label: '例句語境 (Example)',
      text: maskWord(example, word.word),
    };
  }

  const definition = word?.simpleDefinition?.trim();
  if (definition) {
    return {
      label: '英英提示 (Definition)',
      text: maskWord(definition, word.word),
    };
  }

  return null;
}

export function buildQuizTargets(
  words,
  { scope = 'all', quizType = 'choice', limit = 10, random = Math.random } = {}
) {
  let candidates = words || [];
  if (scope === 'custom') candidates = candidates.filter(isCustomWord);
  if (scope === 'builtin') candidates = candidates.filter((word) => !isCustomWord(word));
  if (quizType === 'choice') candidates = candidates.filter((word) => buildChoiceClue(word));

  return shuffle(candidates, random).slice(0, limit);
}

export function buildChoices(correctWord, allWords = [], random = Math.random) {
  if (!correctWord) return [];

  const seen = new Set([correctWord.word.toLowerCase()]);
  const pool = [...(allWords || []), ...TOEIC_SEED_WORDS];

  // 1. First preference: same part of speech (if pos is known)
  const targetPos = correctWord.pos?.trim().toLowerCase();
  const samePosCandidates = pool.filter((w) => {
    const norm = w?.word?.toLowerCase();
    if (!norm || seen.has(norm)) return false;
    const wPos = w?.pos?.trim().toLowerCase();
    return targetPos && wPos === targetPos;
  });

  const distractors = [];
  const shuffledSamePos = shuffle(samePosCandidates, random);
  for (const w of shuffledSamePos) {
    const norm = w.word.toLowerCase();
    if (!seen.has(norm)) {
      seen.add(norm);
      distractors.push(w);
      if (distractors.length >= 3) break;
    }
  }

  // 2. Fill remaining from general pool if needed
  if (distractors.length < 3) {
    const shuffledGeneral = shuffle(pool, random);
    for (const w of shuffledGeneral) {
      const norm = w?.word?.toLowerCase();
      if (norm && !seen.has(norm)) {
        seen.add(norm);
        distractors.push(w);
        if (distractors.length >= 3) break;
      }
    }
  }

  return shuffle([correctWord, ...distractors], random);
}
