import { describe, expect, it } from 'vitest';
import { buildChoiceClue, buildQuizTargets, isCustomWord } from './quizService.js';

const words = [
  { id: 'toeic-l1-001', word: 'accommodate', simpleDefinition: 'to have enough space', collocation: 'accommodate guests' },
  { id: 'custom-1', word: 'allocate', simpleDefinition: 'to distribute according to a plan', collocation: '' },
  { id: 'batch-2', word: 'invoice', simpleDefinition: '', collocation: '', example: 'Please pay the invoice by Friday.' },
  { id: 'sheet-3', word: 'shipment', category: '自訂生詞', simpleDefinition: 'goods being delivered', collocation: 'track a shipment' },
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
});
