import { scoreToColor, scoreToLabel, ZXCVBN_SCORE_MAP } from './meter.utils';

describe('meter.utils', () => {
  describe('ZXCVBN_SCORE_MAP', () => {
    it('should map score 0 to 0', () => expect(ZXCVBN_SCORE_MAP[0]).toBe(0));
    it('should map score 1 to 25', () => expect(ZXCVBN_SCORE_MAP[1]).toBe(25));
    it('should map score 2 to 50', () => expect(ZXCVBN_SCORE_MAP[2]).toBe(50));
    it('should map score 3 to 75', () => expect(ZXCVBN_SCORE_MAP[3]).toBe(75));
    it('should map score 4 to 100', () => expect(ZXCVBN_SCORE_MAP[4]).toBe(100));
  });

  describe('scoreToColor', () => {
    it('should return "warn" for 0', () => expect(scoreToColor(0)).toBe('warn'));
    it('should return "warn" for 20 (boundary)', () => expect(scoreToColor(20)).toBe('warn'));
    it('should return "accent" for 21 (boundary)', () => expect(scoreToColor(21)).toBe('accent'));
    it('should return "accent" for 50', () => expect(scoreToColor(50)).toBe('accent'));
    it('should return "accent" for 80 (boundary)', () => expect(scoreToColor(80)).toBe('accent'));
    it('should return "primary" for 81 (boundary)', () => expect(scoreToColor(81)).toBe('primary'));
    it('should return "primary" for 100', () => expect(scoreToColor(100)).toBe('primary'));
  });

  describe('scoreToLabel', () => {
    it('should return "Very Weak" for 0', () => expect(scoreToLabel(0)).toBe('Very Weak'));
    it('should return "Weak" for 1', () => expect(scoreToLabel(1)).toBe('Weak'));
    it('should return "Weak" for 25', () => expect(scoreToLabel(25)).toBe('Weak'));
    it('should return "Fair" for 26', () => expect(scoreToLabel(26)).toBe('Fair'));
    it('should return "Fair" for 50', () => expect(scoreToLabel(50)).toBe('Fair'));
    it('should return "Good" for 51', () => expect(scoreToLabel(51)).toBe('Good'));
    it('should return "Good" for 75', () => expect(scoreToLabel(75)).toBe('Good'));
    it('should return "Strong" for 76', () => expect(scoreToLabel(76)).toBe('Strong'));
    it('should return "Strong" for 99', () => expect(scoreToLabel(99)).toBe('Strong'));
    it('should return "Very Strong" for 100', () => expect(scoreToLabel(100)).toBe('Very Strong'));
  });
});
