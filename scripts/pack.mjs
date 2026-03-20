/**
 * Renames the versioned tarball produced by `npm pack` to a stable filename
 * so the demo can reference it as `mat-password-meter.tgz`.
 */
import { readdirSync, renameSync, rmSync, unlinkSync } from 'fs';
import { join } from 'path';

const DEMO_DIR = 'demo';
const STABLE_NAME = 'ngx-zen-mat-password-meter.tgz';

// Rename versioned tgz → stable name
const tarballs = readdirSync(DEMO_DIR).filter(f => /^ngx-zen-mat-password-meter-.*\.tgz$/.test(f));
if (tarballs.length) {
  renameSync(join(DEMO_DIR, tarballs[0]), join(DEMO_DIR, STABLE_NAME));
  console.log(`Renamed ${tarballs[0]} → ${STABLE_NAME}`);
}

// Remove stale demo lock file so a clean install picks up the new tarball
try {
  unlinkSync(join(DEMO_DIR, 'package-lock.json'));
  console.log('Removed demo/package-lock.json');
} catch {
  // not present, do nothing
}

// Remove the installed copy so npm doesn't serve it from cache on the next install
try {
  rmSync(join(DEMO_DIR, 'node_modules', '@ngx-zen', 'mat-password-meter'), { recursive: true, force: true });
  console.log('Removed demo/node_modules/@ngx-zen/mat-password-meter');
} catch {
  // not present, do nothing
}
