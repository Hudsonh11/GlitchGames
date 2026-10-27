export const TICK_DURATION_MS = 3000;
export const CHARACTER_DURATION_MS = 3000;
export const DISMISS_DURATION_MS = 280;

export type SuccessStage = 'tick' | 'character' | 'dismiss';

export function getSuccessStage(elapsedMs: number): SuccessStage {
  if (elapsedMs < TICK_DURATION_MS) return 'tick';
  if (elapsedMs < TICK_DURATION_MS + CHARACTER_DURATION_MS) return 'character';
  return 'dismiss';
}