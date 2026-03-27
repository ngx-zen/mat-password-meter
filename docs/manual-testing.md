# Manual testing guide

Test data for verifying behavior across all three components.
Default options: `min: 8, lowercase: true, uppercase: true, number: true, specialChar: true`.

---

## Phase 1: Rules

These test the rule phase in `PasswordStrengthComponent` and should match `PasswordRulesComponent` exactly.
`PasswordAnalysisComponent` ignores rules entirely.

| # | Password | Rules passed | Score | Label | Color | Contextual hint |
|---|----------|-------------|-------|-------|-------|-----------------|
| 1 | *(empty)* | 0/5 | 0 | Very Weak | warn | *(none)* |
| 2 | `a` | 1/5 | 20 | Weak | warn | "At least 8 characters" |
| 3 | `abcd` | 1/5 | 20 | Weak | warn | "At least 8 characters" |
| 4 | `abcdefgh` | 2/5 | 40 | Fair | accent | "At least 1 uppercase letter" |
| 5 | `abcdEfgh` | 3/5 | 60 | Good | accent | "At least 1 number" |
| 6 | `abcdEf1h` | 4/5 | 80 | Strong | accent | "At least 1 special character" |
| 7 | `abcEf1h!` | 5/5 | 100 | Very Strong | primary | Transitions to zxcvbn (Strength) / "Looks great!" (Rules) |

## Phase 2: zxcvbn

Once all rules pass in `PasswordStrengthComponent`, it switches to zxcvbn score.
`PasswordAnalysisComponent` always uses zxcvbn. Both should produce matching feedback.

| # | Password | Expected zxcvbn score | Strength % | Label | Contextual hint |
|---|----------|-----------------------|-----------|-------|-----------------|
| 8 | `abcEf1h!` | 2 | 50 | Fair | "Add another word or two. Uncommon words are better." |
| 9 | `Password1!` | 1 | 25 | Weak | "⚠︎ This is similar to a commonly used password" |
| 10 | `Tr0ub4dor&3` | 4 | 100 | Very Strong | "Looks great!" |
| 11 | `correct horse battery staple` | 4 | 100 | Very Strong | "Looks great!" (Analysis only — Strength stays in phase 1 at 40%, fails uppercase/number/specialChar) |
| 12 | `j7$kQ!mP9xL2@nR` | 3–4 | 75–100 | Good / Very Strong | suggestion or "Looks great!" |

## Disabled nudge

Set all composition to `false`, keep `min: 8`.

| # | Password | Component | Expected |
|---|----------|-----------|----------|
| 13 | `abdghduks` | Strength (contextual & full) | "→ Try adding uppercase letters or numbers" |
| 14 | `abdghduks` | Analysis (contextual & full) | same as above |
| 15 | `abdghdukS` | Strength (contextual & full) | "→ Try adding numbers or special characters" |
| 16 | `abdghdukS` | Analysis (contextual & full) | same as above |
| 17 | `@bdghdukS` | Strength (contextual & full) | "→ Try adding numbers" |
| 18 | `@bdghdukS` | Analysis (contextual & full) | same as above |
| 19 | `SS@1GHFGS` | Strength (contextual & full) | "→ Try adding lowercase letters" |
| 20 | `SS@1GHFGS` | Analysis (contextual & full) | same as above |
| 21 | `S22@sfsGSd` | Strength (contextual & full) | "Make it harder to guess." (all classes present, nudge is null) |
| 22 | `S22@sfsGSd` | Analysis (contextual & full) | same as above |

## Cross-component consistency

| Scenario | Strength | Rules | Analysis |
|----------|----------|-------|----------|
| Empty password | 0, Very Weak | 0, Very Weak | 0, Very Weak |
| All rules pass, zxcvbn score 4 | 100, "Looks great!" | 100, "Looks great!" | 100, "Looks great!" |
| All rules pass, zxcvbn score 2 | 50, Fair, zxcvbn hint | 100, "Looks great!" | 50, Fair, zxcvbn hint |
| 3/5 rules pass | 60, Good, rule hint | 60, Good, rule hint | *(ignores rules)* |
| `aaaaaaaa` (all disabled, min:8) | ⚠︎ zxcvbn warning | "Looks great!" (100%) | ⚠︎ zxcvbn warning |

> **Key insight:** "All rules pass, zxcvbn score 2" is where Strength and Analysis align (both show zxcvbn feedback) but diverge from Rules (which reports 100%). This confirms the two-phase design.
