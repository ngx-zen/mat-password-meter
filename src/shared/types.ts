export type PasswordRuleOptions = Partial<{
  min: number;
  lowercase: boolean;
  uppercase: boolean;
  number: boolean;
  specialChar: boolean;
}>;

export const DEFAULT_PASSWORD_RULE_OPTIONS: Required<PasswordRuleOptions> = {
  min: 8,
  lowercase: true,
  uppercase: true,
  number: true,
  specialChar: true,
};

export interface PasswordRuleCheck {
  label: string;
  passed: boolean;
}

export type ZxcvbnScore = 0 | 1 | 2 | 3 | 4;

export interface ZxcvbnResult {
  score: ZxcvbnScore;
  feedback: {
    warning: string;
    suggestions: string[];
  };
  crack_times_display: {
    online_throttling_100_per_hour: string;
    online_no_throttling_10_per_second: string;
    offline_slow_hashing_1e4_per_second: string;
    offline_fast_hashing_1e10_per_second: string;
  };
}

export type ZxcvbnFn = (password: string, userInputs?: string[]) => ZxcvbnResult;

export type DisabledOptionKey = 'lowercase' | 'uppercase' | 'number' | 'specialChar';

export type FeedbackMode = 'hidden' | 'contextual' | 'full';

export type PasswordStrengthLabels = Partial<{
  veryWeak: string;
  weak: string;
  fair: string;
  good: string;
  strong: string;
  veryStrong: string;
}>;

export type PasswordRuleLabels = Partial<{
  minLength: string | ((n: number) => string);
  lowercase: string;
  uppercase: string;
  number: string;
  specialChar: string;
}>;

export type PasswordMeterMessages = Partial<{
  looksGreat: string;
  nudge: string;
  disabledNudge: (missingKeys: DisabledOptionKey[]) => string;
  strengthLabels: PasswordStrengthLabels;
  ruleLabels: PasswordRuleLabels;
}>;

export const DEFAULT_PASSWORD_METER_MESSAGES: Required<
  Omit<PasswordMeterMessages, 'disabledNudge'>
> = {
  looksGreat: 'Looks great!',
  nudge: 'Make it harder to guess.',
  strengthLabels: {},
  ruleLabels: {},
};
