# Contributing

## Project structure

```
src/
  ng-package.json          # ng-packagr config — primary entry point
  public-api.ts            # Exports shared utilities and types only
  package.json             # Published package.json (name: mat-password-meter)
  shared/
    types.ts               # PasswordRuleOptions, PasswordRuleCheck, ZxcvbnResult, ZxcvbnScore, ZxcvbnFn, PasswordMeterMessages
    rules.utils.ts         # evaluateRules(), computeRulesScore()
    meter.utils.ts         # scoreToColor(), scoreToLabel(), ZXCVBN_SCORE_MAP
    meter.styles.ts        # METER_STYLES shared CSS constant
  rules/
    ng-package.json        # Secondary entry: mat-password-meter/rules
    index.ts
    lib/
      password-rules.component.ts
      password-rules.component.html
      password-rules.component.spec.ts
  analysis/
    ng-package.json        # Secondary entry: mat-password-meter/analysis
    index.ts
    lib/
      password-analysis.component.ts
      password-analysis.component.html
      password-analysis.component.spec.ts
  strength/
    ng-package.json        # Secondary entry: mat-password-meter/strength
    index.ts
    lib/
      password-strength.component.ts
      password-strength.component.html
      password-strength.component.spec.ts
demo/                      # demonstration app
scripts/
  pack.mjs                 # Post-pack rename script
```

## Setup

```bash
git clone https://github.com/ngx-zen/mat-password-meter.git
cd mat-password-meter
npm install
```

## Building

```bash
npm run build
```

Output is written to `dist/` by [ng-packagr](https://github.com/ng-packagr/ng-packagr). The build produces four entry points: the primary `mat-password-meter` (shared utilities and types only) and the secondary `mat-password-meter/strength`, `mat-password-meter/rules`, and `mat-password-meter/analysis`.

## Testing

```bash
npm test                  # run once
npm test -- --watch       # watch mode
npm test -- --coverage    # coverage report
```

Tests use [Jest](https://jestjs.io/) via [jest-preset-angular](https://thymikee.github.io/jest-preset-angular/).

## Running the demo locally

A minimal Angular app in `demo/` showcases all three components — Rules, Analysis, and Meter.

### Option 1 — From source with hot reload (recommended)

```bash
npm run dev     # http://localhost:4200
```

Installs demo dependencies and starts `ng serve --configuration source`. This uses
`demo/tsconfig.dev.json` which maps all three entry points directly to their TypeScript
sources:

```json
"mat-password-meter":           "../../src/public-api.ts"
"mat-password-meter/strength":  "../../src/strength/index.ts"
"mat-password-meter/rules":     "../../src/rules/index.ts"
"mat-password-meter/analysis":  "../../src/analysis/index.ts"
```

Changes to any source file under `src/` trigger a live browser reload automatically — no rebuild needed.

> **Note:** Hot reload can occasionally miss changes to files deep in `src/` (shared utilities, styles) because Angular CLI's watcher has limited reliability for out-of-project-root paths resolved via path aliases. If a change doesn't appear, save any file inside `demo/src/` (e.g. `app.component.ts`) to force a recompile.

### Option 2 — From the built tarball (closest to real publish)

```bash
npm run demo    # http://localhost:3000
```

Builds the library, packs it as a `.tgz`, installs it into `demo/node_modules/`, builds
the demo, and serves the static output. Use this to verify the actual published package end-to-end. Library changes
require re-running the full command.

## Code style

This project uses [Prettier](https://prettier.io/) for formatting. A [Husky](https://typicode.github.io/husky/) pre-commit hook runs `lint-staged` to check all staged `src/` and `demo/src/` files before every commit.

```bash
npm run format          # format all files in place
npm run format:check    # check without writing (used in CI)
```

If the pre-commit hook blocks your commit, run `npm run format` and re-stage the files.

## Peer dependency: zxcvbn

`zxcvbn` is an **optional** peer dependency. It is only required when using `PasswordAnalysisComponent` or `PasswordStrengthComponent`. `PasswordRulesComponent` is purely regex-based and has no dependency on `zxcvbn` at all.

When `zxcvbn` is needed, it is lazy-loaded via a dynamic `import()` on first render — it is never bundled eagerly. `peerDependenciesMeta` in `src/package.json` marks it as optional so package managers do not warn consumers who only use the rules component.

It is listed in both `demo/package.json` and the root `devDependencies` so the demo and unit tests work out of the box.


