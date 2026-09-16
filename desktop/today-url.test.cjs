'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveWebUrl, toTodayTasksUrl, isSameOrigin } = require('./today-url.cjs');

test('resolveWebUrl: env wins over the url file', () => {
  assert.equal(
    resolveWebUrl({
      envUrl: 'https://from-env.example/',
      fileContents: 'https://from-file.example/',
    }),
    'https://from-env.example/',
  );
});

test('resolveWebUrl: skips comments and blank lines in the url file', () => {
  assert.equal(
    resolveWebUrl({
      fileContents: ['# comment', '', '// also a comment', 'https://tasks.example/'].join(
        '\n',
      ),
    }),
    'https://tasks.example/',
  );
});

test('resolveWebUrl: empty when nothing is configured', () => {
  assert.equal(resolveWebUrl({}), '');
  assert.equal(resolveWebUrl({ envUrl: '  # ignored  ', fileContents: '\n# x\n' }), '');
});

test('toTodayTasksUrl: pins the Today task list hash route', () => {
  assert.equal(
    toTodayTasksUrl('https://tasks.example'),
    'https://tasks.example/#/tag/TODAY/tasks',
  );
  assert.equal(
    toTodayTasksUrl('https://tasks.example/#/config'),
    'https://tasks.example/#/tag/TODAY/tasks',
  );
});

test('toTodayTasksUrl: rejects non-http(s) and invalid input', () => {
  assert.equal(toTodayTasksUrl(''), '');
  assert.equal(toTodayTasksUrl('file:///tmp/index.html'), '');
  assert.equal(toTodayTasksUrl('not a url'), '');
});

test('isSameOrigin: same host and scheme only', () => {
  const app = 'https://tasks.example/#/tag/TODAY/tasks';
  assert.equal(isSameOrigin('https://tasks.example/#/config', app), true);
  assert.equal(isSameOrigin('https://other.example/#/tag/TODAY/tasks', app), false);
  assert.equal(isSameOrigin('http://tasks.example/#/tag/TODAY/tasks', app), false);
});
