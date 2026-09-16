#!/usr/bin/env node
'use strict';

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { WINDOW_WIDTH, WINDOW_HEIGHT, readTodayTasksUrl } = require('./read-web-url.cjs');

const REPO_ROOT = path.join(__dirname, '..');
const ELECTRON_MAIN = path.join(__dirname, 'main.cjs');

const CHROMIUM_NAMES = [
  'google-chrome-stable',
  'google-chrome',
  'chromium-browser',
  'chromium',
  'microsoft-edge-stable',
  'microsoft-edge',
  'msedge',
];

/**
 * @param {string} filePath
 * @returns {boolean}
 */
const isFile = (filePath) => {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
};

/**
 * @param {string} name
 * @param {NodeJS.ProcessEnv} env
 * @param {NodeJS.Platform} platform
 * @returns {string | null}
 */
const lookOnPath = (name, env, platform) => {
  const pathVal = env.PATH || env.Path || '';
  const sep = platform === 'win32' ? ';' : ':';
  const exts =
    platform === 'win32' ? env.PATHEXT || '.EXE;.CMD;.BAT;.COM' : '';
  const extraExts = platform === 'win32' ? exts.split(';').filter(Boolean) : [''];
  if (!extraExts.includes('')) {
    extraExts.unshift('');
  }
  for (const dir of pathVal.split(sep)) {
    if (!dir) {
      continue;
    }
    for (const ext of extraExts) {
      const candidate = path.join(dir, name + ext);
      if (isFile(candidate)) {
        return candidate;
      }
    }
  }
  return null;
};

/**
 * @param {{ platform?: NodeJS.Platform, env?: NodeJS.ProcessEnv }} [options]
 * @returns {string | null}
 */
const resolveChromium = ({ platform = process.platform, env = process.env } = {}) => {
  const candidates = [];

  if (platform === 'win32') {
    const programFiles = env.ProgramFiles || 'C:\\Program Files';
    const programFilesX86 = env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
    const localAppData = env.LOCALAPPDATA || '';
    candidates.push(
      path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(programFilesX86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      path.join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      path.join(localAppData, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    );
  } else if (platform === 'darwin') {
    candidates.push(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
    );
  }

  for (const candidate of candidates) {
    if (candidate && isFile(candidate)) {
      return candidate;
    }
  }

  for (const name of CHROMIUM_NAMES) {
    const fromPath = lookOnPath(name, env, platform);
    if (fromPath) {
      return fromPath;
    }
  }
  return null;
};

/**
 * @param {string} [root]
 * @returns {string | null}
 */
const resolveElectronBinary = (root = REPO_ROOT) => {
  try {
    const electronPath = require(require.resolve('electron', { paths: [root] }));
    return typeof electronPath === 'string' && isFile(electronPath) ? electronPath : null;
  } catch {
    return lookOnPath('electron', process.env, process.platform);
  }
};

/**
 * @param {string} url
 * @returns {string[]}
 */
const buildChromiumArgs = (url) => [`--app=${url}`, `--window-size=${WINDOW_WIDTH},${WINDOW_HEIGHT}`];

/**
 * @param {string[]} argv
 * @returns {{ browserOnly: boolean, electronOnly: boolean, printUrl: boolean, printCommand: boolean }}
 */
const parseLaunchArgs = (argv) => ({
  browserOnly: argv.includes('--browser') || argv.includes('--chrome'),
  electronOnly: argv.includes('--electron'),
  printUrl: argv.includes('--print-url'),
  printCommand: argv.includes('--print-command'),
});

/**
 * @param {{ exe: string, args: string[] }} command
 * @param {{ detached?: boolean, stdio?: import('node:child_process').StdioOptions }} [options]
 */
const spawnDetached = (command, options = {}) => {
  const child = spawn(command.exe, command.args, {
    detached: options.detached !== false,
    stdio: options.stdio || 'ignore',
  });
  if (options.detached !== false) {
    child.unref();
  }
  return child;
};

/**
 * @param {{ argv?: string[], env?: NodeJS.ProcessEnv, platform?: NodeJS.Platform, spawnFn?: typeof spawnDetached, log?: (msg: string) => void }} [options]
 * @returns {{ url: string, command: { exe: string, args: string[] } | null, kind: 'url' | 'browser' | 'electron' }}
 */
const launchDesktop = ({
  argv = process.argv.slice(2),
  env = process.env,
  platform = process.platform,
  spawnFn = spawnDetached,
  log = console.log,
} = {}) => {
  const flags = parseLaunchArgs(argv);
  const url = readTodayTasksUrl({ env });

  if (flags.printUrl) {
    log(url);
    return { url, command: null, kind: 'url' };
  }

  const chromium = resolveChromium({ platform, env });
  const electronBin = resolveElectronBinary();

  const browserCommand = chromium
    ? { exe: chromium, args: buildChromiumArgs(url) }
    : null;
  const electronCommand = electronBin
    ? { exe: electronBin, args: [ELECTRON_MAIN] }
    : null;

  let chosen = null;
  let kind = 'browser';
  if (flags.electronOnly) {
    chosen = electronCommand;
    kind = 'electron';
  } else if (flags.browserOnly) {
    chosen = browserCommand;
    kind = 'browser';
  } else {
    chosen = electronCommand || browserCommand;
    kind = electronCommand ? 'electron' : 'browser';
  }

  if (!chosen) {
    const hint = flags.electronOnly
      ? 'Electron is not installed. Use npm run desktop (Chrome/Edge) instead.'
      : 'Install Google Chrome or Microsoft Edge, or run npm run desktop:electron if Electron is present.';
    throw new Error(hint);
  }

  if (flags.printCommand) {
    log([chosen.exe, ...chosen.args].join(' '));
    return { url, command: chosen, kind };
  }

  spawnFn(chosen, kind === 'electron' ? { detached: false, stdio: 'inherit' } : {});
  return { url, command: chosen, kind };
};

if (require.main === module) {
  try {
    launchDesktop();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  }
}

module.exports = {
  buildChromiumArgs,
  launchDesktop,
  lookOnPath,
  parseLaunchArgs,
  resolveChromium,
  resolveElectronBinary,
};
