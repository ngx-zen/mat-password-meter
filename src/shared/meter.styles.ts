/** Shared styles for all mat-password-meter components. */
export const METER_STYLES = `
@keyframes ngx-pm-panel-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.password-meter-container {
  & .password-meter-label {
    margin-top: 8px;
    margin-bottom: 10px;
    font-size: var(--mat-sys-title-small-size, 0.875rem);
    font-weight: var(--mat-sys-title-small-weight, 500);
    color: var(--mat-sys-on-surface);
  }
  & .mdc-linear-progress__buffer-bar {
    background-color: var(--pm-buffer-color, var(--mat-sys-surface-variant, #888888));
  }
  & .mat-mdc-progress-bar.mat-warn .mdc-linear-progress__bar-inner {
    background-color: var(--pm-weak-color, #ed1c24);
    border-color: var(--pm-weak-color, #ed1c24);
  }
  & .mat-mdc-progress-bar.mat-accent .mdc-linear-progress__bar-inner {
    background-color: var(--pm-medium-color, #ffd700);
    border-color: var(--pm-medium-color, #ffd700);
  }
  & .mat-mdc-progress-bar.mat-primary .mdc-linear-progress__bar-inner {
    background-color: var(--pm-strong-color, #258341);
    border-color: var(--pm-strong-color, #258341);
  }
  & .password-meter-rules,
  & .password-meter-suggestions {
    list-style: none;
    padding: 0;
    font-size: var(--mat-sys-body-small-size, 0.8rem);
  }
  & .password-meter-rules {
    margin: 8px 0 0;
  }
  & .password-meter-suggestions {
    margin: 4px 0 0;
  }
  & .password-meter-rules li,
  & .password-meter-suggestions li {
    margin: 2px 0;
  }
  & .password-meter-rules li.passed {
    color: var(--pm-rule-pass-color, light-dark(#2e9244, #66bb6a));
  }
  & .password-meter-rules li.failed {
    color: var(--pm-rule-fail-color, light-dark(#d32f2f, #ef5350));
  }
  & .password-meter-warning,
  & .password-meter-hint,
  & .password-meter-nudge,
  & .password-meter-suggestions li,
  & .password-meter-rules li {
    line-height: 1.4;
  }
  & .password-meter-warning,
  & .password-meter-hint,
  & .password-meter-suggestions li,
  & .password-meter-rules li {
    & > span[aria-hidden] {
      display: inline-block;
      width: 1.25em;
      line-height: 1;
      text-align: center;
    }
  }
  & .password-meter-warning {
    margin: 8px 0 0;
    font-size: var(--mat-sys-body-small-size, 0.8rem);
    color: var(--pm-warning-color, light-dark(#7a6000, #c9a200));
  }
  & .password-meter-suggestions li {
    color: var(--pm-secondary-text, light-dark(#555, #aaa));
  }
  & .password-meter-feedback {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 150ms ease-out;
    & > div {
      overflow: hidden;
      min-height: 0;
    }
    &.active {
      grid-template-rows: 1fr;
    }
  }
  & .password-meter-panel {
    margin-top: 8px;
    animation: ngx-pm-panel-in 200ms ease-out;
  }
  & .password-meter-hint {
    margin: 8px 0 0;
    font-size: var(--mat-sys-body-small-size, 0.8rem);
    color: var(--pm-secondary-text, light-dark(#555, #aaa));
    &.passed {
      color: var(--pm-rule-pass-color, light-dark(#2e9244, #66bb6a));
    }
  }
  & .password-meter-nudge {
    margin: 8px 0 0;
    font-size: var(--mat-sys-body-small-size, 0.8rem);
    color: var(--pm-secondary-text, light-dark(#555, #aaa));
  }
}
`;
