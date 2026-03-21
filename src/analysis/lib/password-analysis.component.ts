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
  ZxcvbnFn,
  ZxcvbnResult,
} from '@ngx-zen/mat-password-meter';
import {
  DEFAULT_PASSWORD_METER_MESSAGES,
  METER_STYLES,
  ZXCVBN_SCORE_MAP,
  scoreToColor,
  scoreToLabel,
} from '@ngx-zen/mat-password-meter';

@Component({
  selector: 'mat-password-analysis',
  standalone: true,
  imports: [MatProgressBar],
  templateUrl: './password-analysis.component.html',
  styles: [METER_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PasswordAnalysisComponent {
  readonly password = input<string>('');
  readonly hideStrength = input<boolean>(true);
  readonly feedback = input<FeedbackMode>('contextual');
  /** Names, emails, etc. — zxcvbn penalizes passwords that contain these. */
  readonly userInputs = input<string[]>([]);
  /** Override any subset of the display messages. Pass '' for a key to suppress that message. */
  readonly messages = input<PasswordMeterMessages>(DEFAULT_PASSWORD_METER_MESSAGES);

  readonly strengthChange = output<number>();
  readonly isValid = output<boolean>();

  private readonly _zxcvbn = signal<ZxcvbnFn | null>(null);
  protected readonly zxcvbnReady = computed(() => this._zxcvbn() !== null);

  readonly zxcvbnResult = computed((): ZxcvbnResult | null => {
    if (!this.password()) return null;
    const fn = this._zxcvbn();
    return fn ? fn(this.password(), this.userInputs()) : null;
  });

  readonly strength = computed((): number => {
    const result = this.zxcvbnResult();
    return result ? ZXCVBN_SCORE_MAP[result.score] : 0;
  });

  readonly color = computed(() => scoreToColor(this.strength()));
  readonly strengthLabel = computed(() => scoreToLabel(this.strength()));

  protected readonly resolvedMessages = computed(
    (): Required<PasswordMeterMessages> => ({
      ...DEFAULT_PASSWORD_METER_MESSAGES,
      ...this.messages(),
    }),
  );

  // While zxcvbn is loading show an indeterminate bar; avoids a flash of 0
  protected readonly barMode = computed(() =>
    this.password() && !this.zxcvbnReady() ? 'indeterminate' : 'determinate',
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
      this.isValid.emit(s === 100);
    });
  }
}
