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

function maskWord(text, word) {
  if (!text || !word) return text || '';
  return text.replace(new RegExp(`\\b${escapeRegExp(word)}\\b`, 'gi'), '_______');
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
      text: definition,
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

export function buildChoices(correctWord, allWords, random = Math.random) {
  if (!correctWord) return [];

  const seen = new Set([correctWord.word.toLowerCase()]);
  const distractors = shuffle(allWords || [], random).filter((word) => {
    const normalized = word?.word?.toLowerCase();
    if (!normalized || word.id === correctWord.id || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  }).slice(0, 3);

  return shuffle([correctWord, ...distractors], random);
}
