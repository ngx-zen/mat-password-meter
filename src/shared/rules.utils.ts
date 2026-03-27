import type {
  DisabledOptionKey,
  PasswordMeterMessages,
  PasswordRuleCheck,
  PasswordRuleLabels,
  PasswordRuleOptions,
} from './types';

const LOWERCASE_RE = /[a-z]/;
const UPPERCASE_RE = /[A-Z]/;
const NUMBER_RE = /\d/;
const SPECIAL_CHAR_RE = /[!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~]/;

export function evaluateRules(
  password: string,
  opts: PasswordRuleOptions,
  labels?: PasswordRuleLabels,
): PasswordRuleCheck[] {
  const checks: PasswordRuleCheck[] = [];
  if (opts.min) {
    const rawLabel = labels?.minLength;
    const label =
      typeof rawLabel === 'function'
        ? rawLabel(opts.min)
        : (rawLabel ?? `At least ${opts.min} characters`);
    checks.push({ label, passed: password.length >= opts.min });
  }
  if (opts.lowercase) {
    checks.push({
      label: labels?.lowercase ?? 'At least 1 lowercase letter',
      passed: LOWERCASE_RE.test(password),
    });
  }
  if (opts.uppercase) {
    checks.push({
      label: labels?.uppercase ?? 'At least 1 uppercase letter',
      passed: UPPERCASE_RE.test(password),
    });
  }
  if (opts.number) {
    checks.push({
      label: labels?.number ?? 'At least 1 number',
      passed: NUMBER_RE.test(password),
    });
  }
  if (opts.specialChar) {
    checks.push({
      label: labels?.specialChar ?? 'At least 1 special character',
      passed: SPECIAL_CHAR_RE.test(password),
    });
  }
  return checks;
}

export function scoreFromChecks(checks: PasswordRuleCheck[]): number {
  if (checks.length === 0) return 0;
  return Math.floor((checks.filter(c => c.passed).length / checks.length) * 100);
}

export function getMissingDisabledKeys(
  password: string,
  opts: Required<PasswordRuleOptions>,
): DisabledOptionKey[] {
  const missing: DisabledOptionKey[] = [];
  if (!opts.lowercase && !LOWERCASE_RE.test(password)) missing.push('lowercase');
  if (!opts.uppercase && !UPPERCASE_RE.test(password)) missing.push('uppercase');
  if (!opts.number && !NUMBER_RE.test(password)) missing.push('number');
  if (!opts.specialChar && !SPECIAL_CHAR_RE.test(password)) missing.push('specialChar');
  return missing;
}

export const DISABLED_KEY_LABELS: Record<DisabledOptionKey, string> = {
  lowercase: 'lowercase letters',
  uppercase: 'uppercase letters',
  number: 'numbers',
  specialChar: 'special characters',
};

export function resolveDisabledOptionsNudge(
  password: string,
  opts: Required<PasswordRuleOptions>,
  customFn: PasswordMeterMessages['disabledNudge'],
): string | null {
  const keys = getMissingDisabledKeys(password, opts);
  if (keys.length === 0) return null;
  if (customFn) return customFn(keys) || null;
  const items = keys.slice(0, 2).map(k => DISABLED_KEY_LABELS[k]);
  if (items.length === 1) return `Try adding ${items[0]}`;
  return `Try adding ${items[0]} or ${items[1]}`;
}
