import {
  evaluateRules,
  scoreFromChecks,
  resolveDisabledOptionsNudge,
  getMissingDisabledKeys,
} from './rules.utils';
import { DEFAULT_PASSWORD_RULE_OPTIONS } from './types';

describe('rules.utils', () => {
  describe('scoreFromChecks', () => {
    it('should return 0 for an empty checks array', () => {
      expect(scoreFromChecks([])).toBe(0);
    });

    it('should return 100 when all checks pass', () => {
      expect(
        scoreFromChecks([
          { label: 'a', passed: true },
          { label: 'b', passed: true },
        ]),
      ).toBe(100);
    });

    it('should return 50 when half the checks pass', () => {
      expect(
        scoreFromChecks([
          { label: 'a', passed: true },
          { label: 'b', passed: false },
        ]),
      ).toBe(50);
    });
  });

  describe('evaluateRules', () => {
    it('should include a min-length check when opts.min is set', () => {
      const checks = evaluateRules('hi', { min: 5 });
      expect(checks).toHaveLength(1);
      expect(checks[0].passed).toBe(false);
    });

    it('should mark min-length as passed when met', () => {
      const checks = evaluateRules('hello', { min: 5 });
      expect(checks[0].passed).toBe(true);
    });

    it('should check lowercase when opts.lowercase is set', () => {
      expect(evaluateRules('ABC', { lowercase: true })[0].passed).toBe(false);
      expect(evaluateRules('abc', { lowercase: true })[0].passed).toBe(true);
    });

    it('should check uppercase when opts.uppercase is set', () => {
      expect(evaluateRules('abc', { uppercase: true })[0].passed).toBe(false);
      expect(evaluateRules('ABC', { uppercase: true })[0].passed).toBe(true);
    });

    it('should check number when opts.number is set', () => {
      expect(evaluateRules('abc', { number: true })[0].passed).toBe(false);
      expect(evaluateRules('abc1', { number: true })[0].passed).toBe(true);
    });

    it('should check special character when opts.specialChar is set', () => {
      expect(evaluateRules('abc', { specialChar: true })[0].passed).toBe(false);
      expect(evaluateRules('abc!', { specialChar: true })[0].passed).toBe(true);
    });

    it('should not create checks for disabled rules', () => {
      const checks = evaluateRules('abc', {
        min: 0,
        lowercase: false,
        uppercase: false,
        number: false,
        specialChar: false,
      });
      expect(checks).toHaveLength(0);
    });
  });

  describe('custom labels', () => {
    it('should use a static minLength override', () => {
      const [check] = evaluateRules('hi', { min: 8 }, { minLength: 'Kailangan ng 8 titik' });
      expect(check.label).toBe('Kailangan ng 8 titik');
    });

    it('should use a function minLength override', () => {
      const [check] = evaluateRules(
        'hi',
        { min: 8 },
        { minLength: n => `Kailangan ng ${n} titik` },
      );
      expect(check.label).toBe('Kailangan ng 8 titik');
    });

    it('should use lowercase label override', () => {
      const [check] = evaluateRules(
        'ABC',
        { lowercase: true },
        { lowercase: 'Kailangan ng 1 maliit na letra' },
      );
      expect(check.label).toBe('Kailangan ng 1 maliit na letra');
    });

    it('should use uppercase label override', () => {
      const [check] = evaluateRules(
        'abc',
        { uppercase: true },
        { uppercase: 'Kailangan ng 1 malaking letra' },
      );
      expect(check.label).toBe('Kailangan ng 1 malaking letra');
    });

    it('should use number label override', () => {
      const [check] = evaluateRules('abc', { number: true }, { number: 'Kailangan ng 1 numero' });
      expect(check.label).toBe('Kailangan ng 1 numero');
    });

    it('should use specialChar label override', () => {
      const [check] = evaluateRules(
        'abc',
        { specialChar: true },
        { specialChar: 'Kailangan ng 1 espesyal na titik' },
      );
      expect(check.label).toBe('Kailangan ng 1 espesyal na titik');
    });

    it('should fall back to default labels when labels object is empty', () => {
      const [check] = evaluateRules('hi', { min: 5 }, {});
      expect(check.label).toBe('At least 5 characters');
    });
  });

  describe('getMissingDisabledKeys', () => {
    const allEnabled: Required<typeof DEFAULT_PASSWORD_RULE_OPTIONS> = {
      ...DEFAULT_PASSWORD_RULE_OPTIONS,
    };

    it('should return empty array when all options are enabled', () => {
      expect(getMissingDisabledKeys('abc', allEnabled)).toEqual([]);
    });

    it('should return empty array when disabled options are satisfied', () => {
      const opts = { ...allEnabled, uppercase: false };
      expect(getMissingDisabledKeys('ABC', opts)).toEqual([]);
    });

    it('should return keys for missing disabled classes', () => {
      const opts = { ...allEnabled, uppercase: false, number: false };
      expect(getMissingDisabledKeys('abc', opts)).toEqual(['uppercase', 'number']);
    });

    it('should return all four keys when all disabled and all missing', () => {
      const opts = {
        ...allEnabled,
        lowercase: false,
        uppercase: false,
        number: false,
        specialChar: false,
      };
      expect(getMissingDisabledKeys('', opts)).toEqual([
        'lowercase',
        'uppercase',
        'number',
        'specialChar',
      ]);
    });

    it('should not include enabled options in the result', () => {
      // uppercase is still enabled (true), so should never appear
      const opts = { ...allEnabled, number: false };
      expect(getMissingDisabledKeys('abc', opts)).toEqual(['number']);
    });
  });

  describe('resolveDisabledOptionsNudge (default nudge)', () => {
    const allEnabled: Required<typeof DEFAULT_PASSWORD_RULE_OPTIONS> = {
      ...DEFAULT_PASSWORD_RULE_OPTIONS,
    };

    it('should return null when all options are enabled', () => {
      expect(resolveDisabledOptionsNudge('abc', allEnabled, undefined)).toBeNull();
    });

    it('should return null when disabled options are satisfied by password', () => {
      const opts = { ...allEnabled, uppercase: false };
      expect(resolveDisabledOptionsNudge('ABC', opts, undefined)).toBeNull();
    });

    it('should return a single-item nudge', () => {
      const opts = { ...allEnabled, uppercase: false };
      expect(resolveDisabledOptionsNudge('abc', opts, undefined)).toBe(
        'Try adding uppercase letters',
      );
    });

    it('should combine two missing classes with "and"', () => {
      const opts = { ...allEnabled, uppercase: false, number: false };
      expect(resolveDisabledOptionsNudge('abc', opts, undefined)).toBe(
        'Try adding uppercase letters and numbers',
      );
    });

    it('should combine three missing classes with commas and "and"', () => {
      const opts = { ...allEnabled, uppercase: false, number: false, specialChar: false };
      expect(resolveDisabledOptionsNudge('abc', opts, undefined)).toBe(
        'Try adding uppercase letters, numbers, and special characters',
      );
    });

    it('should cap at 3 items when all 4 composition classes are disabled', () => {
      const opts = {
        ...allEnabled,
        lowercase: false,
        uppercase: false,
        number: false,
        specialChar: false,
      };
      const result = resolveDisabledOptionsNudge('12345678', opts, undefined);
      // password has numbers, so only lowercase, uppercase, specialChar are missing → 3 items
      expect(result).toBe(
        'Try adding lowercase letters, uppercase letters, and special characters',
      );
    });

    it('should return null when no composition options are disabled', () => {
      expect(resolveDisabledOptionsNudge('abc', allEnabled, undefined)).toBeNull();
    });
  });
});
