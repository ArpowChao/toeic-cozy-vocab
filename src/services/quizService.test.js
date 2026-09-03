import { describe, expect, it } from 'vitest';
import { buildChoiceClue, buildChoices, buildQuizTargets, isCustomWord, maskWord } from './quizService.js';

const words = [
  { id: 'toeic-l1-001', word: 'accommodate', pos: 'v.', simpleDefinition: 'to have enough space', collocation: 'accommodate guests' },
  { id: 'custom-1', word: 'allocate', pos: 'v.', simpleDefinition: 'to distribute according to a plan', collocation: '' },
  { id: 'batch-2', word: 'invoice', pos: 'n.', simpleDefinition: '', collocation: '', example: 'Please pay the invoice by Friday.' },
  { id: 'sheet-3', word: 'shipment', pos: 'n.', category: '自訂生詞', simpleDefinition: 'goods being delivered', collocation: 'track a shipment' },
];

describe('quizService', () => {
  it('recognizes words imported through quick, batch, or sheet workflows', () => {
    expect(words.map(isCustomWord)).toEqual([false, true, true, true]);
  });

  it('can create a quiz whose target questions only use imported words', () => {
    const targets = buildQuizTargets(words, { scope: 'custom', quizType: 'choice', random: () => 0.5 });
    expect(targets.map((word) => word.word).sort()).toEqual(['allocate', 'invoice', 'shipment']);
  });

  it('falls back from a missing collocation to a masked example', () => {
    expect(buildChoiceClue(words[2])).toEqual({
      label: '例句語境 (Example)',
      text: 'Please pay the _______ by Friday.',
    });
  });

  it('uses the English definition when no maskable context exists', () => {
    expect(buildChoiceClue(words[1])).toEqual({
      label: '英英提示 (Definition)',
      text: 'to distribute according to a plan',
    });
  });

  it('masks inflected forms such as plurals, past tense, and gerunds', () => {
    expect(maskWord('All attendees must register before the event.', 'attendee')).toBe(
      'All _______ must register before the event.'
    );
    expect(maskWord('The company allocated additional funds.', 'allocate')).toBe(
      'The company _______ additional funds.'
    );
    expect(maskWord('We are allocating additional resources.', 'allocate')).toBe(
      'We are _______ additional resources.'
    );
    expect(maskWord('This building needs renovating.', 'renovate')).toBe(
      'This building needs _______.'
    );
    expect(maskWord('He complied with all safety regulations.', 'comply')).toBe(
      'He _______ with all safety regulations.'
    );
  });

  it('prefers distractors with matching part of speech and guarantees 4 choices', () => {
    const correctWord = { id: 'test-v', word: 'postpone', pos: 'v.' };
    const choices = buildChoices(correctWord, words);
    expect(choices.length).toBe(4);
    expect(choices.map((c) => c.word)).toContain('postpone');
  });
});
