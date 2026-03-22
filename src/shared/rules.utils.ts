import type { PasswordRuleCheck, PasswordRuleLabels, PasswordRuleOptions } from './types';

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
    checks.push({ label: labels?.number ?? 'At least 1 number', passed: NUMBER_RE.test(password) });
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
