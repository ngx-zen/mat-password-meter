import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import type {
  FeedbackMode,
  PasswordMeterMessages,
  PasswordRuleCheck,
  PasswordRuleOptions,
  ZxcvbnFn,
  ZxcvbnResult,
} from '@ngx-zen/mat-password-meter';
import {
  DEFAULT_PASSWORD_METER_MESSAGES,
  DEFAULT_PASSWORD_RULE_OPTIONS,
  evaluateRules,
  METER_STYLES,
  ZXCVBN_SCORE_MAP,
  scoreToColor,
  scoreToLabel,
  scoreFromChecks,
} from '@ngx-zen/mat-password-meter';

type MergedHint = { type: 'rule' | 'warning' | 'suggestion' | 'nudge' | 'ok'; text: string };

@Component({
  selector: 'mat-password-strength',
  standalone: true,
  imports: [MatProgressBar],
  templateUrl: './password-strength.component.html',
  styles: [METER_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PasswordStrengthComponent {
  readonly password = input<string>('');
  readonly options = input<PasswordRuleOptions>(DEFAULT_PASSWORD_RULE_OPTIONS);
  readonly hideStrength = input<boolean>(true);
  readonly feedback = input<FeedbackMode>('contextual');
  /** Names, emails, etc. — zxcvbn penalizes passwords that contain these. */
  readonly userInputs = input<string[]>([]);
  /** Override any subset of the display messages. Pass '' for a key to suppress that message. */
  readonly messages = input<PasswordMeterMessages>(DEFAULT_PASSWORD_METER_MESSAGES);

  readonly strengthChange = output<number>();
  readonly isValid = output<boolean>();

  protected readonly resolvedOptions = computed(
    (): Required<PasswordRuleOptions> => ({ ...DEFAULT_PASSWORD_RULE_OPTIONS, ...this.options() }),
  );

  private readonly _zxcvbn = signal<ZxcvbnFn | null>(null);
  protected readonly zxcvbnReady = computed(() => this._zxcvbn() !== null);

  readonly zxcvbnResult = computed((): ZxcvbnResult | null => {
    if (!this.password()) return null;
    const fn = this._zxcvbn();
    return fn ? fn(this.password(), this.userInputs()) : null;
  });

  // zxcvbn score as a 0–100 percentage
  protected readonly zxcvbnPercent = computed((): number => {
    const result = this.zxcvbnResult();
    return result ? ZXCVBN_SCORE_MAP[result.score] : 0;
  });

  readonly ruleChecks = computed((): PasswordRuleCheck[] =>
    evaluateRules(this.password(), this.resolvedOptions(), this.resolvedMessages().ruleLabels),
  );

  protected readonly rulesPercent = computed((): number => scoreFromChecks(this.ruleChecks()));

  protected readonly allRulesPassed = computed(() => this.ruleChecks().every(r => r.passed));

  // full mode: show rules panel until all rules pass, then switch to analysis
  protected readonly fullPanel = computed((): 'rules' | 'analysis' =>
    this.allRulesPassed() ? 'analysis' : 'rules',
  );

  // priority order: first failing rule → zxcvbn warning → nudge → ok
  protected readonly resolvedMessages = computed(
    (): Required<PasswordMeterMessages> => ({
      ...DEFAULT_PASSWORD_METER_MESSAGES,
      ...this.messages(),
    }),
  );

  readonly mergedHint = computed((): MergedHint | null => {
    const failingRule = this.ruleChecks().find(r => !r.passed);
    if (failingRule) return { type: 'rule', text: failingRule.label };
    const result = this.zxcvbnResult();
    if (result?.feedback.warning) return { type: 'warning', text: result.feedback.warning };
    if (result?.feedback.suggestions[0]) {
      return { type: 'suggestion', text: result.feedback.suggestions[0] };
    }
    const msgs = this.resolvedMessages();
    if (this.allRulesPassed() && this.zxcvbnPercent() === 100 && msgs.looksGreat) {
      return { type: 'ok', text: msgs.looksGreat };
    }
    if (result && result.score < 4 && msgs.nudge) return { type: 'nudge', text: msgs.nudge };
    return null;
  });

  // Phase 1: show rules progress until all pass; Phase 2: show zxcvbn score
  readonly strength = computed((): number => {
    if (!this.allRulesPassed()) return this.rulesPercent();
    return this.zxcvbnReady() ? this.zxcvbnPercent() : this.rulesPercent();
  });

  readonly color = computed(() => scoreToColor(this.strength()));
  readonly strengthLabel = computed(() =>
    scoreToLabel(this.strength(), this.resolvedMessages().strengthLabels),
  );

  constructor() {
    import('zxcvbn')
      .then(m => {
        const mod = m as unknown as { default?: ZxcvbnFn } | ZxcvbnFn;
        const resolved = typeof mod === 'function' ? mod : (mod as { default?: ZxcvbnFn }).default;
        if (typeof resolved === 'function') {
          this._zxcvbn.set(resolved as ZxcvbnFn);
        }
      })
      .catch(
        /* istanbul ignore next */ (err: unknown) => {
          console.error('[mat-password-meter] Failed to load zxcvbn', err);
        },
      );

    effect(() => {
      const s = this.strength();
      this.strengthChange.emit(s);
      this.isValid.emit(this.allRulesPassed() && this.zxcvbnPercent() === 100);
    });
  }
}
