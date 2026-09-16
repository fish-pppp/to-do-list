'use strict';

const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_URL_FILE = path.join(__dirname, 'web-url.txt');
const WINDOW_WIDTH = 420;
const WINDOW_HEIGHT = 780;

/**
 * @param {string | undefined} raw
 * @returns {string}
 */
const firstConfigLine = (raw) => {
  if (typeof raw !== 'string') {
    return '';
  }
  const text = raw.replace(/^\uFEFF/, '');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) {
      continue;
    }
    return trimmed.replace(/^['"]|['"]$/g, '');
  }
  return '';
};

/**
 * @param {string} raw
 * @returns {string}
 */
const normalizeWebUrl = (raw) => {
  const value = typeof raw === 'string' ? raw.trim().replace(/^['"]|['"]$/g, '') : '';
  if (!value) {
    throw new Error(
      'No web URL set. Put https://… in desktop/web-url.txt or set SP_WEB_URL.',
    );
  }
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`Invalid web URL: ${value}`);
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`Web URL must be http(s): ${value}`);
  }
  return url.toString();
};

/**
 * Prefer SP_WEB_URL, then the first non-comment line in the url file.
 *
 * @param {{ env?: NodeJS.ProcessEnv, urlFile?: string }} [options]
 * @returns {string}
 */
const readWebUrl = ({ env = process.env, urlFile = DEFAULT_URL_FILE } = {}) => {
  const fromEnv = firstConfigLine(env.SP_WEB_URL);
  if (fromEnv) {
    return normalizeWebUrl(fromEnv);
  }
  let fileContents = '';
  try {
    fileContents = fs.readFileSync(urlFile, 'utf8');
  } catch {
    throw new Error(
      `No web URL set. Set SP_WEB_URL or create ${urlFile} with one https://… line.`,
    );
  }
  return normalizeWebUrl(firstConfigLine(fileContents));
};

/**
 * @param {string} appUrl
 * @param {string} targetUrl
 * @returns {boolean}
 */
const isSameAppOrigin = (appUrl, targetUrl) => {
  try {
    return new URL(targetUrl).origin === new URL(appUrl).origin;
  } catch {
    return false;
  }
};

/**
 * Open http(s) links that leave the app origin in the system browser.
 * javascript:/data:/file: are blocked and not forwarded.
 *
 * @param {string} appUrl
 * @param {string} targetUrl
 * @returns {boolean}
 */
const shouldOpenExternally = (appUrl, targetUrl) => {
  let target;
  try {
    target = new URL(targetUrl);
  } catch {
    return false;
  }
  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    return false;
  }
  return !isSameAppOrigin(appUrl, targetUrl);
};

module.exports = {
  DEFAULT_URL_FILE,
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
  firstConfigLine,
  normalizeWebUrl,
  readWebUrl,
  isSameAppOrigin,
  shouldOpenExternally,
};
