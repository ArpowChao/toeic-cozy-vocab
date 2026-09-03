import { afterEach, describe, expect, it, vi } from 'vitest';
import { lookupCambridge, lookupWordOnline, normalizePartOfSpeech } from './dictionaryService.js';

function response(body, ok = true) {
  return { ok, json: async () => body };
}

describe('normalizePartOfSpeech', () => {
  it('normalizes various POS strings to standard notation', () => {
    expect(normalizePartOfSpeech('Verb')).toBe('v.');
    expect(normalizePartOfSpeech('verb [ T ]')).toBe('v.');
    expect(normalizePartOfSpeech('transitive verb')).toBe('v.');
    expect(normalizePartOfSpeech('Noun')).toBe('n.');
    expect(normalizePartOfSpeech('noun [ C ]')).toBe('n.');
    expect(normalizePartOfSpeech('proper noun')).toBe('n.');
    expect(normalizePartOfSpeech('Adjective')).toBe('adj.');
    expect(normalizePartOfSpeech('adverb')).toBe('adv.');
    expect(normalizePartOfSpeech('preposition')).toBe('prep.');
  });
});

describe('lookupWordOnline', () => {
  afterEach(() => vi.restoreAllMocks());

  it('uses Cambridge Dictionary as the primary source when available', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      if (url.includes('eliaschen.dev')) {
        return response({
          word: 'postpone',
          pos: ['verb'],
          pronunciation: [
            { pos: 'verb', lang: 'us', pron: '/poʊstˈpoʊn/' }
          ],
          definition: [
            {
              id: 0,
              pos: 'verb',
              text: 'to delay an event and plan that it should happen at a later date',
              translation: '延後，延緩',
              example: [
                {
                  id: 0,
                  text: 'They decided to postpone their holiday until next year.',
                  translation: '他們決定將假期延後到來年。'
                }
              ]
            }
          ]
        });
      }
      return response({}, false);
    }));

    const result = await lookupWordOnline('postpone');

    expect(result.pos).toBe('v.');
    expect(result.ipa).toBe('/poʊstˈpoʊn/');
    expect(result.simpleDefinition).toBe(
      'to delay an event and plan that it should happen at a later date'
    );
    expect(result.chinese).toBe('延後，延緩');
    expect(result.example).toBe('They decided to postpone their holiday until next year.');
    expect(result.exampleZh).toBe('他們決定將假期延後到來年。');
  });

  it('does not invent definitions, examples, pronunciation, or collocations when sources have no data', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      if (url.includes('eliaschen.dev')) return response({}, false);
      if (url.includes('dictionaryapi.dev')) return response({}, false);
      if (url.includes('tatoeba.org')) return response({ results: [] });
      if (url.includes('wiktionary.org')) return response({ en: [] });
      if (url.includes('mymemory')) return response({ responseData: { translatedText: '預算' } });
      return response({}, false);
    }));

    const result = await lookupWordOnline('budget');

    expect(result.simpleDefinition).toBe('');
    expect(result.example).toBe('');
    expect(result.exampleZh).toBe('');
    expect(result.ipa).toBe('');
    expect(result.collocation).toBe('');
    expect(result.chinese).toBe('預算');
  });

  it('uses sourced Wiktionary data when Cambridge and primary dictionary are unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      if (url.includes('eliaschen.dev')) return response({}, false);
      if (url.includes('dictionaryapi.dev')) return response({}, false);
      if (url.includes('tatoeba.org')) return response({ results: [] });
      if (url.includes('wiktionary.org')) {
        return response({
          en: [{
            partOfSpeech: 'Verb',
            definitions: [
              {
                definition: 'To <a href="/wiki/set_aside">set aside</a> for a purpose.',
                examples: ['The desserts were <b>allocated</b> for tomorrow.']
              },
              {
                definition: 'To distribute according to a plan.',
                examples: ['The company <b>allocated</b> additional funds to staff training.']
              }
            ]
          }]
        });
      }
      if (url.includes('mymemory')) {
        if (url.includes('training') || url.includes('staff')) {
          return response({ responseData: { translatedText: '公司撥出額外資金用於員工訓練。' } });
        }
        return response({ responseData: { translatedText: '分配' } });
      }
      return response({}, false);
    }));

    const result = await lookupWordOnline('allocate');

    expect(result.pos).toBe('v.');
    expect(result.simpleDefinition).toBe('To distribute according to a plan.');
    expect(result.example).toBe('The company allocated additional funds to staff training.');
    expect(result.exampleZh).toBe('公司撥出額外資金用於員工訓練。');
  });

  it('falls back to Tatoeba example when Free Dictionary lacks examples', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      if (url.includes('eliaschen.dev')) return response({}, false);
      if (url.includes('dictionaryapi.dev')) {
        return response([{
          phonetic: '/ˈwɔːr.ən.ti/',
          meanings: [{
            partOfSpeech: 'noun',
            definitions: [{ definition: 'A written guarantee or warranty.' }]
          }]
        }]);
      }
      if (url.includes('tatoeba.org')) {
        return response({
          results: [{ text: 'The warranty covers mechanical repairs for one year.' }]
        });
      }
      if (url.includes('mymemory')) {
        if (url.includes('warranty')) return response({ responseData: { translatedText: '保固' } });
        return response({ responseData: { translatedText: '保固期為一年內的機械維修。' } });
      }
      return response({}, false);
    }));

    const result = await lookupWordOnline('warranty');

    expect(result.pos).toBe('n.');
    expect(result.simpleDefinition).toBe('A written guarantee or warranty.');
    expect(result.example).toBe('The warranty covers mechanical repairs for one year.');
  });
});
