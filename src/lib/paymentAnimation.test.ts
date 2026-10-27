import { describe, expect, test } from 'bun:test';
import { getSuccessStage, TICK_DURATION_MS, CHARACTER_DURATION_MS } from './paymentAnimation';
import { getEventTheme } from './celebrationTheme';

describe('payment celebration timing', () => {
  test('tick lasts exactly three seconds', () => {
    expect(TICK_DURATION_MS).toBe(3000);
    expect(getSuccessStage(0)).toBe('tick');
    expect(getSuccessStage(2999)).toBe('tick');
    expect(getSuccessStage(3000)).toBe('character');
  });
  test('character lasts three seconds before dismissal', () => {
    expect(CHARACTER_DURATION_MS).toBe(3000);
    expect(getSuccessStage(5999)).toBe('character');
    expect(getSuccessStage(6000)).toBe('dismiss');
  });
});

describe('requested seasonal celebrations', () => {
  test('Halloween runs throughout October', () => {
    expect(getEventTheme(new Date(2026, 9, 1))?.key).toBe('halloween');
    expect(getEventTheme(new Date(2026, 9, 31))?.key).toBe('halloween');
  });
  test('Christmas runs throughout December', () => {
    expect(getEventTheme(new Date(2026, 11, 1))?.key).toBe('christmas');
    expect(getEventTheme(new Date(2026, 11, 31))?.key).toBe('christmas');
  });
  test('New Year uses fireworks', () => {
    expect(getEventTheme(new Date(2026, 0, 1))?.key).toBe('newyear');
    expect(getEventTheme(new Date(2026, 0, 7))?.key).toBe('newyear');
    expect(getEventTheme(new Date(2026, 0, 8))).toBeNull();
  });
});