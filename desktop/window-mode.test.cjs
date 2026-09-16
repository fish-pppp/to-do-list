'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  COMPACT,
  FULL,
  COMPACT_BOUNDS,
  FULL_BOUNDS,
  parseState,
  withBounds,
  toggled,
  isToggleShortcut,
} = require('./window-mode.cjs');

test('parseState: defaults to a compact window with both default sizes', () => {
  const state = parseState(undefined);
  assert.equal(state.mode, COMPACT);
  assert.deepEqual(state.bounds[COMPACT], COMPACT_BOUNDS);
  assert.deepEqual(state.bounds[FULL], FULL_BOUNDS);
});

test('parseState: survives corrupt json and too-small bounds', () => {
  assert.equal(parseState('{not json').mode, COMPACT);
  const state = parseState(
    JSON.stringify({ mode: FULL, bounds: { compact: { width: 10, height: 10 } } }),
  );
  assert.equal(state.mode, FULL);
  assert.deepEqual(state.bounds[COMPACT], COMPACT_BOUNDS);
});

test('parseState: keeps saved positions per mode', () => {
  const saved = {
    mode: FULL,
    bounds: {
      compact: { width: 360, height: 600, x: 10, y: 20 },
      full: { width: 1280, height: 800, x: 100, y: 50 },
    },
  };
  assert.deepEqual(parseState(JSON.stringify(saved)), saved);
});

test('withBounds only updates the given mode and ignores junk', () => {
  const base = parseState(undefined);
  const next = withBounds(base, FULL, { width: 900, height: 700, x: 5, y: 6 });
  assert.deepEqual(next.bounds[FULL], { width: 900, height: 700, x: 5, y: 6 });
  assert.deepEqual(next.bounds[COMPACT], COMPACT_BOUNDS);
  assert.equal(withBounds(base, FULL, { width: 1, height: 1 }), base);
});

test('toggled flips compact <-> full without touching bounds', () => {
  const base = parseState(undefined);
  const full = toggled(base);
  assert.equal(full.mode, FULL);
  assert.deepEqual(full.bounds, base.bounds);
  assert.equal(toggled(full).mode, COMPACT);
});

test('isToggleShortcut: Ctrl/Cmd+Shift+F on keyDown only', () => {
  assert.equal(
    isToggleShortcut({ type: 'keyDown', key: 'F', control: true, shift: true }),
    true,
  );
  assert.equal(
    isToggleShortcut({ type: 'keyDown', key: 'f', meta: true, shift: true }),
    true,
  );
  assert.equal(
    isToggleShortcut({ type: 'keyUp', key: 'F', control: true, shift: true }),
    false,
  );
  // plain Shift+F is the web app's search shortcut
  assert.equal(isToggleShortcut({ type: 'keyDown', key: 'F', shift: true }), false);
  assert.equal(
    isToggleShortcut({
      type: 'keyDown',
      key: 'F',
      control: true,
      shift: true,
      alt: true,
    }),
    false,
  );
});
