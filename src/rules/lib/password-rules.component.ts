import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  ViewEncapsulation,
} from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import type {
  CustomRulesFn,
  FeedbackMode,
  PasswordMeterMessages,
  PasswordRuleCheck,
  PasswordRuleOptions,
} from '@ngx-zen/mat-password-meter';
import {
  DEFAULT_PASSWORD_METER_MESSAGES,
  DEFAULT_PASSWORD_RULE_OPTIONS,
  evaluateRules,
  METER_STYLES,
  scoreFromChecks,
  scoreToColor,
  scoreToLabel,
} from '@ngx-zen/mat-password-meter';

@Component({
  selector: 'mat-password-rules',
  standalone: true,
  imports: [MatProgressBar],
  templateUrl: './password-rules.component.html',
  styles: [METER_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PasswordRulesComponent {
  readonly password = input<string>('');
  readonly options = input<PasswordRuleOptions>(DEFAULT_PASSWORD_RULE_OPTIONS);
  readonly hideStrength = input<boolean>(true);
  readonly feedback = input<FeedbackMode>('contextual');
  readonly messages = input<PasswordMeterMessages>(DEFAULT_PASSWORD_METER_MESSAGES);
  readonly customRules = input<CustomRulesFn | undefined>(undefined);

  readonly strengthChange = output<number>();
  readonly isValid = output<boolean>();

  protected readonly resolvedOptions = computed(
    (): Required<PasswordRuleOptions> => ({ ...DEFAULT_PASSWORD_RULE_OPTIONS, ...this.options() }),
  );

  protected readonly resolvedMessages = computed(
    (): Required<Omit<PasswordMeterMessages, 'disabledNudge'>> => ({
      ...DEFAULT_PASSWORD_METER_MESSAGES,
      ...this.messages(),
    }),
  );

  readonly ruleChecks = computed((): PasswordRuleCheck[] =>
    evaluateRules(this.password(), this.resolvedOptions(), this.resolvedMessages().ruleLabels),
  );

  readonly customRuleChecks = computed((): PasswordRuleCheck[] => {
    const pw = this.password();
    const custom = this.customRules();
    return custom && pw ? custom(pw) : [];
  });

  protected readonly failingCustomRules = computed((): PasswordRuleCheck[] =>
    this.customRuleChecks().filter(r => !r.passed),
  );

  readonly strength = computed((): number => scoreFromChecks(this.ruleChecks()));

  readonly color = computed(() =>
    this.failingCustomRules().length > 0 ? 'warn' : scoreToColor(this.strength()),
  );
  readonly strengthLabel = computed(() =>
    scoreToLabel(this.strength(), this.resolvedMessages().strengthLabels),
  );
  readonly contextualHint = computed(
    (): PasswordRuleCheck | null =>
      this.ruleChecks().find(r => !r.passed) ?? this.failingCustomRules()[0] ?? null,
  );

  constructor() {
    effect(() => {
      const s = this.strength();
      this.strengthChange.emit(s);
      this.isValid.emit(s === 100 && this.failingCustomRules().length === 0);
    });
  }
}
