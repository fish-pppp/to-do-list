'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  buildChromiumArgs,
  launchDesktop,
  parseLaunchArgs,
  resolveChromium,
} = require('./open.cjs');
const { WINDOW_WIDTH, WINDOW_HEIGHT } = require('./read-web-url.cjs');

const makeChromeDir = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sp-chrome-'));
  const chrome = path.join(dir, 'google-chrome');
  fs.writeFileSync(chrome, '#!/bin/sh\n');
  fs.chmodSync(chrome, 0o755);
  return { dir, chrome };
};

test('parseLaunchArgs reads browser / electron / print flags', () => {
  assert.deepEqual(parseLaunchArgs(['--browser', '--print-url']), {
    browserOnly: true,
    electronOnly: false,
    printUrl: true,
    printCommand: false,
  });
  assert.equal(parseLaunchArgs(['--chrome']).browserOnly, true);
  assert.equal(parseLaunchArgs(['--electron']).electronOnly, true);
});

test('buildChromiumArgs uses --app= and the sidebar window size', () => {
  assert.deepEqual(buildChromiumArgs('https://tasks.example/'), [
    '--app=https://tasks.example/',
    `--window-size=${WINDOW_WIDTH},${WINDOW_HEIGHT}`,
  ]);
});

test('resolveChromium finds a PATH browser on linux', () => {
  const { dir, chrome } = makeChromeDir();
  try {
    assert.equal(
      resolveChromium({ platform: 'linux', env: { PATH: dir } }),
      chrome,
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('launchDesktop --print-url prints the configured URL and does not spawn', () => {
  const { dir, chrome } = makeChromeDir();
  const printed = [];
  const spawned = [];
  try {
    const result = launchDesktop({
      argv: ['--print-url'],
      env: { SP_WEB_URL: 'https://tasks.example/', PATH: dir },
      platform: 'linux',
      spawnFn: (command) => spawned.push(command),
      log: (msg) => printed.push(msg),
    });
    assert.equal(result.url, 'https://tasks.example/#/tag/TODAY/tasks');
    assert.deepEqual(printed, ['https://tasks.example/#/tag/TODAY/tasks']);
    assert.deepEqual(spawned, []);
    assert.equal(chrome.endsWith('google-chrome'), true);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('launchDesktop without flags prefers Chrome --app= even if Electron exists', () => {
  const { dir, chrome } = makeChromeDir();
  try {
    const result = launchDesktop({
      argv: ['--print-command'],
      env: { SP_WEB_URL: 'https://tasks.example/', PATH: dir },
      platform: 'linux',
      spawnFn: () => {
        throw new Error('should not spawn');
      },
      log: () => {},
    });
    assert.equal(result.kind, 'browser');
    assert.equal(result.command && result.command.exe, chrome);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('launchDesktop --browser --print-command uses Chrome --app= on Today', () => {
  const { dir, chrome } = makeChromeDir();
  const printed = [];
  try {
    const result = launchDesktop({
      argv: ['--browser', '--print-command'],
      env: { SP_WEB_URL: 'https://tasks.example/', PATH: dir },
      platform: 'linux',
      spawnFn: () => {
        throw new Error('should not spawn');
      },
      log: (msg) => printed.push(msg),
    });
    assert.equal(result.kind, 'browser');
    assert.deepEqual(result.command, {
      exe: chrome,
      args: [
        '--app=https://tasks.example/#/tag/TODAY/tasks',
        `--window-size=${WINDOW_WIDTH},${WINDOW_HEIGHT}`,
      ],
    });
    assert.equal(printed[0].includes('--app=https://tasks.example/#/tag/TODAY/tasks'), true);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('launchDesktop --browser fails clearly when no Chromium is installed', () => {
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'sp-empty-path-'));
  try {
    assert.throws(
      () =>
        launchDesktop({
          argv: ['--browser'],
          env: { SP_WEB_URL: 'https://tasks.example/', PATH: empty },
          platform: 'linux',
          spawnFn: () => {},
        }),
      /Chrome or Microsoft Edge/,
    );
  } finally {
    fs.rmSync(empty, { recursive: true, force: true });
  }
});
