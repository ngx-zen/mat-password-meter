import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PasswordRulesComponent } from './password-rules.component';

describe('PasswordRulesComponent', () => {
  let component: PasswordRulesComponent;
  let componentRef: ComponentRef<PasswordRulesComponent>;
  let fixture: ComponentFixture<PasswordRulesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [PasswordRulesComponent] });
    fixture = TestBed.createComponent(PasswordRulesComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('strength()', () => {
    it('should return 100 for a password satisfying all default rules', () => {
      componentRef.setInput('password', 'Abcdef1!');
      expect(component.strength()).toBe(100);
    });

    it('should return 0 for an empty password', () => {
      componentRef.setInput('password', '');
      expect(component.strength()).toBe(0);
    });

    it('should return 0 when all rules are explicitly disabled', () => {
      componentRef.setInput('options', {
        min: 0,
        lowercase: false,
        uppercase: false,
        number: false,
        specialChar: false,
      });
      componentRef.setInput('password', 'Abcdef1!');
      expect(component.strength()).toBe(0);
    });

    it('should merge partial options with defaults', () => {
      componentRef.setInput('options', { specialChar: false });
      componentRef.setInput('password', 'Abcdef12');
      expect(component.strength()).toBe(100);
    });

    it('should give partial credit for partially met rules', () => {
      componentRef.setInput('password', 'abc');
      expect(component.strength()).toBe(20);
    });

    it('should credit the minimum-length rule independently', () => {
      componentRef.setInput('password', 'abcdefgh');
      componentRef.setInput('options', {
        min: 8,
        lowercase: false,
        uppercase: false,
        number: false,
        specialChar: false,
      });
      expect(component.strength()).toBe(100);
    });

    it('should detect special characters', () => {
      componentRef.setInput('password', '!!!!!!!!');
      componentRef.setInput('options', {
        min: 0,
        lowercase: false,
        uppercase: false,
        number: false,
        specialChar: true,
      });
      expect(component.strength()).toBe(100);
    });

    it('should respect a custom minimum length', () => {
      componentRef.setInput('password', 'abcdef');
      componentRef.setInput('options', {
        min: 6,
        uppercase: false,
        number: false,
        specialChar: false,
      });
      expect(component.strength()).toBe(100);
    });
  });

  describe('color()', () => {
    // 5-rule scale: 0→0, 1→20, 2→40, 3→60, 4→80, 5→100
    // warn: < 21 | accent: 21–80 | primary: ≥ 81
    it('should return warn when strength is 0', () => {
      componentRef.setInput('password', '');
      expect(component.color()).toBe('warn');
    });

    it('should return warn when strength is 20 (1/5 rules)', () => {
      componentRef.setInput('password', 'abc');
      expect(component.color()).toBe('warn');
    });

    it('should return accent when strength is 60 (3/5 rules)', () => {
      componentRef.setInput('password', 'Abcdefgh');
      expect(component.color()).toBe('accent');
    });

    it('should return primary when strength is 100', () => {
      componentRef.setInput('password', 'Abcdef1!');
      expect(component.color()).toBe('primary');
    });
  });

  describe('strengthLabel()', () => {
    it('should return "Very Weak" when strength is 0', () => {
      componentRef.setInput('password', '');
      expect(component.strengthLabel()).toBe('Very Weak');
    });

    it('should return "Weak" when strength is 20', () => {
      componentRef.setInput('password', 'abc');
      expect(component.strengthLabel()).toBe('Weak');
    });

    it('should return "Fair" when strength is 40 (2/5 rules)', () => {
      componentRef.setInput('password', 'Abc');
      expect(component.strengthLabel()).toBe('Fair');
    });

    it('should return "Good" when strength is 60 (3/5 rules)', () => {
      componentRef.setInput('password', 'Abcdefgh');
      expect(component.strengthLabel()).toBe('Good');
    });

    it('should return "Strong" when strength is 80 (4/5 rules)', () => {
      componentRef.setInput('password', 'Abcdefg1');
      expect(component.strengthLabel()).toBe('Strong');
    });

    it('should return "Very Strong" when strength is 100', () => {
      componentRef.setInput('password', 'Abcdef1!');
      expect(component.strengthLabel()).toBe('Very Strong');
    });
  });

  describe('ruleChecks()', () => {
    it('should return one entry per enabled rule', () => {
      componentRef.setInput('options', {
        min: 8,
        lowercase: true,
        uppercase: false,
        number: false,
        specialChar: false,
      });
      componentRef.setInput('password', 'abc');
      expect(component.ruleChecks().length).toBe(2);
    });

    it('should mark a passing rule as passed', () => {
      componentRef.setInput('options', {
        min: 8,
        lowercase: true,
        uppercase: false,
        number: false,
        specialChar: false,
      });
      componentRef.setInput('password', 'abcdefgh');
      const lowercaseCheck = component
        .ruleChecks()
        .find(r => r.label === 'At least 1 lowercase letter')!;
      expect(lowercaseCheck.passed).toBe(true);
    });

    it('should mark a failing rule as not passed', () => {
      componentRef.setInput('options', {
        min: 8,
        lowercase: false,
        uppercase: true,
        number: false,
        specialChar: false,
      });
      componentRef.setInput('password', 'abcdefgh');
      const uppercaseCheck = component
        .ruleChecks()
        .find(r => r.label === 'At least 1 uppercase letter')!;
      expect(uppercaseCheck.passed).toBe(false);
    });

    it('should include a min-length rule with the correct label', () => {
      componentRef.setInput('options', { min: 12 });
      componentRef.setInput('password', 'short');
      const checks = component.ruleChecks();
      const minCheck = checks.find(r => r.label === 'At least 12 characters');
      expect(minCheck).toBeTruthy();
      expect(minCheck!.passed).toBe(false);
    });
  });

  describe('template', () => {
    it('should render a mat-progress-bar element', () => {
      expect(fixture.debugElement.query(By.css('mat-progress-bar'))).toBeTruthy();
    });

    describe('hideStrength', () => {
      it('should not render the strength label when hideStrength is true (default)', () => {
        expect(fixture.debugElement.query(By.css('.password-meter-label'))).toBeNull();
      });

      it('should render the strength label when hideStrength is false', () => {
        componentRef.setInput('password', 'Abcdef1!');
        componentRef.setInput('hideStrength', false);
        fixture.detectChanges();
        const label = fixture.debugElement.query(By.css('.password-meter-label'));
        expect(label).toBeTruthy();
        expect(label.nativeElement.textContent.trim()).toBe('Very Strong');
      });

      it('should hide the label again when hideStrength is switched back to true', () => {
        componentRef.setInput('password', 'Abcdef1!');
        componentRef.setInput('hideStrength', false);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.password-meter-label'))).toBeTruthy();
        componentRef.setInput('hideStrength', true);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.password-meter-label'))).toBeNull();
      });
    });

    describe('hideFeedback', () => {
      it('should not render the rule checklist with contextual feedback (default)', () => {
        expect(fixture.debugElement.query(By.css('.password-meter-rules'))).toBeNull();
      });

      it('should render the rule checklist when rules are pending', () => {
        componentRef.setInput('password', 'abc');
        componentRef.setInput('feedback', 'full');
        fixture.detectChanges();
        const checklist = fixture.debugElement.query(By.css('.password-meter-rules'));
        expect(checklist).toBeTruthy();
        expect(
          fixture.debugElement.queryAll(By.css('.password-meter-rules li')).length,
        ).toBeGreaterThan(0);
      });

      it('should hide the checklist and show "Looks great!" once all rules pass in full mode', () => {
        componentRef.setInput('password', 'Abcdef1!');
        componentRef.setInput('feedback', 'full');
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.password-meter-rules'))).toBeNull();
        const hint = fixture.debugElement.query(By.css('.password-meter-hint.passed'));
        expect(hint).toBeTruthy();
        expect(hint.nativeElement.textContent).toContain('Looks great!');
      });

      it('should not show looksGreat in full mode when rules are not all passing', () => {
        componentRef.setInput('password', 'abc');
        componentRef.setInput('feedback', 'full');
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.password-meter-hint.passed'))).toBeNull();
      });

      it('should suppress looksGreat in full mode when set to empty string', () => {
        componentRef.setInput('password', 'Abcdef1!');
        componentRef.setInput('feedback', 'full');
        componentRef.setInput('messages', { looksGreat: '' });
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.password-meter-hint.passed'))).toBeNull();
      });
    });

    describe('messages', () => {
      it('should show "Looks great!" when all rules pass in contextual mode', () => {
        componentRef.setInput('password', 'Abcdef1!');
        fixture.detectChanges();
        const hint = fixture.debugElement.query(By.css('.password-meter-hint.passed'));
        expect(hint).toBeTruthy();
        expect(hint.nativeElement.textContent).toContain('Looks great!');
      });

      it('should show a custom looksGreat message', () => {
        componentRef.setInput('password', 'Abcdef1!');
        componentRef.setInput('messages', { looksGreat: 'Perfect!' });
        fixture.detectChanges();
        const hint = fixture.debugElement.query(By.css('.password-meter-hint.passed'));
        expect(hint).toBeTruthy();
        expect(hint.nativeElement.textContent).toContain('Perfect!');
      });

      it('should suppress looksGreat when set to empty string', () => {
        componentRef.setInput('password', 'Abcdef1!');
        componentRef.setInput('messages', { looksGreat: '' });
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.password-meter-hint.passed'))).toBeNull();
      });

      it('should use custom strengthLabels when provided', () => {
        componentRef.setInput('password', 'Abcdef1!');
        componentRef.setInput('messages', { strengthLabels: { veryStrong: 'Napakalakas' } });
        expect(component.strengthLabel()).toBe('Napakalakas');
      });

      it('should fall back to default strength labels for absent keys', () => {
        componentRef.setInput('password', '');
        componentRef.setInput('messages', { strengthLabels: { veryStrong: 'Napakalakas' } });
        expect(component.strengthLabel()).toBe('Very Weak');
      });

      it('should use custom ruleLabels (static) when provided', () => {
        componentRef.setInput('password', 'abc');
        componentRef.setInput('messages', { ruleLabels: { minLength: 'Kailangan ng 8 titik' } });
        const minCheck = component.ruleChecks().find(r => r.label === 'Kailangan ng 8 titik');
        expect(minCheck).toBeTruthy();
      });

      it('should use custom ruleLabels (function) for minLength', () => {
        componentRef.setInput('password', 'abc');
        componentRef.setInput('messages', {
          ruleLabels: { minLength: (n: number) => `Min. ${n} chars` },
        });
        const minCheck = component.ruleChecks().find(r => r.label === 'Min. 8 chars');
        expect(minCheck).toBeTruthy();
      });
    });
  });

  describe('contextualHint()', () => {
    it('should return the first failing rule', () => {
      componentRef.setInput('password', 'abc');
      const hint = component.contextualHint();
      expect(hint).not.toBeNull();
      expect(hint?.label).toBe('At least 8 characters');
      expect(hint?.passed).toBe(false);
    });

    it('should return null when all rules pass', () => {
      componentRef.setInput('password', 'Abcdef1!');
      expect(component.contextualHint()).toBeNull();
    });
  });

  describe('outputs', () => {
    it('should emit strengthChange with current score when password changes', () => {
      const emitted: number[] = [];
      const sub = component.strengthChange.subscribe(v => emitted.push(v));
      componentRef.setInput('password', 'Abcdef1!');
      fixture.detectChanges();
      expect(emitted).toContain(100);
      sub.unsubscribe();
    });

    it('should emit isValid true when all rules pass', () => {
      const validValues: boolean[] = [];
      const sub = component.isValid.subscribe(v => validValues.push(v));
      componentRef.setInput('password', 'Abcdef1!');
      fixture.detectChanges();
      expect(validValues).toContain(true);
      sub.unsubscribe();
    });

    it('should emit isValid false when rules are not all satisfied', () => {
      const validValues: boolean[] = [];
      componentRef.setInput('password', 'Abcdef1!');
      fixture.detectChanges();
      const sub = component.isValid.subscribe(v => validValues.push(v));
      componentRef.setInput('password', 'abc');
      fixture.detectChanges();
      expect(validValues).toContain(false);
      sub.unsubscribe();
    });
  });

  describe('customRules', () => {
    const noUsername = (pw: string) => [
      { label: 'Must not contain username', passed: !pw.includes('admin') },
    ];

    it('should expose custom rule checks in customRuleChecks()', () => {
      componentRef.setInput('customRules', noUsername);
      componentRef.setInput('password', 'Abcdef1!');
      fixture.detectChanges();
      const labels = component.customRuleChecks().map(r => r.label);
      expect(labels).toContain('Must not contain username');
    });

    it('should not include custom rules in ruleChecks()', () => {
      componentRef.setInput('customRules', noUsername);
      componentRef.setInput('password', 'Abcdef1!');
      fixture.detectChanges();
      expect(component.ruleChecks().length).toBe(5);
    });

    it('should not affect strength when custom rule fails', () => {
      componentRef.setInput('customRules', noUsername);
      componentRef.setInput('password', 'admin1A!');
      fixture.detectChanges();
      expect(component.strength()).toBe(100);
    });

    it('should block isValid when custom rule fails even if strength is 100', () => {
      const validValues: boolean[] = [];
      componentRef.setInput('customRules', noUsername);
      componentRef.setInput('password', 'admin1A!');
      const sub = component.isValid.subscribe(v => validValues.push(v));
      fixture.detectChanges();
      expect(validValues).toContain(false);
      sub.unsubscribe();
    });

    it('should emit isValid true when all built-in and custom rules pass', () => {
      const validValues: boolean[] = [];
      componentRef.setInput('customRules', noUsername);
      componentRef.setInput('password', 'Abcdef1!');
      const sub = component.isValid.subscribe(v => validValues.push(v));
      fixture.detectChanges();
      expect(validValues).toContain(true);
      sub.unsubscribe();
    });

    it('should show custom rule failure as contextual hint', () => {
      componentRef.setInput('customRules', noUsername);
      componentRef.setInput('password', 'admin1A!');
      fixture.detectChanges();
      expect(component.contextualHint()?.label).toBe('Must not contain username');
    });

    it('should show built-in failure first when both fail', () => {
      componentRef.setInput('customRules', noUsername);
      componentRef.setInput('password', 'admin');
      fixture.detectChanges();
      expect(component.contextualHint()?.label).toBe('At least 8 characters');
    });

    it('should return empty customRuleChecks when customRules is undefined', () => {
      componentRef.setInput('password', 'Abcdef1!');
      fixture.detectChanges();
      expect(component.customRuleChecks().length).toBe(0);
    });

    it('should return empty customRuleChecks when password is empty', () => {
      componentRef.setInput('customRules', noUsername);
      componentRef.setInput('password', '');
      fixture.detectChanges();
      expect(component.customRuleChecks().length).toBe(0);
    });

    it('should override color to warn when custom rule fails even if strength is 100', () => {
      componentRef.setInput('customRules', noUsername);
      componentRef.setInput('password', 'admin1A!');
      fixture.detectChanges();
      expect(component.strength()).toBe(100);
      expect(component.color()).toBe('warn');
    });

    it('should use normal color when custom rules all pass', () => {
      componentRef.setInput('customRules', noUsername);
      componentRef.setInput('password', 'Abcdef1!');
      fixture.detectChanges();
      expect(component.color()).toBe('primary');
    });
  });
});
