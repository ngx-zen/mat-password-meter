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
});
