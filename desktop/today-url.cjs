'use strict';

const TODAY_HASH_PATH = '/tag/TODAY/tasks';

/**
 * @param {string | undefined} raw
 * @returns {string}
 */
const trimConfigLine = (raw) => {
  if (typeof raw !== 'string') {
    return '';
  }
  const trimmed = raw.trim();
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) {
    return '';
  }
  return trimmed;
};

/**
 * Prefer SP_WEB_URL, then the first non-comment line in web-url.txt.
 *
 * @param {{ envUrl?: string, fileContents?: string }} input
 * @returns {string}
 */
const resolveWebUrl = ({ envUrl, fileContents } = {}) => {
  const fromEnv = trimConfigLine(envUrl);
  if (fromEnv) {
    return fromEnv;
  }
  if (typeof fileContents !== 'string') {
    return '';
  }
  for (const line of fileContents.split(/\r?\n/)) {
    const value = trimConfigLine(line);
    if (value) {
      return value;
    }
  }
  return '';
};

/**
 * Open the virtual Today list. Hash routing is required (`withHashLocation`).
 *
 * @param {string} baseUrl
 * @returns {string}
 */
const toTodayTasksUrl = (baseUrl) => {
  const trimmed = typeof baseUrl === 'string' ? baseUrl.trim() : '';
  if (!trimmed) {
    return '';
  }
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return '';
    }
    url.hash = TODAY_HASH_PATH;
    return url.toString();
  } catch {
    return '';
  }
};

/**
 * @param {string} targetUrl
 * @param {string} appUrl
 * @returns {boolean}
 */
const isSameOrigin = (targetUrl, appUrl) => {
  try {
    return new URL(targetUrl).origin === new URL(appUrl).origin;
  } catch {
    return false;
  }
};

module.exports = {
  TODAY_HASH_PATH,
  resolveWebUrl,
  toTodayTasksUrl,
  isSameOrigin,
};
