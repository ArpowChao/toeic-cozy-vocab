import { afterEach, describe, expect, it, vi } from 'vitest';
import { lookupWordOnline } from './dictionaryService.js';

function response(body, ok = true) {
  return { ok, json: async () => body };
}

describe('lookupWordOnline', () => {
  afterEach(() => vi.restoreAllMocks());

  it('does not invent definitions, examples, pronunciation, or collocations when sources have no data', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(response({}, false))
      .mockResolvedValueOnce(response({ en: [] }))
      .mockResolvedValueOnce(response({ responseData: { translatedText: '預算' } })));

    const result = await lookupWordOnline('budget');

    expect(result.simpleDefinition).toBe('');
    expect(result.example).toBe('');
    expect(result.exampleZh).toBe('');
    expect(result.ipa).toBe('');
    expect(result.collocation).toBe('');
    expect(result.chinese).toBe('預算');
  });

  it('uses sourced Wiktionary data when the primary dictionary is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(response({}, false))
      .mockResolvedValueOnce(response({ en: [{
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
      }] }))
      .mockResolvedValueOnce(response({ responseData: { translatedText: '分配' } }))
      .mockResolvedValueOnce(response({ responseData: { translatedText: '公司撥出額外資金用於員工訓練。' } })));

    const result = await lookupWordOnline('allocate');

    expect(result.pos).toBe('v.');
    expect(result.simpleDefinition).toBe('To distribute according to a plan.');
    expect(result.example).toBe('The company allocated additional funds to staff training.');
    expect(result.exampleZh).toBe('公司撥出額外資金用於員工訓練。');
  });

  it('prefers a common inflected verb form over an obsolete-looking adjective sense', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(response({}, false))
      .mockResolvedValueOnce(response({ en: [
        {
          partOfSpeech: 'Adjective',
          definitions: [{ definition: 'Hard, difficult; wearisome, tedious.' }]
        },
        {
          partOfSpeech: 'Verb',
          definitions: [{
            definition: '<span class="form-of-definition">simple past of <i>tear</i> (“rip, rend”)</span>.'
          }]
        }
      ] }))
      .mockResolvedValueOnce(response({ responseData: { translatedText: '撕裂' } })));

    const result = await lookupWordOnline('tore');

    expect(result.pos).toBe('v.');
    expect(result.simpleDefinition).toBe('simple past of tear (“rip, rend”).');
  });

  it('keeps a sourced example paired with the definition and part of speech it illustrates', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(response([{
        phonetic: '/prəˈdʒekt/',
        meanings: [
          { partOfSpeech: 'noun', definitions: [{ definition: 'a planned undertaking' }] },
          { partOfSpeech: 'verb', definitions: [{
            definition: 'to estimate something in the future',
            example: 'Sales are projected to increase next quarter.'
          }] }
        ]
      }]))
      .mockResolvedValueOnce(response({ responseData: { translatedText: '預測' } }))
      .mockResolvedValueOnce(response({ responseData: { translatedText: '預計下季銷售額將增加。' } })));

    const result = await lookupWordOnline('project');

    expect(result.pos).toBe('v.');
    expect(result.simpleDefinition).toBe('to estimate something in the future');
    expect(result.example).toBe('Sales are projected to increase next quarter.');
    expect(result.exampleZh).toBe('預計下季銷售額將增加。');
  });
});
