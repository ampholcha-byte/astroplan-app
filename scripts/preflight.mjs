#!/usr/bin/env node
// AstroPlan preflight — drift detector
// Run: npm run preflight
// Exits non-zero if any drift/warning is detected, so it can gate a session start.
import { execSync } from 'node:child_process';
import { readFileSync, statSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const run = (cmd) => {
  try {
    return execSync(cmd, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
  } catch (e) {
    return ((e.stdout || '') + (e.stderr || '')).toString().trim();
  }
};

let warnings = 0;
const warn = (m) => { console.log('  ⚠ ' + m); warnings++; };
const ok = (m) => console.log('  ✓ ' + m);

console.log('AstroPlan preflight — drift check\n');

// 1. Git state — ignore files that are gitignored (local-only planning docs)
console.log('Git:');
const porcelain = run("git status --porcelain").split('\n').filter(Boolean);
const ignored = run('git status --porcelain --ignored')
  .split('\n')
  .filter((l) => l.startsWith('!!'))
  .map((l) => l.slice(2).trim());
const trackedDrift = porcelain.filter((line) => {
  const file = line.slice(3).trim();
  return !ignored.includes(file);
});
if (trackedDrift.length) warn(`${trackedDrift.length} uncommitted tracked file(s):\n    ` + trackedDrift.join('\n    '));
else ok('working tree clean (ignoring local-only docs)');
const ahead = parseInt(run('git rev-list --count origin/master..master').trim() || '0', 10);
const behind = parseInt(run('git rev-list --count master..origin/master').trim() || '0', 10);
if (ahead) warn(`${ahead} commit(s) ahead of origin (unpushed)`);
else ok('in sync with origin (no ahead)');
if (behind) warn(`${behind} commit(s) behind origin — pull before editing`);
else ok('not behind origin');

// 2. Version consistency (package.json is the single source of truth)
console.log('\nVersion:');
let pkgVer = 'unknown';
try {
  pkgVer = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).version;
  console.log(`  package.json = ${pkgVer}`);
} catch {
  warn('cannot read package.json version');
}
// read docs with node fs directly (avoids shell grep path issues on Windows)
const docVers = new Set();
const walk = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = resolve(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.md$/.test(e.name)) {
      const t = readFileSync(p, 'utf8');
      for (const m of t.matchAll(/\bv?(\d+\.\d+\.\d+)\b/g)) docVers.add(m[1]);
    }
  }
};
try { walk(resolve(root, 'docs/planning')); } catch { /* no docs dir */ }
const docArr = [...docVers];
if (docArr.length && !docArr.includes(pkgVer)) {
  warn(`docs/planning mentions [${docArr.join(', ')}] but package.json is ${pkgVer}`);
} else if (docArr.length) {
  ok('docs version matches package.json');
} else {
  ok('no version strings found in docs (nothing to compare)');
}

// 3. Handover freshness
console.log('\nHandover:');
try {
  const mtime = statSync(resolve(root, 'docs/planning/handover.md')).mtimeMs;
  const days = Math.floor((Date.now() - mtime) / 86400000);
  if (days > 30) warn(`handover.md last updated ${days} days ago — update before resuming`);
  else ok(`handover.md fresh (${days}d old)`);
} catch {
  warn('handover.md not found');
}

console.log(`\n${warnings ? warnings + ' warning(s) — review before starting' : 'OK — no drift detected'}`);
process.exit(warnings ? 1 : 0);
