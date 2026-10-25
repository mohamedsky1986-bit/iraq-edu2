/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeArabicText,
  levenshteinDistance,
  evaluateFillBlankAnswer
} from './fuzzyMatching';

test('normalizeArabicText strips diacritics, unifies alef and taa marbuta', () => {
  const input = '  المَدْرَسَةُ الإِعْدَادِيَّةُ!  ';
  const expected = 'المدرسه الاعداديه';
  assert.equal(normalizeArabicText(input), expected);
});

test('levenshteinDistance computes accurate edit operations', () => {
  assert.equal(levenshteinDistance('نيوترون', 'نيوترون'), 0);
  assert.equal(levenshteinDistance('نيوترون', 'نيترون'), 1);
  assert.equal(levenshteinDistance('بروتون', 'الكترون'), 4);
});

test('evaluateFillBlankAnswer gives 100% exact match for exact input', () => {
  const result = evaluateFillBlankAnswer('التمثيل الضوئي', ['التمثيل الضوئي']);
  assert.equal(result.isCorrect, true);
  assert.equal(result.isExact, true);
  assert.equal(result.hasTypoAlert, false);
  assert.equal(result.similarityPercent, 100);
});

test('evaluateFillBlankAnswer accepts answers with minor Arabic typos and alerts student', () => {
  // Missing waw in 'نيوترونات' -> 'نيترونات'
  const result = evaluateFillBlankAnswer('نيترونات', ['نيوترونات']);
  assert.equal(result.isCorrect, true);
  assert.equal(result.isExact, false);
  assert.equal(result.hasTypoAlert, true);
  assert.ok(result.tip?.includes('نيوترونات'));
});

test('evaluateFillBlankAnswer accepts missing or extra Al-taareef with alert', () => {
  const result = evaluateFillBlankAnswer('جاذبية', ['الجاذبية']);
  assert.equal(result.isCorrect, true);
  assert.equal(result.hasTypoAlert, true);
});

test('evaluateFillBlankAnswer rejects completely wrong answers', () => {
  const result = evaluateFillBlankAnswer('الهيدروجين', ['الأكسجين']);
  assert.equal(result.isCorrect, false);
  assert.equal(result.isExact, false);
});

test('evaluateFillBlankAnswer handles empty or blank inputs gracefully', () => {
  const result = evaluateFillBlankAnswer('   ', ['الميتوكوندريا']);
  assert.equal(result.isCorrect, false);
  assert.equal(result.feedbackMessage.length > 0, true);
});
