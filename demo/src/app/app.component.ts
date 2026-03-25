import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import type { FeedbackMode } from '@ngx-zen/mat-password-meter';
import { PasswordAnalysisComponent } from '@ngx-zen/mat-password-meter/analysis';
import { PasswordRulesComponent } from '@ngx-zen/mat-password-meter/rules';
import { PasswordStrengthComponent } from '@ngx-zen/mat-password-meter/strength';

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
    MatSliderModule,
    PasswordRulesComponent,
    PasswordStrengthComponent,
    PasswordAnalysisComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly _document = inject(DOCUMENT);

  password = '';
  hide = signal(true);
  darkMode = signal(false);
  feedback = signal<FeedbackMode>('contextual');
  hideStrength = signal(false);

  minLength = signal(8);
  optLowercase = signal(true);
  optUppercase = signal(true);
  optNumber = signal(true);
  optSpecialChar = signal(true);

  readonly demoOptions = computed(() => ({
    min: this.minLength(),
    lowercase: this.optLowercase(),
    uppercase: this.optUppercase(),
    number: this.optNumber(),
    specialChar: this.optSpecialChar(),
  }));

  toggleDarkMode(): void {
    const isDark = !this.darkMode();
    this.darkMode.set(isDark);
    this._document.documentElement.classList.toggle('dark', isDark);
  }

  readonly currentStrength = signal(0);
  readonly isPasswordValid = signal(false);
  readonly optionsOpen = signal(false);

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
