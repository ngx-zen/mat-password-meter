# @ngx-zen/mat-password-meter

[![npm](https://img.shields.io/npm/v/@ngx-zen/mat-password-meter?color=crimson&logo=npm)](https://www.npmjs.com/package/@ngx-zen/mat-password-meter)
[![CI](https://github.com/ngx-zen/mat-password-meter/actions/workflows/ci.yml/badge.svg)](https://github.com/ngx-zen/mat-password-meter/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/ngx-zen/mat-password-meter/branch/main/graph/badge.svg)](https://codecov.io/gh/ngx-zen/mat-password-meter)
[![Known Vulnerabilities](https://snyk.io/test/npm/@ngx-zen/mat-password-meter/badge.svg)](https://snyk.io/test/npm/@ngx-zen/mat-password-meter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Three Angular Material password strength components with a signals-based API. **[Live Demo →](https://ngx-zen.github.io/mat-password-meter/)**

| Rule-based | Entropy-based |
|:---:|:---:|
| ![PasswordRulesComponent preview](docs/preview-rules.png) | ![PasswordAnalysisComponent preview](docs/preview-analysis.png) |

- **`PasswordStrengthComponent`** — combines rule enforcement + [zxcvbn](https://github.com/dropbox/zxcvbn) entropy in two phases.
- **`PasswordRulesComponent`** — policy checks only; zxcvbn is never loaded.
- **`PasswordAnalysisComponent`** — zxcvbn entropy only; no policy enforcement.

## Features

- Standalone, no `NgModule`; signals-based API (`input()`, `output()`, `computed()`)
- Three feedback modes: `'contextual'` hint, `'full'` panel, or `'hidden'`
- [zxcvbn](https://github.com/dropbox/zxcvbn) lazy-loaded — no bundle cost when using only `PasswordRulesComponent`
- Fully themeable via CSS custom properties; adapts to light/dark themes automatically

## Version compatibility

| Library | Angular | Angular Material | zxcvbn |
|---------|---------|------------------|--------|
| `2.x` | `^20` | `^20` | `^4.4.2` |
| `1.x` | `^19` | `^19` | `^4.4.2` |

## Installation

```bash
npm install @ngx-zen/mat-password-meter zxcvbn
```

> **Only using `PasswordRulesComponent`?** You can skip `zxcvbn` — it's not needed for that entry point.

> Requires Angular Material with animations and a theme. See the [Angular Material getting started guide](https://material.angular.io/guide/getting-started).

---

## Usage

```ts
import { PasswordStrengthComponent } from '@ngx-zen/mat-password-meter/strength';
import { PasswordRulesComponent }    from '@ngx-zen/mat-password-meter/rules';
import { PasswordAnalysisComponent } from '@ngx-zen/mat-password-meter/analysis';
```

Add to `imports` and bind `[password]` to your form control value:

```html
<!-- PasswordStrengthComponent -->
<mat-password-strength [password]="password" [options]="{ min: 12 }" (isValid)="submitDisabled = !$event" />

<!-- PasswordRulesComponent -->
<mat-password-rules [password]="password" [options]="{ min: 12, specialChar: false }" (isValid)="submitDisabled = !$event" />

<!-- PasswordAnalysisComponent -->
<mat-password-analysis [password]="password" [userInputs]="[user.name, user.email]" (isValid)="submitDisabled = !$event" />
```

`feedback` defaults to `'contextual'` (single inline hint). Use `feedback="full"` for the progressive panel or `feedback="hidden"` to hide all feedback text.

---

## API

All three components share the same base inputs and outputs. Differences are noted in the descriptions.

**Inputs**

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `password` | `string` | `''` | Password to evaluate |
| `options` | `PasswordRuleOptions` | see below | Policy rules. Not used by `PasswordAnalysisComponent`. |
| `hideStrength` | `boolean` | `true` | Show/hide the strength label below the bar |
| `feedback` | `FeedbackMode` | `'contextual'` | `'contextual'`, `'full'`, or `'hidden'` |
| `userInputs` | `string[]` | `[]` | Strings passed to zxcvbn to penalize personal info. Not used by `PasswordRulesComponent`. |
| `messages` | `PasswordMeterMessages` | see below | Override any subset of display strings |

**Outputs**

| Output | Type | Description |
|--------|------|-------------|
| `strengthChange` | `number` | Current 0–100 score on every password change |
| `isValid` | `boolean` | `true` when fully satisfied (both rules + zxcvbn for `PasswordStrengthComponent`) |

---

## Shared types

```ts
import type { PasswordRuleOptions, PasswordMeterMessages } from '@ngx-zen/mat-password-meter';
```

> **Types:** `PasswordRuleOptions`, `PasswordRuleCheck`, `FeedbackMode`, `ZxcvbnResult`, `PasswordMeterMessages`, `PasswordStrengthLabels`, `PasswordRuleLabels`, `DisabledOptionKey`  
> **Constants:** `DEFAULT_PASSWORD_RULE_OPTIONS`, `DEFAULT_PASSWORD_METER_MESSAGES`, `DISABLED_KEY_LABELS`  
> **Utilities:** `evaluateRules`, `scoreFromChecks`

### `PasswordRuleOptions`

All properties optional; omitted keys fall back to defaults. Pass `false` to disable a rule (e.g. `{ specialChar: false }`).

| Property | Type | Default |
|----------|------|---------|
| `min` | `number` | `8` |
| `lowercase` | `boolean` | `true` |
| `uppercase` | `boolean` | `true` |
| `number` | `boolean` | `true` |
| `specialChar` | `boolean` | `true` |

### Disabled options & nudge messages

When a composition option is set to `false`, it is no longer enforced — but the component still checks whether those character classes are present and may show a contextual **nudge** like:

> *→ Try adding uppercase letters, numbers, and special characters*

This applies to `PasswordStrengthComponent` (for disabled options) and `PasswordAnalysisComponent` (which always assumes all composition rules are disabled). The nudge appears in contextual mode when zxcvbn score < 4 and there are no warnings or suggestions. If the password already contains all character classes, the generic "Make it harder to guess." fallback is shown instead.

### NIST alignment

[NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html#passwordver) recommends **against** composition rules (mixed case, digits, special characters) and instead favors a longer minimum length. You can opt in to a NIST-aligned configuration with `PasswordStrengthComponent`:

```ts
const NIST_OPTIONS: PasswordRuleOptions = {
  min: 15,
  lowercase: false,
  uppercase: false,
  number: false,
  specialChar: false,
};
```

```html
<mat-password-strength [password]="password" [options]="NIST_OPTIONS" />
```

With all composition rules disabled, only `min` is enforced. `PasswordStrengthComponent` will still evaluate entropy via zxcvbn and nudge users to add character diversity when the password could be stronger.

> [!WARNING]
> This configuration is not recommended for `PasswordRulesComponent`, which has no zxcvbn phase — it would reduce to a minimum-length check with no quality feedback.

### `PasswordMeterMessages`

All properties optional; omitted keys fall back to defaults. For string keys, pass `''` to suppress that message entirely. Not all keys apply to every component.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `looksGreat` | `string` | `'Looks great!'` | Shown when strength is perfect |
| `nudge` | `string` | `'Make it harder to guess.'` | Shown when zxcvbn score < 4 with no warning or suggestions. Ignored by `PasswordRulesComponent`. |
| `disabledNudge` | `(missingKeys: DisabledOptionKey[]) => string` | — | Replaces the auto-generated disabled-options nudge in contextual mode. Ignored by `PasswordRulesComponent`. Receives the keys of disabled composition options whose character classes are missing (e.g. `['uppercase', 'number']`). Return `''` to suppress. |
| `strengthLabels` | `PasswordStrengthLabels` | `{}` | Override the strength level labels below the bar |
| `ruleLabels` | `PasswordRuleLabels` | `{}` | Override the per-rule checklist labels. Ignored by `PasswordAnalysisComponent`. |

**Example:**
```ts
// in your component class

// Custom labels for the disabled-options nudge (default: DISABLED_KEY_LABELS)
private static readonly MY_LABELS: Record<DisabledOptionKey, string> = {
  lowercase: 'maliliit na titik',
  uppercase: 'malalaking titik',
  number: 'mga numero',
  specialChar: 'mga espesyal na karakter',
};

readonly messages: PasswordMeterMessages = {
  looksGreat: 'Perpekto!',
  nudge: '',
  // Replace the default "Try adding …" nudge, or return '' to suppress
  disabledNudge: (keys) => 'Subukang magdagdag ng ' + keys.map(k => MyComponent.MY_LABELS[k]).join(' at '),
  strengthLabels: { veryWeak: 'Napakahina', veryStrong: 'Napakalakas' },
  ruleLabels: { minLength: (n) => `Kailangan ng ${n} titik` },
};
```
```html
<mat-password-strength [password]="password" [messages]="messages" />
```

### `PasswordStrengthLabels`

| Key | Default |
|-----|---------|
| `veryWeak` | `'Very Weak'` |
| `weak` | `'Weak'` |
| `fair` | `'Fair'` |
| `good` | `'Good'` |
| `strong` | `'Strong'` |
| `veryStrong` | `'Very Strong'` |

### `PasswordRuleLabels`

| Key | Default |
|-----|---------|
| `minLength` | `` `At least ${n} characters` `` (also accepts `(n: number) => string`) |
| `lowercase` | `'At least 1 lowercase letter'` |
| `uppercase` | `'At least 1 uppercase letter'` |
| `number` | `'At least 1 number'` |
| `specialChar` | `'At least 1 special character'` |

> **Need translated zxcvbn feedback strings?** The `warning` and `suggestions` shown by `PasswordAnalysisComponent` and `PasswordStrengthComponent` come directly from zxcvbn and are always English. [Open an issue](https://github.com/ngx-zen/mat-password-meter/issues) if you need `@zxcvbn-ts` support.

---

## Direct signal access

Public computed signals accessible via `viewChild`:

| Component | Signals |
|-----------|---------|
| `PasswordStrengthComponent` | `strength`, `ruleChecks`, `zxcvbnResult`, `mergedHint`, `color`, `strengthLabel` |
| `PasswordRulesComponent` | `strength`, `ruleChecks`, `contextualHint`, `color`, `strengthLabel` |
| `PasswordAnalysisComponent` | `strength`, `zxcvbnResult`, `color`, `strengthLabel` |

```ts
readonly meter = viewChild(PasswordStrengthComponent);

protected readonly isValid   = computed(() => this.meter()?.strength() === 100);
protected readonly firstFail = computed(() => this.meter()?.ruleChecks().find(r => !r.passed)?.label);
```

---

## Theming

Components adapt to light/dark themes via Angular Material design tokens (`--mat-sys-*`). Override colors via CSS custom properties:

<details>
<summary>Available CSS custom properties</summary>

```css
mat-password-rules,
mat-password-analysis,
mat-password-strength {
  /* Progress bar colors */
  --pm-weak-color:      #e53935;
  --pm-medium-color:    #fdd835;
  --pm-strong-color:    #43a047;
  --pm-buffer-color:    #888888;

  /* Text colors */
  --pm-rule-pass-color: light-dark(#2e9244, #66bb6a);
  --pm-rule-fail-color: light-dark(#d32f2f, #ef5350);
  --pm-warning-color:   light-dark(#7a6000, #c9a200);
  --pm-secondary-text:  light-dark(#555, #aaa);
}
```

</details>

---

## Acknowledgments

Inspired by [`angular-material-extensions/password-strength`](https://github.com/angular-material-extensions/password-strength).  
NIST alignment guidance suggested by [u/JimTheEarthling](https://www.reddit.com/user/JimTheEarthling) on Reddit.

## Contributing · Changelog · License

[CONTRIBUTING.md](CONTRIBUTING.md) · [CHANGELOG.md](CHANGELOG.md) · [MIT](LICENSE)
