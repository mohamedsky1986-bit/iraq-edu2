/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';

function validatePasscode(entered: string, stored: string): boolean {
  return entered.trim() === stored.trim() && stored.trim().length >= 4;
}

function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');
}

function formatIraqiPrice(amount: number): string {
  return `${amount.toLocaleString('en-US')} د.ع`;
}

test('passcode validation accepts exact match with minimum 4 digits', () => {
  assert.equal(validatePasscode('1986', '1986'), true);
  assert.equal(validatePasscode(' 1986 ', '1986'), true);
  assert.equal(validatePasscode('0000', '1986'), false);
  assert.equal(validatePasscode('12', '12'), false); // too short
});

test('normalizeUsername sanitizes Arabic characters and spaces into valid usernames', () => {
  assert.equal(normalizeUsername('Ali Ahmed'), 'ali_ahmed');
  assert.equal(normalizeUsername('student.iq@nobogh'), 'student_iq_nobogh');
});

test('formatIraqiPrice appends Iraqi Dinar currency symbol', () => {
  assert.equal(formatIraqiPrice(25000), '25,000 د.ع');
});
