'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  firstConfigLine,
  normalizeWebUrl,
  readWebUrl,
  isSameAppOrigin,
  shouldOpenExternally,
} = require('./read-web-url.cjs');

const writeTempUrlFile = (contents) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sp-web-url-'));
  const urlFile = path.join(dir, 'web-url.txt');
  fs.writeFileSync(urlFile, contents);
  return { dir, urlFile };
};

test('firstConfigLine skips comments, blanks, and wrapping quotes', () => {
  assert.equal(firstConfigLine('# x\n\n// y\n  "https://a.example/"  \n'), 'https://a.example/');
  assert.equal(firstConfigLine(''), '');
  assert.equal(firstConfigLine('  # only a comment'), '');
});

test('normalizeWebUrl accepts http(s) and rejects other schemes', () => {
  assert.equal(normalizeWebUrl('https://tasks.example'), 'https://tasks.example/');
  assert.equal(normalizeWebUrl("'http://127.0.0.1:4200/'"), 'http://127.0.0.1:4200/');
  assert.throws(() => normalizeWebUrl(''), /No web URL/);
  assert.throws(() => normalizeWebUrl('file:///tmp/index.html'), /http\(s\)/);
  assert.throws(() => normalizeWebUrl('not a url'), /Invalid web URL/);
});

test('readWebUrl: SP_WEB_URL wins over the url file', () => {
  const { dir, urlFile } = writeTempUrlFile('https://from-file.example/\n');
  try {
    assert.equal(
      readWebUrl({
        env: { SP_WEB_URL: 'https://from-env.example/' },
        urlFile,
      }),
      'https://from-env.example/',
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('readWebUrl: reads the first real line from the url file', () => {
  const { dir, urlFile } = writeTempUrlFile(
    '# Production URL\n\nhttps://from-file.example/\nhttps://ignored.example/\n',
  );
  try {
    assert.equal(readWebUrl({ env: {}, urlFile }), 'https://from-file.example/');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('readWebUrl: fails when nothing usable is configured', () => {
  const { dir, urlFile } = writeTempUrlFile('# comment only\n');
  try {
    assert.throws(() => readWebUrl({ env: {}, urlFile }), /No web URL/);
    assert.throws(
      () => readWebUrl({ env: {}, urlFile: path.join(dir, 'missing.txt') }),
      /No web URL/,
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('committed web-url.txt is a usable http(s) URL', () => {
  const url = readWebUrl({ env: {}, urlFile: path.join(__dirname, 'web-url.txt') });
  assert.match(url, /^https:\/\//);
});

test('isSameAppOrigin compares origin only', () => {
  const app = 'https://tasks.example/#/tag/TODAY/tasks';
  assert.equal(isSameAppOrigin(app, 'https://tasks.example/#/config'), true);
  assert.equal(isSameAppOrigin(app, 'https://other.example/'), false);
  assert.equal(isSameAppOrigin(app, 'http://tasks.example/'), false);
  assert.equal(isSameAppOrigin(app, 'not a url'), false);
});

test('shouldOpenExternally only forwards foreign http(s) links', () => {
  const app = 'https://tasks.example/';
  assert.equal(shouldOpenExternally(app, 'https://other.example/help'), true);
  assert.equal(shouldOpenExternally(app, 'https://tasks.example/#/tasks'), false);
  assert.equal(shouldOpenExternally(app, 'javascript:alert(1)'), false);
  assert.equal(shouldOpenExternally(app, 'file:///etc/passwd'), false);
});
