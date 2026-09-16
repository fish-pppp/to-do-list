'use strict';

/**
 * Two window sizes: a compact "just today's tasks" pane and a full-size
 * window for the whole web app. The last mode and the bounds of each mode
 * are persisted so the window reopens where the user left it.
 */

const COMPACT = 'compact';
const FULL = 'full';

const COMPACT_BOUNDS = Object.freeze({ width: 340, height: 540 });
const FULL_BOUNDS = Object.freeze({ width: 1100, height: 760 });
const MIN_SIZE = Object.freeze({ width: 280, height: 380 });

const DEFAULT_STATE = Object.freeze({
  mode: COMPACT,
  bounds: Object.freeze({
    [COMPACT]: COMPACT_BOUNDS,
    [FULL]: FULL_BOUNDS,
  }),
});

/**
 * @param {string} mode
 * @returns {string}
 */
const otherMode = (mode) => (mode === FULL ? COMPACT : FULL);

/**
 * @param {unknown} value
 * @returns {value is {width: number, height: number, x?: number, y?: number}}
 */
const isBounds = (value) => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const b = /** @type {Record<string, unknown>} */ (value);
  const okSize =
    Number.isFinite(b.width) &&
    Number.isFinite(b.height) &&
    Number(b.width) >= MIN_SIZE.width &&
    Number(b.height) >= MIN_SIZE.height;
  const okPos =
    (b.x === undefined || Number.isFinite(b.x)) &&
    (b.y === undefined || Number.isFinite(b.y));
  return okSize && okPos;
};

/**
 * Tolerates a missing, corrupt or partial state file.
 *
 * @param {unknown} raw
 * @returns {{ mode: string, bounds: Record<string, {width: number, height: number, x?: number, y?: number}> }}
 */
const parseState = (raw) => {
  let parsed = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
  }
  const obj =
    parsed && typeof parsed === 'object'
      ? /** @type {Record<string, unknown>} */ (parsed)
      : {};
  const mode = obj.mode === FULL ? FULL : COMPACT;
  const savedBounds =
    obj.bounds && typeof obj.bounds === 'object'
      ? /** @type {Record<string, unknown>} */ (obj.bounds)
      : {};
  return {
    mode,
    bounds: {
      [COMPACT]: isBounds(savedBounds[COMPACT])
        ? { ...savedBounds[COMPACT] }
        : { ...COMPACT_BOUNDS },
      [FULL]: isBounds(savedBounds[FULL]) ? { ...savedBounds[FULL] } : { ...FULL_BOUNDS },
    },
  };
};

/**
 * @param {ReturnType<typeof parseState>} state
 * @param {string} mode
 * @param {{width: number, height: number, x?: number, y?: number}} bounds
 * @returns {ReturnType<typeof parseState>}
 */
const withBounds = (state, mode, bounds) => {
  if (!isBounds(bounds)) {
    return state;
  }
  return {
    mode: state.mode,
    bounds: { ...state.bounds, [mode]: { ...bounds } },
  };
};

/**
 * @param {ReturnType<typeof parseState>} state
 * @returns {ReturnType<typeof parseState>}
 */
const toggled = (state) => ({ ...state, mode: otherMode(state.mode) });

/**
 * Ctrl/Cmd+Shift+F toggles compact <-> full. Shift+F alone is the web app's
 * search shortcut, so the modifier is required.
 *
 * @param {{ type?: string, key?: string, control?: boolean, meta?: boolean, shift?: boolean, alt?: boolean }} input
 * @returns {boolean}
 */
const isToggleShortcut = (input) => {
  if (!input || input.type !== 'keyDown') {
    return false;
  }
  if (!(input.control || input.meta) || !input.shift || input.alt) {
    return false;
  }
  return String(input.key || '').toLowerCase() === 'f';
};

module.exports = {
  COMPACT,
  FULL,
  COMPACT_BOUNDS,
  FULL_BOUNDS,
  MIN_SIZE,
  DEFAULT_STATE,
  otherMode,
  isBounds,
  parseState,
  withBounds,
  toggled,
  isToggleShortcut,
};
