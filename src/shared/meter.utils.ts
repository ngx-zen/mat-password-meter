import type { PasswordStrengthLabels, ZxcvbnScore } from './types';

export const ZXCVBN_SCORE_MAP: Record<ZxcvbnScore, number> = {
  0: 0,
  1: 25,
  2: 50,
  3: 75,
  4: 100,
};

export type StrengthColor = 'warn' | 'accent' | 'primary';

const WARN_THRESHOLD = 21;
const ACCENT_THRESHOLD = 81;

export function scoreToColor(value: number): StrengthColor {
  if (value < WARN_THRESHOLD) return 'warn';
  if (value < ACCENT_THRESHOLD) return 'accent';
  return 'primary';
}

export function scoreToLabel(value: number, labels?: PasswordStrengthLabels): string {
  if (value === 0) return labels?.veryWeak ?? 'Very Weak';
  if (value <= 25) return labels?.weak ?? 'Weak';
  if (value <= 50) return labels?.fair ?? 'Fair';
  if (value <= 75) return labels?.good ?? 'Good';
  if (value < 100) return labels?.strong ?? 'Strong';
  return labels?.veryStrong ?? 'Very Strong';
}
