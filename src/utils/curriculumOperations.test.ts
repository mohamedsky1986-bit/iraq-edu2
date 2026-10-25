/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { test } from 'node:test';
import assert from 'node:assert';

// Pure logic for question reordering: تقديم (move up) and تأخير (move down)
export function reorderQuestions(
  questionIds: string[],
  index: number,
  direction: 'up' | 'down'
): string[] {
  if (direction === 'up') {
    if (index <= 0 || index >= questionIds.length) return questionIds;
    const next = [...questionIds];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    return next;
  } else {
    if (index < 0 || index >= questionIds.length - 1) return questionIds;
    const next = [...questionIds];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    return next;
  }
}

// Pure logic for booklet filtering
export interface TestBooklet {
  id: string;
  stageId: string;
  subjectId: string;
  chapter: string;
  isVipOnly: boolean;
}

export function filterBooklets(
  booklets: TestBooklet[],
  stageId: string,
  subjectId: string,
  vipOnly: boolean
): TestBooklet[] {
  return booklets.filter(b => {
    if (b.stageId !== stageId) return false;
    if (subjectId !== 'all' && b.subjectId !== subjectId) return false;
    if (vipOnly && !b.isVipOnly) return false;
    return true;
  });
}

// Logic for student stage locking: student cannot switch away from their bound stage
export function canStudentSwitchStage(
  role: 'student' | 'teacher',
  targetStageId: string | undefined,
  newStageId: string
): boolean {
  if (role === 'teacher') return true;
  if (!targetStageId) return true;
  return targetStageId === newStageId;
}

// Logic for registration unlock requirement: stage MUST be chosen before other fields unlock
export function canUnlockRegistrationFields(selectedStageId: string): boolean {
  return selectedStageId.trim().length > 0;
}

test('reorderQuestions moves question up (تقديم)', () => {
  const initial = ['q1', 'q2', 'q3'];
  const result = reorderQuestions(initial, 1, 'up');
  assert.deepStrictEqual(result, ['q2', 'q1', 'q3']);
});

test('reorderQuestions does not move beyond bounds at top', () => {
  const initial = ['q1', 'q2', 'q3'];
  const result = reorderQuestions(initial, 0, 'up');
  assert.deepStrictEqual(result, ['q1', 'q2', 'q3']);
});

test('reorderQuestions moves question down (تأخير)', () => {
  const initial = ['q1', 'q2', 'q3'];
  const result = reorderQuestions(initial, 1, 'down');
  assert.deepStrictEqual(result, ['q1', 'q3', 'q2']);
});

test('reorderQuestions does not move beyond bounds at bottom', () => {
  const initial = ['q1', 'q2', 'q3'];
  const result = reorderQuestions(initial, 2, 'down');
  assert.deepStrictEqual(result, ['q1', 'q2', 'q3']);
});

test('filterBooklets filters accurately by stage and VIP status', () => {
  const booklets: TestBooklet[] = [
    { id: 'b1', stageId: 'g3', subjectId: 'phys', chapter: 'ch1', isVipOnly: false },
    { id: 'b2', stageId: 'g3', subjectId: 'chem', chapter: 'ch1', isVipOnly: true },
    { id: 'b3', stageId: 'g6', subjectId: 'math', chapter: 'ch1', isVipOnly: true }
  ];

  const g3All = filterBooklets(booklets, 'g3', 'all', false);
  assert.strictEqual(g3All.length, 2);

  const g3Vip = filterBooklets(booklets, 'g3', 'all', true);
  assert.strictEqual(g3Vip.length, 1);
  assert.strictEqual(g3Vip[0].id, 'b2');

  const g6All = filterBooklets(booklets, 'g6', 'all', false);
  assert.strictEqual(g6All.length, 1);
  assert.strictEqual(g6All[0].id, 'b3');
});

test('canStudentSwitchStage locks student strictly to their registered stage', () => {
  // Student locked to grade-3-intermediate cannot switch to grade-6-prep-sci
  assert.strictEqual(canStudentSwitchStage('student', 'grade-3-intermediate', 'grade-6-prep-sci'), false);
  // Student can access their own registered stage
  assert.strictEqual(canStudentSwitchStage('student', 'grade-3-intermediate', 'grade-3-intermediate'), true);
  // Teacher can freely switch between all stages
  assert.strictEqual(canStudentSwitchStage('teacher', 'grade-3-intermediate', 'grade-6-prep-sci'), true);
});

test('canUnlockRegistrationFields keeps fields locked until stage is selected from dropdown', () => {
  assert.strictEqual(canUnlockRegistrationFields(''), false);
  assert.strictEqual(canUnlockRegistrationFields('grade-3-intermediate'), true);
  assert.strictEqual(canUnlockRegistrationFields('grade-6-prep-sci'), true);
});

