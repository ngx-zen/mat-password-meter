import type { ZxcvbnScore } from './types';

export const ZXCVBN_SCORE_MAP: Record<ZxcvbnScore, number> = {
  0: 0,
  1: 25,
  2: 50,
  3: 75,
  4: 100,
};

export type StrengthColor = 'warn' | 'accent' | 'primary';

// 0–20 → warn (red), 21–80 → accent (yellow), 81–100 → primary (green)
const WARN_THRESHOLD = 21;
const ACCENT_THRESHOLD = 81;

export function scoreToColor(value: number): StrengthColor {
  if (value < WARN_THRESHOLD) return 'warn';
  if (value < ACCENT_THRESHOLD) return 'accent';
  return 'primary';
}

export function scoreToLabel(value: number): string {
  if (value === 0) return 'Very Weak';
  if (value <= 25) return 'Weak';
  if (value <= 50) return 'Fair';
  if (value <= 75) return 'Good';
  if (value < 100) return 'Strong';
  return 'Very Strong';
}
