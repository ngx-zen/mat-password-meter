import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PasswordStrengthComponent } from './password-strength.component';

// score 4 = 100% from zxcvbn, so rules drive the strength phase in these tests
jest.mock('zxcvbn', () => ({
  __esModule: true,
  default: jest.fn((_password: string, _userInputs?: string[]) => ({
    score: 4,
    feedback: { warning: '', suggestions: [] },
    crack_times_display: {
      online_throttling_100_per_hour: 'centuries',
      online_no_throttling_10_per_second: '100 years',
      offline_slow_hashing_1e4_per_second: '10 years',
      offline_fast_hashing_1e10_per_second: '1 month',
    },
  })),
}));

describe('PasswordStrengthComponent', () => {
  let component: PasswordStrengthComponent;
  let componentRef: ComponentRef<PasswordStrengthComponent>;
  let fixture: ComponentFixture<PasswordStrengthComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [PasswordStrengthComponent] });
    fixture = TestBed.createComponent(PasswordStrengthComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('phased strength logic', () => {
    it('should return 0 when password is empty', () => {
      componentRef.setInput('password', '');
      expect(component.strength()).toBe(0);
    });

    it('should show rulesPercent when rules are not yet satisfied', fakeAsync(() => {
      componentRef.setInput('password', 'abc');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect((component as any).zxcvbnPercent()).toBe(100);
      expect((component as any).rulesPercent()).toBe(20);
      expect(component.strength()).toBe(20);
    }));

    it('should reach 100 only when both entropy and all rules are fully satisfied', fakeAsync(() => {
      componentRef.setInput('password', 'Abcdef1!');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect((component as any).zxcvbnPercent()).toBe(100);
      expect((component as any).rulesPercent()).toBe(100);
      expect(component.strength()).toBe(100);
    }));

    it('should return "Looks great!" from mergedHint when no rules are active and zxcvbn scores 4', fakeAsync(() => {
      componentRef.setInput('password', 'Abcdef1!');
      componentRef.setInput('options', {
        min: 0,
        lowercase: false,
        uppercase: false,
        number: false,
        specialChar: false,
      });
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect(component.mergedHint()).toEqual({ type: 'ok', text: 'Looks great!' });
    }));

    it('should expose rulesPercent and zxcvbnPercent independently', fakeAsync(() => {
      componentRef.setInput('password', 'Abcdefgh');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect((component as any).rulesPercent()).toBe(60);
      expect((component as any).zxcvbnPercent()).toBe(100);
      expect(component.strength()).toBe(60);
    }));
  });

  describe('color() and strengthLabel()', () => {
    it('should return primary and "Very Strong" when strength is 100', fakeAsync(() => {
      componentRef.setInput('password', 'Abcdef1!');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect(component.color()).toBe('primary');
      expect(component.strengthLabel()).toBe('Very Strong');
    }));
  });

  describe('template', () => {
    it('should render a mat-progress-bar', () => {
      expect(fixture.debugElement.query(By.css('mat-progress-bar'))).toBeTruthy();
    });

    describe('hideFeedback', () => {
      it('should render a contextual hint by default', () => {
        componentRef.setInput('password', 'abc');
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.password-meter-hint'))).toBeTruthy();
      });

      it('should not render any feedback when feedback is hidden', () => {
        componentRef.setInput('feedback', 'hidden');
        fixture.detectChanges();
        const wrapper = fixture.debugElement.query(By.css('.password-meter-feedback'));
        expect(wrapper).toBeTruthy();
        expect(wrapper.classes['active']).toBeFalsy();
        expect(fixture.debugElement.query(By.css('.password-meter-hint'))).toBeNull();
      });

      it('should show the rules panel when rules are pending', fakeAsync(() => {
        componentRef.setInput('password', 'some-password'); // missing uppercase, number, special char
        componentRef.setInput('feedback', 'full');
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.password-meter-rules'))).toBeTruthy();
      }));

      it('should show the analysis panel once all rules pass', fakeAsync(() => {
        componentRef.setInput('password', 'Abcdef1!'); // satisfies all rules; mock returns score 4
        componentRef.setInput('feedback', 'full');
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.password-meter-rules'))).toBeNull();
        expect(fixture.debugElement.query(By.css('.password-meter-hint.passed'))).toBeTruthy();
      }));

      it('should render a single merged hint when feedback is contextual', fakeAsync(() => {
        componentRef.setInput('password', 'abc'); // fails multiple rules
        componentRef.setInput('feedback', 'contextual');
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('.password-meter-hint'))).toBeTruthy();
      }));

      it('should show ✓ Looks great! merged hint when all rules and zxcvbn are satisfied', fakeAsync(() => {
        componentRef.setInput('password', 'Abcdef1!');
        componentRef.setInput('feedback', 'contextual');
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        const hint = fixture.debugElement.query(By.css('.password-meter-hint.passed'));
        expect(hint).toBeTruthy();
        expect(hint.nativeElement.textContent).toContain('Looks great!');
      }));

      it('should show "Make it harder to guess." nudge in contextual mode when all rules pass but zxcvbn score < 4 and no suggestions', fakeAsync(() => {
        const zxcvbnMock = jest.requireMock<{ default: jest.Mock }>('zxcvbn').default;
        zxcvbnMock.mockReturnValueOnce({
          score: 2,
          feedback: { warning: '', suggestions: [] },
          crack_times_display: {
            online_throttling_100_per_hour: 'centuries',
            online_no_throttling_10_per_second: '100 years',
            offline_slow_hashing_1e4_per_second: '10 years',
            offline_fast_hashing_1e10_per_second: '1 month',
          },
        });
        componentRef.setInput('password', 'Abcdef1!');
        componentRef.setInput('feedback', 'contextual');
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        expect(component.mergedHint()?.type).toBe('nudge');
        expect(fixture.nativeElement.textContent).toContain('Make it harder to guess.');
      }));

      it('should show first suggestion as hint in contextual mode when warning is empty but suggestions exist', fakeAsync(() => {
        const zxcvbnMock = jest.requireMock<{ default: jest.Mock }>('zxcvbn').default;
        zxcvbnMock.mockReturnValueOnce({
          score: 2,
          feedback: {
            warning: '',
            suggestions: ['Add another word or two.', 'Avoid repeated words.'],
          },
          crack_times_display: {
            online_throttling_100_per_hour: 'centuries',
            online_no_throttling_10_per_second: '100 years',
            offline_slow_hashing_1e4_per_second: '10 years',
            offline_fast_hashing_1e10_per_second: '1 month',
          },
        });
        componentRef.setInput('password', 'Abcdef1!');
        componentRef.setInput('feedback', 'contextual');
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        expect(component.mergedHint()?.type).toBe('suggestion');
        expect(component.mergedHint()?.text).toBe('Add another word or two.');
        const hint = fixture.debugElement.query(By.css('.password-meter-hint'));
        expect(hint).toBeTruthy();
        expect(hint.nativeElement.textContent).toContain('Add another word or two.');
        expect(fixture.nativeElement.textContent).not.toContain('Make it harder to guess.');
      }));

      it('should render the rule checklist in the policy section', fakeAsync(() => {
        componentRef.setInput('password', 'some-password');
        componentRef.setInput('feedback', 'full');
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        expect(
          fixture.debugElement.queryAll(By.css('.password-meter-rules li')).length,
        ).toBeGreaterThan(0);
      }));
    });

    describe('hideStrength', () => {
      it('should not render the strength label when hideStrength is true (default)', () => {
        expect(fixture.debugElement.query(By.css('.password-meter-label'))).toBeNull();
      });

      it('should render the strength label when hideStrength is false', fakeAsync(() => {
        componentRef.setInput('password', 'Abcdef1!');
        componentRef.setInput('hideStrength', false);
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        const label = fixture.debugElement.query(By.css('.password-meter-label'));
        expect(label).toBeTruthy();
        expect(label.nativeElement.textContent.trim()).toBe('Very Strong');
      }));
    });
  });

  describe('strength() phased: rules at 100% vs each zxcvbn score', () => {
    // 'Abcdef1!' satisfies all 5 default rules → rulesPercent = 100
    // strength switches to zxcvbn phase → strength() = zxcvbnPercent
    const zxcvbnMock = jest.requireMock<{ default: jest.Mock }>('zxcvbn').default;

    const makeResult = (score: 0 | 1 | 2 | 3 | 4) => ({
      score,
      feedback: { warning: '', suggestions: [] },
      crack_times_display: {
        online_throttling_100_per_hour: 'centuries',
        online_no_throttling_10_per_second: '100 years',
        offline_slow_hashing_1e4_per_second: '10 years',
        offline_fast_hashing_1e10_per_second: '1 month',
      },
    });

    afterEach(() => zxcvbnMock.mockReturnValue(makeResult(4)));

    it('score 0 — zxcvbn phase, strength is 0', fakeAsync(() => {
      zxcvbnMock.mockReturnValue(makeResult(0));
      componentRef.setInput('password', 'Abcdef1!');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect((component as any).rulesPercent()).toBe(100);
      expect((component as any).zxcvbnPercent()).toBe(0);
      expect(component.strength()).toBe(0);
    }));

    it('score 1 — zxcvbn phase, strength is 25', fakeAsync(() => {
      zxcvbnMock.mockReturnValue(makeResult(1));
      componentRef.setInput('password', 'Abcdef1!');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect((component as any).rulesPercent()).toBe(100);
      expect((component as any).zxcvbnPercent()).toBe(25);
      expect(component.strength()).toBe(25);
    }));

    it('score 2 — zxcvbn phase, strength is 50', fakeAsync(() => {
      zxcvbnMock.mockReturnValue(makeResult(2));
      componentRef.setInput('password', 'Abcdef1!');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect((component as any).rulesPercent()).toBe(100);
      expect((component as any).zxcvbnPercent()).toBe(50);
      expect(component.strength()).toBe(50);
    }));

    it('score 3 — zxcvbn phase, strength is 75', fakeAsync(() => {
      zxcvbnMock.mockReturnValue(makeResult(3));
      componentRef.setInput('password', 'Abcdef1!');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect((component as any).rulesPercent()).toBe(100);
      expect((component as any).zxcvbnPercent()).toBe(75);
      expect(component.strength()).toBe(75);
    }));

    it('score 4 — both at 100%, strength is 100', fakeAsync(() => {
      zxcvbnMock.mockReturnValue(makeResult(4));
      componentRef.setInput('password', 'Abcdef1!');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect((component as any).rulesPercent()).toBe(100);
      expect((component as any).zxcvbnPercent()).toBe(100);
      expect(component.strength()).toBe(100);
    }));
  });

  describe('feedback fallback messages', () => {
    const zxcvbnMock = jest.requireMock<{ default: jest.Mock }>('zxcvbn').default;

    const makeResult = (score: 0 | 1 | 2 | 3 | 4, warning = '', suggestions: string[] = []) => ({
      score,
      feedback: { warning, suggestions },
      crack_times_display: {
        online_throttling_100_per_hour: 'centuries',
        online_no_throttling_10_per_second: '100 years',
        offline_slow_hashing_1e4_per_second: '10 years',
        offline_fast_hashing_1e10_per_second: '1 month',
      },
    });

    afterEach(() => zxcvbnMock.mockReturnValue(makeResult(4)));

    describe('full mode — strength analysis section', () => {
      it('should show "Looks great!" when score is 4 and no warning or suggestions', fakeAsync(() => {
        zxcvbnMock.mockReturnValue(makeResult(4));
        componentRef.setInput('password', 'Abcdef1!');
        componentRef.setInput('feedback', 'full');
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        const hint = fixture.debugElement.query(By.css('.password-meter-hint.passed'));
        expect(hint).toBeTruthy();
        expect(hint.nativeElement.textContent).toContain('Looks great!');
      }));

      it('should show "Make it harder to guess." when score is below 4 and no warning or suggestions', fakeAsync(() => {
        zxcvbnMock.mockReturnValue(makeResult(2));
        componentRef.setInput('password', 'Abcdef1!');
        componentRef.setInput('feedback', 'full');
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Make it harder to guess.');
      }));

      it('should not show fallback when warning is present', fakeAsync(() => {
        zxcvbnMock.mockReturnValue(makeResult(3, 'Weak pattern detected.'));
        componentRef.setInput('password', 'Abcdef1!');
        componentRef.setInput('feedback', 'full');
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).not.toContain('Make it harder to guess.');
        expect(fixture.nativeElement.textContent).not.toContain('Looks great!');
      }));

      it('should not show fallback when suggestions are present', fakeAsync(() => {
        zxcvbnMock.mockReturnValue(makeResult(3, '', ['Add a symbol.']));
        componentRef.setInput('password', 'Abcdef1!');
        componentRef.setInput('feedback', 'full');
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).not.toContain('Make it harder to guess.');
        expect(fixture.nativeElement.textContent).not.toContain('Looks great!');
      }));
    });
  });

  describe('loading state (zxcvbnReady / displayStrength)', () => {
    it('should report zxcvbnReady as false before the module resolves', () => {
      // Create a fresh component before detectChanges so the effect hasn't run
      const freshFixture = TestBed.createComponent(PasswordStrengthComponent);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((freshFixture.componentInstance as any).zxcvbnReady()).toBe(false);
      freshFixture.destroy();
    });

    it('should report zxcvbnReady as true after flushMicrotasks', fakeAsync(() => {
      componentRef.setInput('password', 'test');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((component as any).zxcvbnReady()).toBe(true);
    }));

    it('should return rulesPercent as strength while zxcvbn is loading', () => {
      // Fresh fixture — effect has not run, _zxcvbn is null
      const freshFixture = TestBed.createComponent(PasswordStrengthComponent);
      const freshRef = freshFixture.componentRef;
      const freshComponent = freshFixture.componentInstance;
      // 'Abcdef1!' satisfies all 5 default rules → rulesPercent = 100
      freshRef.setInput('password', 'Abcdef1!');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const c = freshComponent as any;
      expect(c.zxcvbnReady()).toBe(false);
      expect(freshComponent.strength()).toBe((freshComponent as any).rulesPercent());
      freshFixture.destroy();
    });

    it('should return zxcvbnPercent as strength once zxcvbn is ready and rules pass', fakeAsync(() => {
      componentRef.setInput('password', 'Abcdef1!');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const c = component as any;
      expect(c.zxcvbnReady()).toBe(true);
      expect(component.strength()).toBe((component as any).zxcvbnPercent());
    }));
  });

  describe('messages input', () => {
    const zxcvbnMock = jest.requireMock<{ default: jest.Mock }>('zxcvbn').default;

    const makeResult = (score: 0 | 1 | 2 | 3 | 4) => ({
      score,
      feedback: { warning: '', suggestions: [] },
      crack_times_display: {
        online_throttling_100_per_hour: 'centuries',
        online_no_throttling_10_per_second: '100 years',
        offline_slow_hashing_1e4_per_second: '10 years',
        offline_fast_hashing_1e10_per_second: '1 month',
      },
    });

    afterEach(() => zxcvbnMock.mockReturnValue(makeResult(4)));

    describe('contextual mode', () => {
      it('should render a custom looksGreat message', fakeAsync(() => {
        zxcvbnMock.mockReturnValue(makeResult(4));
        componentRef.setInput('password', 'Abcdef1!');
        componentRef.setInput('feedback', 'contextual');
        componentRef.setInput('messages', { looksGreat: 'Nailed it!' });
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        const hint = fixture.debugElement.query(By.css('.password-meter-hint.passed'));
        expect(hint).toBeTruthy();
        expect(hint.nativeElement.textContent).toContain('Nailed it!');
      }));

      it('should suppress looksGreat when set to empty string', fakeAsync(() => {
        zxcvbnMock.mockReturnValue(makeResult(4));
        componentRef.setInput('password', 'Abcdef1!');
        componentRef.setInput('feedback', 'contextual');
        componentRef.setInput('messages', { looksGreat: '' });
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.password-meter-hint.passed'))).toBeNull();
      }));

      it('should render a custom nudge message', fakeAsync(() => {
        zxcvbnMock.mockReturnValue(makeResult(2));
        componentRef.setInput('password', 'Abcdef1!');
        componentRef.setInput('feedback', 'contextual');
        componentRef.setInput('messages', { nudge: 'Try harder.' });
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Try harder.');
      }));

      it('should suppress nudge when set to empty string', fakeAsync(() => {
        zxcvbnMock.mockReturnValue(makeResult(2));
        componentRef.setInput('password', 'Abcdef1!');
        componentRef.setInput('feedback', 'contextual');
        componentRef.setInput('messages', { nudge: '' });
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.password-meter-nudge'))).toBeNull();
      }));
    });

    describe('full mode', () => {
      it('should render a custom looksGreat message in the analysis section', fakeAsync(() => {
        zxcvbnMock.mockReturnValue(makeResult(4));
        componentRef.setInput('password', 'Abcdef1!');
        componentRef.setInput('feedback', 'full');
        componentRef.setInput('messages', { looksGreat: 'Nailed it!' });
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Nailed it!');
      }));

      it('should suppress looksGreat when set to empty string', fakeAsync(() => {
        zxcvbnMock.mockReturnValue(makeResult(4));
        componentRef.setInput('password', 'Abcdef1!');
        componentRef.setInput('feedback', 'full');
        componentRef.setInput('messages', { looksGreat: '' });
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.password-meter-hint.passed'))).toBeNull();
      }));

      it('should use a custom disabledNudge function in contextual mode', fakeAsync(() => {
        zxcvbnMock.mockReturnValue(makeResult(2));
        componentRef.setInput('options', {
          min: 8,
          lowercase: true,
          uppercase: false,
          number: false,
          specialChar: false,
        });
        componentRef.setInput('messages', {
          disabledNudge: (keys: string[]) => `Custom: ${keys.join(', ')}`,
        });
        componentRef.setInput('password', 'abcdefgh'); // only lowercase, missing uppercase/number/special
        componentRef.setInput('feedback', 'contextual');
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        expect(component.mergedHint()?.type).toBe('suggestion');
        expect(fixture.nativeElement.textContent).toContain(
          'Custom: uppercase, number, specialChar',
        );
      }));

      it('should suppress nudge when custom disabledNudge returns empty string', fakeAsync(() => {
        zxcvbnMock.mockReturnValue(makeResult(2));
        componentRef.setInput('options', {
          min: 8,
          lowercase: true,
          uppercase: false,
          number: false,
          specialChar: false,
        });
        componentRef.setInput('messages', { disabledNudge: () => '' });
        componentRef.setInput('password', 'abcdefgh');
        componentRef.setInput('feedback', 'contextual');
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Make it harder to guess.');
      }));

      it('should fall back to generic nudge when disabled options all present in password', fakeAsync(() => {
        zxcvbnMock.mockReturnValue(makeResult(2));
        componentRef.setInput('options', {
          min: 8,
          lowercase: true,
          uppercase: false,
          number: false,
          specialChar: false,
        });
        componentRef.setInput('password', 'Abcdef1!'); // has all classes → nudge is null
        componentRef.setInput('feedback', 'contextual');
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Make it harder to guess.');
      }));

      it('should show disabled-options nudge as contextual hint when disabled classes are missing', fakeAsync(() => {
        zxcvbnMock.mockReturnValue(makeResult(2));
        componentRef.setInput('options', {
          min: 8,
          lowercase: true,
          uppercase: false,
          number: false,
          specialChar: false,
        });
        componentRef.setInput('password', 'abcdefgh'); // only lowercase, missing uppercase/number/special
        componentRef.setInput('feedback', 'contextual');
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        expect(component.mergedHint()?.type).toBe('suggestion');
        expect(fixture.nativeElement.textContent).toContain(
          'Try adding uppercase letters, numbers, and special characters',
        );
      }));

      it('should show disabled-options nudge in full mode template', fakeAsync(() => {
        zxcvbnMock.mockReturnValue(makeResult(2));
        componentRef.setInput('options', {
          min: 8,
          lowercase: true,
          uppercase: false,
          number: false,
          specialChar: false,
        });
        componentRef.setInput('password', 'abcdefgh');
        componentRef.setInput('feedback', 'full');
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Try adding');
      }));
    });

    it('should use custom strengthLabels when provided', fakeAsync(() => {
      zxcvbnMock.mockReturnValue(makeResult(4));
      componentRef.setInput('password', 'Abcdef1!');
      componentRef.setInput('hideStrength', false);
      componentRef.setInput('messages', { strengthLabels: { veryStrong: 'Napakalakas' } });
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect(component.strengthLabel()).toBe('Napakalakas');
    }));

    it('should use custom ruleLabels when provided', () => {
      componentRef.setInput('password', '');
      componentRef.setInput('messages', {
        ruleLabels: { minLength: (n: number) => `Kailangan ng ${n} titik` },
      });
      fixture.detectChanges();
      expect(component.ruleChecks()[0].label).toBe('Kailangan ng 8 titik');
    });
  });

  describe('outputs', () => {
    it('should emit strengthChange with current score when password changes', fakeAsync(() => {
      const emitted: number[] = [];
      const sub = component.strengthChange.subscribe(v => emitted.push(v));
      componentRef.setInput('password', 'Abcdef1!');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect(emitted).toContain(100);
      sub.unsubscribe();
    }));

    it('should emit isValid true when strength reaches 100', fakeAsync(() => {
      const validValues: boolean[] = [];
      const sub = component.isValid.subscribe(v => validValues.push(v));
      componentRef.setInput('password', 'Abcdef1!');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect(validValues).toContain(true);
      sub.unsubscribe();
    }));

    it('should emit isValid false when strength is below 100', fakeAsync(() => {
      const validValues: boolean[] = [];
      // First satisfy all rules so isValid emits true, then switch to failing
      componentRef.setInput('password', 'Abcdef1!');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      const sub = component.isValid.subscribe(v => validValues.push(v));
      componentRef.setInput('password', 'abc');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect(validValues).toContain(false);
      sub.unsubscribe();
    }));
  });

  describe('userInputs', () => {
    it('should forward userInputs to zxcvbn', fakeAsync(() => {
      const zxcvbnMock = jest.requireMock<{ default: jest.Mock }>('zxcvbn').default;
      zxcvbnMock.mockClear();
      componentRef.setInput('password', 'Abcdef1!');
      componentRef.setInput('userInputs', ['john', 'doe']);
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect(zxcvbnMock).toHaveBeenCalledWith('Abcdef1!', ['john', 'doe']);
    }));
  });

  describe('customRules', () => {
    const noUsername = (pw: string) => [
      { label: 'Must not contain username', passed: !pw.includes('admin') },
    ];

    it('should expose custom rule checks in customRuleChecks()', fakeAsync(() => {
      componentRef.setInput('customRules', noUsername);
      componentRef.setInput('password', 'Abcdef1!');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      const labels = component.customRuleChecks().map(r => r.label);
      expect(labels).toContain('Must not contain username');
    }));

    it('should not include custom rules in ruleChecks()', fakeAsync(() => {
      componentRef.setInput('customRules', noUsername);
      componentRef.setInput('password', 'Abcdef1!');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect(component.ruleChecks().length).toBe(5);
    }));

    it('should not affect strength when custom rule fails', fakeAsync(() => {
      componentRef.setInput('customRules', noUsername);
      componentRef.setInput('password', 'admin1A!');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect(component.strength()).toBe(100);
    }));

    it('should block isValid when custom rule fails even if built-in rules and zxcvbn pass', fakeAsync(() => {
      componentRef.setInput('customRules', noUsername);
      componentRef.setInput('password', 'admin1A!');
      const validValues: boolean[] = [];
      const sub = component.isValid.subscribe(v => validValues.push(v));
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect(validValues).toContain(false);
      sub.unsubscribe();
    }));

    it('should show custom rule failure in mergedHint when built-in rules pass', fakeAsync(() => {
      componentRef.setInput('customRules', noUsername);
      componentRef.setInput('password', 'admin1A!');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect(component.mergedHint()?.type).toBe('rule');
      expect(component.mergedHint()?.text).toBe('Must not contain username');
    }));

    it('should keep built-in rules as first failing hint when both fail', fakeAsync(() => {
      componentRef.setInput('customRules', noUsername);
      componentRef.setInput('password', 'admin');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect(component.mergedHint()?.text).toBe('At least 8 characters');
    }));

    it('should return empty customRuleChecks when customRules is undefined', fakeAsync(() => {
      componentRef.setInput('password', 'Abcdef1!');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect(component.customRuleChecks().length).toBe(0);
    }));

    it('should return empty customRuleChecks when password is empty', fakeAsync(() => {
      componentRef.setInput('customRules', noUsername);
      componentRef.setInput('password', '');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect(component.customRuleChecks().length).toBe(0);
    }));

    it('should override color to warn when custom rule fails even if strength is 100', fakeAsync(() => {
      componentRef.setInput('customRules', noUsername);
      componentRef.setInput('password', 'admin1A!');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect(component.strength()).toBe(100);
      expect(component.color()).toBe('warn');
    }));

    it('should use normal color when custom rules all pass', fakeAsync(() => {
      componentRef.setInput('customRules', noUsername);
      componentRef.setInput('password', 'Abcdef1!');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect(component.color()).toBe('primary');
    }));
  });
});
