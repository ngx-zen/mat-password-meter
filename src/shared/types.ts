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

// 'contextual': single inline hint (default) | 'full': progressive panel | 'hidden': nothing
export type FeedbackMode = 'hidden' | 'contextual' | 'full';

export type PasswordMeterMessages = Partial<{
  looksGreat: string;
  nudge: string;
}>;

export const DEFAULT_PASSWORD_METER_MESSAGES: Required<PasswordMeterMessages> = {
  looksGreat: 'Looks great!',
  nudge: 'Make it harder to guess.',
};
