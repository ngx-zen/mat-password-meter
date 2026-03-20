import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import type { FeedbackMode } from '@ngx-zen/mat-password-meter';
import { PasswordStrengthComponent } from '@ngx-zen/mat-password-meter/strength';
import { PasswordAnalysisComponent } from '@ngx-zen/mat-password-meter/analysis';
import { PasswordRulesComponent } from '@ngx-zen/mat-password-meter/rules';

type Mode = 'rules' | 'analysis' | 'strength';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    PasswordRulesComponent,
    PasswordStrengthComponent,
    PasswordAnalysisComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  password = '';
  hide = signal(true);
  feedback = signal<FeedbackMode>('contextual');
  hideStrength = signal(false);

  readonly currentStrength = signal(0);
  readonly isPasswordValid = signal(false);

  readonly strengthClass = computed(() => {
    const s = this.currentStrength();
    if (s <= 20) return 'weak';
    if (s <= 80) return 'medium';
    return 'strong';
  });

  private _mode: Mode = 'strength';
  get mode(): Mode {
    return this._mode;
  }
  set mode(v: Mode) {
    this._mode = v;
    this.currentStrength.set(0);
    this.isPasswordValid.set(false);
  }

  userInputRaw = '';
  readonly userInputs = signal<string[]>([]);

  onStrengthChange(value: number): void {
    this.currentStrength.set(value);
  }

  onIsValid(valid: boolean): void {
    this.isPasswordValid.set(valid);
  }

  addUserInput(): void {
    const val = this.userInputRaw.trim();
    if (val && !this.userInputs().includes(val)) {
      this.userInputs.update(list => [...list, val]);
    }
    this.userInputRaw = '';
  }

  removeUserInput(item: string): void {
    this.userInputs.update(list => list.filter(v => v !== item));
  }
}
