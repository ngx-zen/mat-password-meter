# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-03-21

### Added

**Entry points:**

- `@ngx-zen/mat-password-meter` — primary entry; shared utilities and types, no component
- `@ngx-zen/mat-password-meter/strength` — `PasswordStrengthComponent` (`<mat-password-strength>`); rule + entropy bottleneck: `min(rulesPercent, zxcvbnPercent)`
- `@ngx-zen/mat-password-meter/rules` — `PasswordRulesComponent` (`<mat-password-rules>`); rule checking only, no zxcvbn dependency
- `@ngx-zen/mat-password-meter/analysis` — `PasswordAnalysisComponent` (`<mat-password-analysis>`); zxcvbn entropy only, lazy-loaded

**Primary entry exports:**

- Utilities: `evaluateRules`, `computeRulesScore`, `scoreToColor`, `scoreToLabel`, `ZXCVBN_SCORE_MAP`, `METER_STYLES`
- Types: `PasswordRuleOptions`, `PasswordRuleCheck`, `ZxcvbnResult`, `ZxcvbnScore`, `FeedbackMode`, `StrengthColor`, `PasswordMeterMessages`
- Constants: `DEFAULT_PASSWORD_RULE_OPTIONS`, `DEFAULT_PASSWORD_METER_MESSAGES`

**Components (all three unless noted):**

- **Signals-based API** — `input()`, `output()`, `computed()`, `effect()` with `OnPush` change detection
- **`<mat-progress-bar>` with color feedback** — red → yellow → green via CSS custom properties
- **`feedback: FeedbackMode` input** (`'contextual'` | `'full'` | `'hidden'`), default `'contextual'`; feedback is suppressed until the user starts typing
- **Progressive disclosure in `full` mode** — `PasswordStrengthComponent` and `PasswordRulesComponent` show the policy checklist first, then transition to the analysis/success state once all rules are satisfied; panels animate in on switch
- **`hideStrength` input** — show/hide the strength label below the bar
- **`strengthChange` and `isValid` outputs** — 0–100 score and validity flag for form integration
- **`options: PasswordRuleOptions`** (`PasswordStrengthComponent`, `PasswordRulesComponent`) — partial type; unset keys fall back to `DEFAULT_PASSWORD_RULE_OPTIONS`; pass `false` to disable a default rule (e.g. `{ specialChar: false }`)
- **`messages: PasswordMeterMessages`** — partial type; override any subset of display messages; pass `''` to suppress a message entirely
- **`userInputs`** (`PasswordStrengthComponent`, `PasswordAnalysisComponent`) — forwarded to zxcvbn to penalize personal strings
- **zxcvbn lazy-loaded** via dynamic `import()` on first render — no bundle cost when only using `PasswordRulesComponent`
- **CSS custom properties** — `--pm-weak-color`, `--pm-medium-color`, `--pm-strong-color`, `--pm-buffer-color`
- Live demo: [ngx-zen.github.io/mat-password-meter](https://ngx-zen.github.io/mat-password-meter/)

[1.0.0]: https://github.com/ngx-zen/mat-password-meter/releases/tag/v1.0.0

