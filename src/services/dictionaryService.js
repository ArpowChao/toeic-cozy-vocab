/**
 * Dictionary & Word Auto-enrichment Service
 * Primary Source: Cambridge Dictionary API (en-tw)
 * Fallback Source 1: Free Dictionary API + Tatoeba Example Corpus + MyMemory
 * Fallback Source 2: Wiktionary API
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

export const POS_LABELS = {
  noun: 'n.',
  verb: 'v.',
  adjective: 'adj.',
  adverb: 'adv.',
  pronoun: 'pron.',
  preposition: 'prep.',
  conjunction: 'conj.',
  interjection: 'interj.',
};

/**
 * Normalizes any part-of-speech string into standard TOEIC notation (n., v., adj., adv., etc.)
 */
export function normalizePartOfSpeech(posRaw = '') {
  if (!posRaw) return '';
  const lower = posRaw.toLowerCase().trim();
  if (lower.startsWith('adv') || lower.includes('adverb')) return 'adv.';
  if (lower.startsWith('adj') || lower.includes('adjective')) return 'adj.';
  if (lower.startsWith('verb') || lower.includes('verb')) return 'v.';
  if (lower.startsWith('noun') || lower.includes('noun')) return 'n.';
  if (lower.startsWith('prep') || lower.includes('preposition')) return 'prep.';
  if (lower.startsWith('conj') || lower.includes('conjunction')) return 'conj.';
  if (lower.startsWith('pron') || lower.includes('pronoun')) return 'pron.';
  if (lower.startsWith('interj') || lower.includes('interjection')) return 'interj.';
  if (lower.startsWith('phrase') || lower.includes('idiom')) return 'phr.';
  return POS_LABELS[lower] || lower;
}

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
 * Fetch example sentence from Tatoeba open sentence corpus
 */
async function lookupTatoebaExample(cleanWord) {
  try {
    const response = await fetch(
      `https://tatoeba.org/en/api_v0/search?from=eng&query=${encodeURIComponent(cleanWord)}`
    );
    if (!response.ok) return '';

    const data = await response.json();
    const results = data.results || [];
    const match = results.find((r) => {
      const text = r.text || '';
      const words = text.split(/\s+/);
      return words.length >= 4 && words.length <= 25 && text.toLowerCase().includes(cleanWord);
    });

    return match ? match.text.trim() : (results[0]?.text?.trim() || '');
  } catch {
    return '';
  }
}

/**
 * Fetch sourced word details from Cambridge Dictionary API (Traditional Chinese)
 */
export async function lookupCambridge(cleanWord) {
  try {
    const response = await fetch(
      `https://dictionary-api.eliaschen.dev/api/dictionary/en-tw/${encodeURIComponent(cleanWord)}`
    );
    if (!response.ok) return null;

    const data = await response.json();
    if (!data || data.error || !Array.isArray(data.definition) || data.definition.length === 0) {
      return null;
    }

    const candidates = data.definition.map((def, index) => {
      const defText = def.text || '';
      const exText = def.example?.[0]?.text || '';
      const exZh = def.example?.[0]?.translation || '';
      const combined = `${defText} ${exText}`.toLowerCase();
      const businessScore = TOEIC_CONTEXT_TERMS.reduce(
        (score, term) => score + (combined.includes(term) ? 1 : 0),
        0
      );
      const hasExampleBonus = exText ? 3 : 0;
      return {
        def,
        score: businessScore * 10 + hasExampleBonus,
        index,
        pos: normalizePartOfSpeech(def.pos || data.pos?.[0] || ''),
        simpleDefinition: defText,
        example: exText,
        exampleZh: exZh,
        chinese: def.translation || '',
      };
    });

    candidates.sort((a, b) => b.score - a.score || a.index - b.index);
    const best = candidates[0];
    if (!best || !best.simpleDefinition) return null;

    const usPron = data.pronunciation?.find((p) => p.lang === 'us');
    const ukPron = data.pronunciation?.find((p) => p.lang === 'uk');
    const ipa = usPron?.pron || ukPron?.pron || '';

    const fallbackChinese = data.definition.find((d) => d.translation?.trim())?.translation || '';
    const chinese = best.chinese || fallbackChinese || (await translateToTraditionalChinese(cleanWord));
    const exampleZh = best.exampleZh || (best.example ? await translateToTraditionalChinese(best.example) : '');

    return {
      word: cleanWord,
      ipa,
      pos: best.pos || normalizePartOfSpeech(data.pos?.[0] || ''),
      simpleDefinition: best.simpleDefinition,
      example: best.example,
      exampleZh,
      chinese,
    };
  } catch (error) {
    console.warn('Cambridge Dictionary lookup failed:', error);
    return null;
  }
}

/**
 * Fetch sourced word details automatically.
 * Priority:
 * 1. Cambridge Dictionary API (en-tw)
 * 2. Free Dictionary API + Tatoeba Corpus + MyMemory
 * 3. Wiktionary API
 * @param {string} wordText
 * @returns {Promise<Object>} Enriched word data
 */
export async function lookupWordOnline(wordText) {
  const cleanWord = wordText.trim().toLowerCase();
  if (!cleanWord) return null;

  // 1. Primary: Try Cambridge Dictionary API
  try {
    const cambridge = await lookupCambridge(cleanWord);
    if (cambridge && cambridge.simpleDefinition) {
      return {
        word: cleanWord,
        ipa: cambridge.ipa,
        pos: cambridge.pos,
        level: 'L2',
        category: '自訂生詞',
        simpleDefinition: cambridge.simpleDefinition,
        collocation: COMMON_BUSINESS_COLLOCATIONS[cleanWord] || '',
        example: cambridge.example,
        exampleZh: cambridge.exampleZh,
        chinese: cambridge.chinese,
        toeicTip: '',
        derivatives: '',
        state: 'new',
        repetition: 0,
        interval: 0,
        easeFactor: 2.5,
        dueDate: null,
      };
    }
  } catch {
    // Continue to fallback pipeline
  }

  // 2. Secondary: Free Dictionary API
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
          pos = normalizePartOfSpeech(bestDefinition.partOfSpeech);
          simpleDefinition = bestDefinition.definition;
          example = bestDefinition.example;
        }
      }
    }
  } catch (error) {
    console.warn('Free Dictionary lookup failed:', error);
  }

  // 3. If Free Dictionary didn't provide an example, try Tatoeba corpus
  if (!example) {
    example = await lookupTatoebaExample(cleanWord);
  }

  // 4. Tertiary: Wiktionary (only supplement missing definition or example, never wipe good definitions)
  if (!simpleDefinition || !example) {
    const wiktionaryDefinition = await lookupWiktionary(cleanWord);
    if (wiktionaryDefinition) {
      if (!simpleDefinition && wiktionaryDefinition.definition) {
        simpleDefinition = wiktionaryDefinition.definition;
        pos = normalizePartOfSpeech(wiktionaryDefinition.partOfSpeech);
      }
      if (!example && wiktionaryDefinition.example) {
        example = wiktionaryDefinition.example;
      }
    }
  }

  const chinese = await translateToTraditionalChinese(cleanWord);
  const exampleZh = example ? await translateToTraditionalChinese(example) : '';

  return {
    word: cleanWord,
    ipa,
    pos: normalizePartOfSpeech(pos),
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
