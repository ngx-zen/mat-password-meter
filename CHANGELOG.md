# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.2] — 2026-03-27

### Breaking Changes

- **Requires Angular 20** (`^20.0.0`) and Angular Material 20 (`^20.0.0`)

## 2.0.1 — 2026-03-27 [YANKED]

Unpublished from npm; version number permanently unavailable.

## 2.0.0 — 2026-03-27 [YANKED]

Unpublished from npm; version number permanently unavailable.

## [1.5.1] — 2026-03-27

### Changed

- **Disabled-options nudge** — capped at 2 suggestions (was 3) and now uses "or" instead of "and" to better reflect that adding any one of the listed character types will improve entropy (relevant in NIST-aligned configurations with composition rules disabled)

## [1.5.0] — 2026-03-26

### Added

- **`customRules` input** — app-specific policy gates (e.g. "Must not contain username") on `PasswordStrengthComponent` and `PasswordRulesComponent`; block `isValid` and appear as failing hints when violated but do not affect the strength score
- **`CustomRulesFn` type** — exported from the primary entry point and all secondary entry points that use rules
- **`customRuleChecks` signal** — public computed signal on `PasswordStrengthComponent` and `PasswordRulesComponent` exposing evaluated custom rule results

### Changed

- **Bar color** — switches to `warn` while any custom rule fails, even if the strength score is 100%
- **Hint priority** — both components now surface failing custom rules in their hint text: `PasswordStrengthComponent` shows them after built-in failures and before zxcvbn feedback; `PasswordRulesComponent` falls back to them once all built-in rules pass
- **Full-mode panel** — `PasswordStrengthComponent` remains on the rules checklist while any custom rule is still failing

## [1.4.0] — 2026-03-25

### Changed

- Nudge in `PasswordStrengthComponent` and `PasswordAnalysisComponent` now suggests specific missing character classes before falling back to the generic "Make it harder to guess."
- `disabledNudge` callback added to `PasswordMeterMessages` to customize or suppress the nudge

## [1.3.1] — 2026-03-23

### Fixed

- **Flash of "Very Weak" on input clear** — panel content is now hidden via `visibility: hidden` until the panel becomes active, eliminating the brief label flash when the password field is cleared

## [1.3.0] — 2026-03-23

### Added

- **`PasswordStrengthLabels` type** — override any or all strength level labels (`veryWeak`, `weak`, `fair`, `good`, `strong`, `veryStrong`) via `messages.strengthLabels`
- **`PasswordRuleLabels` type** — override per-rule checklist labels (`minLength`, `lowercase`, `uppercase`, `number`, `specialChar`) via `messages.ruleLabels`; `minLength` accepts a `(n: number) => string` function for dynamic minimum
- **`messages.strengthLabels`** — new optional field on `PasswordMeterMessages`; all three components respect it
- **`messages.ruleLabels`** — new optional field on `PasswordMeterMessages`; used by `PasswordStrengthComponent` and `PasswordRulesComponent` (ignored by `PasswordAnalysisComponent`)

## [1.2.0] — 2026-03-22

### Changed

- **Phased strength meter** — `PasswordStrengthComponent` bar shows rule progress first, switches to zxcvbn once rules pass
- **`strength` signal** — `PasswordStrengthComponent` now phase-aware; replaces the old `Math.min` bottleneck and removed `displayStrength`
- **`rulesPercent`, `zxcvbnPercent` signals** — now `protected` on `PasswordStrengthComponent` (previously public)
- **`isValid` output** — `PasswordStrengthComponent` checks `allRulesPassed() && zxcvbnPercent() === 100`

## [1.1.2] — 2026-03-22

### Fixed

- **zxcvbn load failure** — `import('zxcvbn')` now catches load errors (network, CSP) and logs to console instead of silently failing
- **zxcvbn module cast** — runtime `typeof` guard replaces unsafe double-cast

### Changed

- **Performance** — eliminated redundant `evaluateRules` call per keystroke; moved zxcvbn import from `effect()` to constructor
- **Accessibility** — rule list items now include `aria-label` with pass/fail status
- **Keyframe name** — `pm-panel-in` renamed to `ngx-pm-panel-in` to avoid collisions

## [1.1.1] — 2026-03-21

### Fixed

- **Strength label** — suppressed when `password` is empty; no longer shows "Very Weak" before the user starts typing

## [1.1.0] — 2026-03-21

### Changed

- **Theming** — typography now references Angular Material design tokens (`--mat-sys-title-small-size`, `--mat-sys-body-small-size`, `--mat-sys-title-small-weight`); structural colors reference `--mat-sys-on-surface` and `--mat-sys-surface-variant`; semantic text colors use CSS `light-dark()` for automatic light/dark adaptation

### Added

- **`--pm-rule-pass-color`** — passed rule text and success hint color; split from `--pm-strong-color`; defaults to `light-dark(#2e9244, #66bb6a)`
- **`--pm-rule-fail-color`** — failed rule text color; split from `--pm-weak-color`; defaults to `light-dark(#d32f2f, #ef5350)`
- **`--pm-warning-color`** — zxcvbn warning text color; defaults to `light-dark(#7a6000, #c9a200)`
- **`--pm-secondary-text`** — hint, suggestion, and nudge text color; defaults to `light-dark(#555, #aaa)`
- **`ZxcvbnFn` type** — exported from the primary entry point and all secondary entry points that use zxcvbn

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

[2.0.2]: https://github.com/ngx-zen/mat-password-meter/compare/v1.5.1...v2.0.2
[1.5.1]: https://github.com/ngx-zen/mat-password-meter/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/ngx-zen/mat-password-meter/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/ngx-zen/mat-password-meter/compare/v1.3.1...v1.4.0
[1.3.1]: https://github.com/ngx-zen/mat-password-meter/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/ngx-zen/mat-password-meter/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/ngx-zen/mat-password-meter/compare/v1.1.2...v1.2.0
[1.1.2]: https://github.com/ngx-zen/mat-password-meter/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/ngx-zen/mat-password-meter/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/ngx-zen/mat-password-meter/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/ngx-zen/mat-password-meter/releases/tag/v1.0.0

