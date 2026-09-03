/**
 * Dictionary & Word Auto-enrichment Service
 * Uses Free Dictionary API + MyMemory Translation API.
 * Missing source data stays empty: this service never fabricates definitions or examples.
 */

const COMMON_BUSINESS_COLLOCATIONS = {
  comply: 'comply with regulations / safety policies',
  accommodate: 'accommodate client needs / special requests',
  negotiate: 'negotiate contract terms / lower prices',
  reimburse: 'reimburse travel expenses / costs',
  attendee: 'registered attendees / conference attendees',
  expedite: 'expedite shipment / delivery process',
  delegate: 'delegate tasks / authority to subordinates',
  address: 'address concerns / issues / the audience',
  contingency: 'a contingency plan for emergencies',
  mandatory: 'mandatory training / compliance checks',
  tentative: 'a tentative agreement / schedule',
  unprecedented: 'unprecedented growth / market demand',
};

const POS_LABELS = {
  noun: 'n.',
  verb: 'v.',
  adjective: 'adj.',
  adverb: 'adv.',
  pronoun: 'pron.',
  preposition: 'prep.',
  conjunction: 'conj.',
  interjection: 'interj.',
};

const TOEIC_CONTEXT_TERMS = [
  'business', 'company', 'office', 'employee', 'staff', 'customer', 'client',
  'management', 'meeting', 'contract', 'project', 'fund', 'budget', 'sale',
  'market', 'shipment', 'schedule', 'training', 'conference', 'report',
];

function chooseBestCandidate(candidates) {
  return candidates
    .map((candidate, index) => {
      const text = `${candidate.definition} ${candidate.example}`.toLowerCase();
      const businessScore = TOEIC_CONTEXT_TERMS.reduce(
        (score, term) => score + (text.includes(term) ? 1 : 0),
        0
      );
      const inflectionScore = candidate.isInflectedForm ? 5 : 0;
      return {
        candidate,
        index,
        score: businessScore * 10 + inflectionScore + (candidate.example ? 1 : 0),
      };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)[0]?.candidate || null;
}

async function translateToTraditionalChinese(text) {
  if (!text) return '';

  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-TW`
    );
    if (!response.ok) return '';

    const data = await response.json();
    const translated = data.responseData?.translatedText?.trim();
    return translated && translated.toLowerCase() !== text.toLowerCase() ? translated : '';
  } catch (error) {
    console.warn('Translation lookup failed:', error);
    return '';
  }
}

function findBestDefinition(entry) {
  const candidates = (entry.meanings || []).flatMap((meaning) =>
    (meaning.definitions || [])
      .filter((definition) => definition?.definition)
      .map((definition) => ({
        partOfSpeech: meaning.partOfSpeech || '',
        definition: definition.definition,
        example: definition.example || '',
        isInflectedForm: /\b(?:simple )?past(?: tense| participle)? of\b|\bplural of\b/i.test(
          definition.definition
        ),
      }))
  );

  return chooseBestCandidate(candidates);
}

function stripHtml(value = '') {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

async function lookupWiktionary(cleanWord) {
  try {
    const response = await fetch(
      `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(cleanWord)}`
    );
    if (!response.ok) return null;

    const data = await response.json();
    const candidates = (data.en || []).flatMap((meaning) =>
      (meaning.definitions || [])
        .filter((definition) => definition?.definition)
        .map((definition) => {
          const rawDefinition = definition.definition;
          return {
            partOfSpeech: (meaning.partOfSpeech || '').toLowerCase(),
            definition: stripHtml(rawDefinition),
            example: stripHtml(
              definition.parsedExamples?.[0]?.example || definition.examples?.[0] || ''
            ),
            isInflectedForm:
              rawDefinition.includes('form-of-definition') ||
              /\b(?:simple )?past(?: tense| participle)? of\b|\bplural of\b/i.test(rawDefinition),
          };
        })
    );
    return chooseBestCandidate(candidates);
  } catch (error) {
    console.warn('Wiktionary lookup failed:', error);
    return null;
  }
}

/**
 * Fetch sourced word details automatically.
 * @param {string} wordText
 * @returns {Promise<Object>} Enriched word data
 */
export async function lookupWordOnline(wordText) {
  const cleanWord = wordText.trim().toLowerCase();
  if (!cleanWord) return null;

  let ipa = '';
  let pos = '';
  let simpleDefinition = '';
  let example = '';

  try {
    const dictRes = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`
    );
    if (dictRes.ok) {
      const data = await dictRes.json();
      const entry = Array.isArray(data) ? data[0] : null;
      if (entry) {
        ipa = entry.phonetic || entry.phonetics?.find((item) => item.text)?.text || '';
        const bestDefinition = findBestDefinition(entry);
        if (bestDefinition) {
          pos = POS_LABELS[bestDefinition.partOfSpeech] || bestDefinition.partOfSpeech || '';
          simpleDefinition = bestDefinition.definition;
          example = bestDefinition.example;
        }
      }
    }
  } catch (error) {
    console.warn('Free Dictionary lookup failed:', error);
  }

  if (!example) {
    const wiktionaryDefinition = await lookupWiktionary(cleanWord);
    if (wiktionaryDefinition) {
      pos = POS_LABELS[wiktionaryDefinition.partOfSpeech] || wiktionaryDefinition.partOfSpeech || '';
      simpleDefinition = wiktionaryDefinition.definition;
      example = wiktionaryDefinition.example;
    }
  }

  const chinese = await translateToTraditionalChinese(cleanWord);
  const exampleZh = example ? await translateToTraditionalChinese(example) : '';

  return {
    word: cleanWord,
    ipa,
    pos,
    level: 'L2',
    category: '自訂生詞',
    simpleDefinition,
    collocation: COMMON_BUSINESS_COLLOCATIONS[cleanWord] || '',
    example,
    exampleZh,
    chinese,
    toeicTip: '',
    derivatives: '',
    state: 'new',
    repetition: 0,
    interval: 0,
    easeFactor: 2.5,
    dueDate: null,
  };
}
