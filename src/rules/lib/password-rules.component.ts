import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  effect,
  input,
  output,
} from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import type {
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
  scoreToColor,
  scoreToLabel,
  scoreFromChecks,
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

  readonly strengthChange = output<number>();
  readonly isValid = output<boolean>();

  protected readonly resolvedOptions = computed(
    (): Required<PasswordRuleOptions> => ({ ...DEFAULT_PASSWORD_RULE_OPTIONS, ...this.options() }),
  );

  protected readonly resolvedMessages = computed(
    (): Required<PasswordMeterMessages> => ({
      ...DEFAULT_PASSWORD_METER_MESSAGES,
      ...this.messages(),
    }),
  );

  readonly ruleChecks = computed((): PasswordRuleCheck[] =>
    evaluateRules(this.password(), this.resolvedOptions()),
  );

  readonly strength = computed((): number => scoreFromChecks(this.ruleChecks()));

  readonly color = computed(() => scoreToColor(this.strength()));
  readonly strengthLabel = computed(() => scoreToLabel(this.strength()));
  readonly contextualHint = computed(
    (): PasswordRuleCheck | null => this.ruleChecks().find(r => !r.passed) ?? null,
  );

  constructor() {
    effect(() => {
      const s = this.strength();
      this.strengthChange.emit(s);
      this.isValid.emit(s === 100);
    });
  }
}
