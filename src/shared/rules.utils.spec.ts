import { evaluateRules, scoreFromChecks } from './rules.utils';

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
});
