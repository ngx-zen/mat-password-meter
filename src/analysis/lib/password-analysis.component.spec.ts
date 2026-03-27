import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PasswordAnalysisComponent } from './password-analysis.component';

jest.mock('zxcvbn', () => ({
  __esModule: true,
  default: jest.fn((_password: string, _userInputs?: string[]) => ({
    score: 3,
    feedback: { warning: 'Test warning', suggestions: ['Add a word or two.'] },
    crack_times_display: {
      online_throttling_100_per_hour: '1 year',
      online_no_throttling_10_per_second: '1 month',
      offline_slow_hashing_1e4_per_second: '1 week',
      offline_fast_hashing_1e10_per_second: '3 hours',
    },
  })),
}));

describe('PasswordAnalysisComponent', () => {
  let component: PasswordAnalysisComponent;
  let componentRef: ComponentRef<PasswordAnalysisComponent>;
  let fixture: ComponentFixture<PasswordAnalysisComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [PasswordAnalysisComponent] });
    fixture = TestBed.createComponent(PasswordAnalysisComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('strength()', () => {
    it('should return 0 when password is empty', () => {
      componentRef.setInput('password', '');
      expect(component.strength()).toBe(0);
    });

    it('should map zxcvbn score 3 to strength 75', fakeAsync(() => {
      componentRef.setInput('password', 'some-password');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect(component.strength()).toBe(75);
    }));
  });

  describe('zxcvbnResult()', () => {
    it('should return null when password is empty', () => {
      componentRef.setInput('password', '');
      expect(component.zxcvbnResult()).toBeNull();
    });

    it('should return a result with score, feedback, and crack_times_display', fakeAsync(() => {
      componentRef.setInput('password', 'some-password');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      const result = component.zxcvbnResult();
      expect(result).not.toBeNull();
      expect(result?.score).toBe(3);
      expect(result?.feedback.warning).toBe('Test warning');
      expect(result?.feedback.suggestions).toContain('Add a word or two.');
      expect(result?.crack_times_display.offline_slow_hashing_1e4_per_second).toBe('1 week');
    }));
  });

  describe('template', () => {
    it('should render a mat-progress-bar element', () => {
      expect(fixture.debugElement.query(By.css('mat-progress-bar'))).toBeTruthy();
    });

    describe('hideStrength', () => {
      it('should not render the strength label when hideStrength is true (default)', () => {
        expect(fixture.debugElement.query(By.css('.password-meter-label'))).toBeNull();
      });

      it('should render the strength label when hideStrength is false', fakeAsync(() => {
        componentRef.setInput('password', 'some-password');
        componentRef.setInput('hideStrength', false);
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.password-meter-label'))).toBeTruthy();
      }));
    });

    describe('hideFeedback', () => {
      it('should not render a warning when feedback is hidden', () => {
        componentRef.setInput('password', 'some-password');
        componentRef.setInput('feedback', 'hidden');
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.password-meter-warning'))).toBeNull();
      });

      it('should render the zxcvbn warning when feedback is contextual', fakeAsync(() => {
        componentRef.setInput('password', 'some-password');
        componentRef.setInput('feedback', 'contextual');
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        const warning = fixture.debugElement.query(By.css('.password-meter-warning'));
        expect(warning).toBeTruthy();
        expect(warning.nativeElement.textContent).toContain('Test warning');
      }));

      it('should render zxcvbn suggestions when feedback is full', fakeAsync(() => {
        componentRef.setInput('password', 'some-password');
        componentRef.setInput('feedback', 'full');
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        const suggestions = fixture.debugElement.queryAll(By.css('.password-meter-suggestions li'));
        expect(suggestions.length).toBe(1);
        expect(suggestions[0].nativeElement.textContent).toContain('Add a word or two.');
      }));
    });

    describe('feedback fallback messages', () => {
      const zxcvbnMock = jest.requireMock<{ default: jest.Mock }>('zxcvbn').default;

      const makeResult = (score: 0 | 1 | 2 | 3 | 4, warning = '', suggestions: string[] = []) => ({
        score,
        feedback: { warning, suggestions },
        crack_times_display: {
          online_throttling_100_per_hour: '1 year',
          online_no_throttling_10_per_second: '1 month',
          offline_slow_hashing_1e4_per_second: '1 week',
          offline_fast_hashing_1e10_per_second: '3 hours',
        },
      });

      afterEach(() =>
        zxcvbnMock.mockReturnValue(makeResult(3, 'Test warning', ['Add a word or two.'])),
      );

      describe('contextual mode', () => {
        it('should show warning when zxcvbn returns one', fakeAsync(() => {
          zxcvbnMock.mockReturnValue(makeResult(3, 'This is a common password.'));
          componentRef.setInput('password', 'test');
          componentRef.setInput('feedback', 'contextual');
          fixture.detectChanges();
          flushMicrotasks();
          fixture.detectChanges();
          const warning = fixture.debugElement.query(By.css('.password-meter-warning'));
          expect(warning).toBeTruthy();
          expect(warning.nativeElement.textContent).toContain('This is a common password.');
        }));

        it('should show "Looks great!" when score is 4 and no warning', fakeAsync(() => {
          zxcvbnMock.mockReturnValue(makeResult(4));
          componentRef.setInput('password', 'test');
          componentRef.setInput('feedback', 'contextual');
          fixture.detectChanges();
          flushMicrotasks();
          fixture.detectChanges();
          const hint = fixture.debugElement.query(By.css('.password-meter-hint.passed'));
          expect(hint).toBeTruthy();
          expect(hint.nativeElement.textContent).toContain('Looks great!');
        }));

        it('should show "Make it harder to guess." when score is below 4 and no warning and no suggestions', fakeAsync(() => {
          zxcvbnMock.mockReturnValue(makeResult(2));
          componentRef.setInput('password', 'aA1!');
          componentRef.setInput('feedback', 'contextual');
          fixture.detectChanges();
          flushMicrotasks();
          fixture.detectChanges();
          const el = fixture.debugElement.query(
            By.css(
              '.password-meter-container p:not(.password-meter-warning):not(.password-meter-hint)',
            ),
          );
          expect(el).toBeTruthy();
          expect(el.nativeElement.textContent).toContain('Make it harder to guess.');
        }));

        it('should show first suggestion as hint when warning is empty but suggestions exist', fakeAsync(() => {
          zxcvbnMock.mockReturnValue(
            makeResult(2, '', ['Add another word or two.', 'Avoid repeated words.']),
          );
          componentRef.setInput('password', 'test');
          componentRef.setInput('feedback', 'contextual');
          fixture.detectChanges();
          flushMicrotasks();
          fixture.detectChanges();
          const hint = fixture.debugElement.query(By.css('.password-meter-hint'));
          expect(hint).toBeTruthy();
          expect(hint.nativeElement.textContent).toContain('Add another word or two.');
          expect(fixture.nativeElement.textContent).not.toContain('Make it harder to guess.');
        }));

        it('should show first suggestion before nudge even when score is below 4', fakeAsync(() => {
          zxcvbnMock.mockReturnValue(makeResult(1, '', ['Use a longer keyboard pattern.']));
          componentRef.setInput('password', 'test');
          componentRef.setInput('feedback', 'contextual');
          fixture.detectChanges();
          flushMicrotasks();
          fixture.detectChanges();
          const hint = fixture.debugElement.query(By.css('.password-meter-hint'));
          expect(hint).toBeTruthy();
          expect(hint.nativeElement.textContent).toContain('Use a longer keyboard pattern.');
          expect(fixture.debugElement.query(By.css('.password-meter-nudge'))).toBeNull();
        }));

        it('should show disabledOptionsNudge when score < 4 and no warning/suggestions', fakeAsync(() => {
          zxcvbnMock.mockReturnValue(makeResult(2));
          componentRef.setInput('password', 'test');
          componentRef.setInput('feedback', 'contextual');
          fixture.detectChanges();
          flushMicrotasks();
          fixture.detectChanges();
          const hint = fixture.debugElement.query(By.css('.password-meter-hint'));
          expect(hint).toBeTruthy();
          expect(hint.nativeElement.textContent).toContain(
            'Try adding uppercase letters or numbers',
          );
          expect(fixture.debugElement.query(By.css('.password-meter-nudge'))).toBeNull();
        }));

        it('should fall back to generic nudge when password has all character classes', fakeAsync(() => {
          zxcvbnMock.mockReturnValue(makeResult(2));
          componentRef.setInput('password', 'aA1!');
          componentRef.setInput('feedback', 'contextual');
          fixture.detectChanges();
          flushMicrotasks();
          fixture.detectChanges();
          expect(fixture.debugElement.query(By.css('.password-meter-nudge'))).toBeTruthy();
          expect(fixture.nativeElement.textContent).toContain('Make it harder to guess.');
        }));

        it('should use custom disabledNudge function from messages', fakeAsync(() => {
          zxcvbnMock.mockReturnValue(makeResult(2));
          componentRef.setInput('password', 'test');
          componentRef.setInput('feedback', 'contextual');
          componentRef.setInput('messages', {
            disabledNudge: (keys: string[]) => `Consider adding ${keys.join(' and ')}`,
          });
          fixture.detectChanges();
          flushMicrotasks();
          fixture.detectChanges();
          const hint = fixture.debugElement.query(By.css('.password-meter-hint'));
          expect(hint).toBeTruthy();
          expect(hint.nativeElement.textContent).toContain(
            'Consider adding uppercase and number and specialChar',
          );
        }));
      });

      describe('full mode', () => {
        it('should show "Looks great!" when score is 4 and no warning or suggestions', fakeAsync(() => {
          zxcvbnMock.mockReturnValue(makeResult(4));
          componentRef.setInput('password', 'test');
          componentRef.setInput('feedback', 'full');
          fixture.detectChanges();
          flushMicrotasks();
          fixture.detectChanges();
          const hint = fixture.debugElement.query(By.css('.password-meter-hint.passed'));
          expect(hint).toBeTruthy();
          expect(hint.nativeElement.textContent).toContain('Looks great!');
        }));

        it('should show disabled-options nudge when score is below 4 and no warning or suggestions', fakeAsync(() => {
          zxcvbnMock.mockReturnValue(makeResult(2));
          componentRef.setInput('password', 'test');
          componentRef.setInput('feedback', 'full');
          fixture.detectChanges();
          flushMicrotasks();
          fixture.detectChanges();
          expect(fixture.nativeElement.textContent).toContain('Try adding');
        }));

        it('should fall back to generic nudge when all character classes are present', fakeAsync(() => {
          zxcvbnMock.mockReturnValue(makeResult(2));
          componentRef.setInput('password', 'aA1!');
          componentRef.setInput('feedback', 'full');
          fixture.detectChanges();
          flushMicrotasks();
          fixture.detectChanges();
          expect(fixture.nativeElement.textContent).toContain('Make it harder to guess.');
        }));

        it('should not show fallback when warning is present', fakeAsync(() => {
          zxcvbnMock.mockReturnValue(makeResult(3, 'Weak pattern detected.'));
          componentRef.setInput('password', 'test');
          componentRef.setInput('feedback', 'full');
          fixture.detectChanges();
          flushMicrotasks();
          fixture.detectChanges();
          expect(fixture.debugElement.query(By.css('.password-meter-hint'))).toBeNull();
          expect(fixture.nativeElement.textContent).not.toContain('Make it harder to guess.');
        }));

        it('should not show fallback when suggestions are present', fakeAsync(() => {
          zxcvbnMock.mockReturnValue(makeResult(3, '', ['Add a symbol.']));
          componentRef.setInput('password', 'test');
          componentRef.setInput('feedback', 'full');
          fixture.detectChanges();
          flushMicrotasks();
          fixture.detectChanges();
          expect(fixture.debugElement.query(By.css('.password-meter-hint'))).toBeNull();
          expect(fixture.nativeElement.textContent).not.toContain('Make it harder to guess.');
        }));
      });
    });
  });

  describe('loading state (zxcvbnReady)', () => {
    it('should report zxcvbnReady as false before the module resolves', () => {
      // Create a fresh component before detectChanges so the effect hasn't run
      const freshFixture = TestBed.createComponent(PasswordAnalysisComponent);
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

    it('should set barMode to indeterminate while loading and password is set', () => {
      const freshFixture = TestBed.createComponent(PasswordAnalysisComponent);
      const freshRef = freshFixture.componentRef;
      const freshComponent = freshFixture.componentInstance;
      // Set password before detectChanges — effect has not yet run, _zxcvbn is null
      freshRef.setInput('password', 'test');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((freshComponent as any).barMode()).toBe('indeterminate');
      freshFixture.destroy();
    });

    it('should set barMode to determinate after zxcvbn resolves', fakeAsync(() => {
      componentRef.setInput('password', 'test');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((component as any).barMode()).toBe('determinate');
    }));

    it('should set barMode to determinate when password is empty', () => {
      componentRef.setInput('password', '');
      fixture.detectChanges();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((component as any).barMode()).toBe('determinate');
    });

    it('should show feedback once zxcvbn is ready', fakeAsync(() => {
      componentRef.setInput('password', 'test');
      componentRef.setInput('feedback', 'contextual');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      // default mock has warning → should now be visible
      expect(fixture.debugElement.query(By.css('.password-meter-warning'))).toBeTruthy();
    }));
  });

  describe('messages input', () => {
    const zxcvbnMock = jest.requireMock<{ default: jest.Mock }>('zxcvbn').default;

    const makeResult = (score: 0 | 1 | 2 | 3 | 4, warning = '', suggestions: string[] = []) => ({
      score,
      feedback: { warning, suggestions },
      crack_times_display: {
        online_throttling_100_per_hour: '1 year',
        online_no_throttling_10_per_second: '1 month',
        offline_slow_hashing_1e4_per_second: '1 week',
        offline_fast_hashing_1e10_per_second: '3 hours',
      },
    });

    afterEach(() =>
      zxcvbnMock.mockReturnValue(makeResult(3, 'Test warning', ['Add a word or two.'])),
    );

    describe('contextual mode', () => {
      it('should render a custom looksGreat message', fakeAsync(() => {
        zxcvbnMock.mockReturnValue(makeResult(4));
        componentRef.setInput('password', 'test');
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
        componentRef.setInput('password', 'test');
        componentRef.setInput('feedback', 'contextual');
        componentRef.setInput('messages', { looksGreat: '' });
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.password-meter-hint.passed'))).toBeNull();
      }));

      it('should render a custom nudge message', fakeAsync(() => {
        zxcvbnMock.mockReturnValue(makeResult(2));
        componentRef.setInput('password', 'aA1!');
        componentRef.setInput('feedback', 'contextual');
        componentRef.setInput('messages', { nudge: 'Try harder.' });
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Try harder.');
      }));

      it('should suppress nudge when set to empty string', fakeAsync(() => {
        zxcvbnMock.mockReturnValue(makeResult(2));
        componentRef.setInput('password', 'test');
        componentRef.setInput('feedback', 'contextual');
        componentRef.setInput('messages', { nudge: '' });
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.password-meter-nudge'))).toBeNull();
      }));
    });

    describe('full mode', () => {
      it('should render a custom looksGreat message', fakeAsync(() => {
        zxcvbnMock.mockReturnValue(makeResult(4));
        componentRef.setInput('password', 'test');
        componentRef.setInput('feedback', 'full');
        componentRef.setInput('messages', { looksGreat: 'Nailed it!' });
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Nailed it!');
      }));

      it('should suppress looksGreat when set to empty string', fakeAsync(() => {
        zxcvbnMock.mockReturnValue(makeResult(4));
        componentRef.setInput('password', 'test');
        componentRef.setInput('feedback', 'full');
        componentRef.setInput('messages', { looksGreat: '' });
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.password-meter-hint.passed'))).toBeNull();
      }));
    });

    it('should use custom strengthLabels when provided', fakeAsync(() => {
      zxcvbnMock.mockReturnValue(makeResult(3));
      componentRef.setInput('password', 'test');
      componentRef.setInput('hideStrength', false);
      componentRef.setInput('messages', { strengthLabels: { good: 'Magaling' } });
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect(component.strengthLabel()).toBe('Magaling');
    }));
  });

  describe('outputs', () => {
    it('should emit strengthChange with current score when password changes', fakeAsync(() => {
      const emitted: number[] = [];
      const sub = component.strengthChange.subscribe(v => emitted.push(v));
      componentRef.setInput('password', 'some-password');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect(emitted).toContain(75);
      sub.unsubscribe();
    }));

    it('should emit isValid true when zxcvbn score reaches 4', fakeAsync(() => {
      const zxcvbnMock = jest.requireMock<{ default: jest.Mock }>('zxcvbn').default;
      zxcvbnMock.mockReturnValue({
        score: 4,
        feedback: { warning: '', suggestions: [] },
        crack_times_display: {
          online_throttling_100_per_hour: 'centuries',
          online_no_throttling_10_per_second: '100 years',
          offline_slow_hashing_1e4_per_second: '10 years',
          offline_fast_hashing_1e10_per_second: '1 month',
        },
      });
      const validValues: boolean[] = [];
      const sub = component.isValid.subscribe(v => validValues.push(v));
      componentRef.setInput('password', 'test');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect(validValues).toContain(true);
      sub.unsubscribe();
      zxcvbnMock.mockReturnValue({
        score: 3,
        feedback: { warning: 'Test warning', suggestions: ['Add a word or two.'] },
        crack_times_display: {
          online_throttling_100_per_hour: '1 year',
          online_no_throttling_10_per_second: '1 month',
          offline_slow_hashing_1e4_per_second: '1 week',
          offline_fast_hashing_1e10_per_second: '3 hours',
        },
      });
    }));

    it('should emit isValid false when zxcvbn score is below 4', fakeAsync(() => {
      const validValues: boolean[] = [];
      const sub = component.isValid.subscribe(v => validValues.push(v));
      componentRef.setInput('password', 'some-password');
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
      componentRef.setInput('password', 'test');
      componentRef.setInput('userInputs', ['alice', 'bob']);
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();
      expect(zxcvbnMock).toHaveBeenCalledWith('test', ['alice', 'bob']);
    }));
  });
});
