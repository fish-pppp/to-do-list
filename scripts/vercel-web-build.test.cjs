const { spawnSync } = require('node:child_process');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '..');
const rootTarball = path.join(repoRoot, 'deploy-artifacts', 'browser.tgz');
const packageTarball = path.join(
  repoRoot,
  'packages',
  'super-sync-server',
  'deploy-artifacts',
  'browser.tgz',
);
const rootScript = path.join(repoRoot, 'scripts', 'vercel-web-build.sh');
const packageScript = path.join(
  repoRoot,
  'packages',
  'super-sync-server',
  'scripts',
  'vercel-web-build.sh',
);

test('prebuilt browser tarball includes index.html', () => {
  assert.ok(fs.existsSync(rootTarball));
  const listed = spawnSync('tar', ['-tzf', rootTarball, 'browser/index.html'], {
    encoding: 'utf8',
  });
  assert.equal(listed.status, 0, listed.stderr);
  assert.match(listed.stdout, /browser\/index\.html/);
});

test('SuperSync package keeps a copy of the same tarball', () => {
  assert.ok(fs.existsSync(packageTarball));
  const root = fs.readFileSync(rootTarball);
  const packaged = fs.readFileSync(packageTarball);
  assert.equal(root.length, packaged.length);
  assert.ok(root.equals(packaged));
});

test('build script extracts when cwd is the SuperSync package', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vercel-web-build-'));
  const destScript = path.join(tmp, 'scripts', 'vercel-web-build.sh');
  fs.mkdirSync(path.dirname(destScript), { recursive: true });
  fs.copyFileSync(packageScript, destScript);
  fs.mkdirSync(path.join(tmp, 'deploy-artifacts'), { recursive: true });
  fs.copyFileSync(packageTarball, path.join(tmp, 'deploy-artifacts', 'browser.tgz'));

  const result = spawnSync('bash', [destScript], {
    cwd: tmp,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.ok(fs.existsSync(path.join(tmp, 'dist', 'browser', 'index.html')));
});

test('repo-root and SuperSync package scripts both exist', () => {
  assert.ok(fs.existsSync(rootScript));
  assert.ok(fs.existsSync(packageScript));
});
