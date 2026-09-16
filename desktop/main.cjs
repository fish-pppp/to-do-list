'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {
  readTodayTasksUrl,
  toTodayTasksUrl,
  stripElectronFromUserAgent,
  isSameAppOrigin,
  shouldOpenExternally,
} = require('./read-web-url.cjs');
const {
  FULL,
  MIN_SIZE,
  parseState,
  withBounds,
  toggled,
  isToggleShortcut,
} = require('./window-mode.cjs');

const APP_NAME = '今日待办';
const STATE_FILE = 'today-window.json';
const SAVE_DEBOUNCE_MS = 400;

/**
 * @param {{ preventDefault?: () => void }} [event]
 * @param {{ openExternal: (url: string) => unknown }} shell
 * @param {string} appUrl
 * @param {string} targetUrl
 * @returns {'allow' | 'deny'}
 */
const handleExternalNavigation = (event, shell, appUrl, targetUrl) => {
  if (isSameAppOrigin(appUrl, targetUrl)) {
    return 'allow';
  }
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }
  if (shouldOpenExternally(appUrl, targetUrl)) {
    void shell.openExternal(targetUrl);
  }
  return 'deny';
};

/**
 * Small JSON store for the window mode + bounds. fs is injectable for tests.
 *
 * @param {string | undefined} statePath
 * @param {{ readFileSync: typeof fs.readFileSync, writeFileSync: typeof fs.writeFileSync, mkdirSync: typeof fs.mkdirSync }} [fsImpl]
 */
const createStateStore = (statePath, fsImpl = fs) => ({
  load: () => {
    if (!statePath) {
      return parseState(undefined);
    }
    try {
      return parseState(fsImpl.readFileSync(statePath, 'utf8'));
    } catch {
      return parseState(undefined);
    }
  },
  /** @param {ReturnType<typeof parseState>} state */
  save: (state) => {
    if (!statePath) {
      return;
    }
    try {
      fsImpl.mkdirSync(path.dirname(statePath), { recursive: true });
      fsImpl.writeFileSync(statePath, JSON.stringify(state, null, 2));
    } catch {
      // Window state is a convenience; never let it break the app.
    }
  },
});

/**
 * Compact pane for today's tasks that can grow into a full window.
 * Electron is injected so this file can be unit-tested without the package.
 *
 * @param {typeof import('electron')} electron
 * @param {string} appUrl
 * @param {{ statePath?: string, fsImpl?: Parameters<typeof createStateStore>[1] }} [options]
 */
const createDesktopWindow = (electron, appUrl, options = {}) => {
  const { BrowserWindow, Menu, shell } = electron;
  const todayUrl = toTodayTasksUrl(appUrl);
  const store = createStateStore(options.statePath, options.fsImpl);
  let state = store.load();
  Menu.setApplicationMenu(null);

  const win = new BrowserWindow({
    ...state.bounds[state.mode],
    minWidth: MIN_SIZE.width,
    minHeight: MIN_SIZE.height,
    title: APP_NAME,
    autoHideMenuBar: true,
    show: true,
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      nodeIntegrationInSubFrames: false,
    },
  });

  win.setMenuBarVisibility(false);

  if (
    typeof win.webContents.getUserAgent === 'function' &&
    typeof win.webContents.setUserAgent === 'function'
  ) {
    win.webContents.setUserAgent(
      stripElectronFromUserAgent(win.webContents.getUserAgent()),
    );
  }

  let saveTimer = null;
  const rememberBounds = () => {
    if (typeof win.isMaximized === 'function' && win.isMaximized()) {
      return;
    }
    if (typeof win.getBounds !== 'function') {
      return;
    }
    state = withBounds(state, state.mode, win.getBounds());
    if (saveTimer) {
      clearTimeout(saveTimer);
    }
    saveTimer = setTimeout(() => {
      saveTimer = null;
      store.save(state);
    }, SAVE_DEBOUNCE_MS);
  };

  const toggleMode = () => {
    rememberBounds();
    state = toggled(state);
    if (typeof win.isMaximized === 'function' && win.isMaximized()) {
      win.unmaximize();
    }
    win.setBounds(state.bounds[state.mode]);
    if (state.mode === FULL && typeof win.center === 'function') {
      const b = state.bounds[FULL];
      if (b.x === undefined || b.y === undefined) {
        win.center();
      }
    }
    store.save(state);
  };

  win.on('resize', rememberBounds);
  win.on('move', rememberBounds);
  win.on('close', () => {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    rememberBounds();
    store.save(state);
  });

  win.webContents.on('before-input-event', (event, input) => {
    if (isToggleShortcut(input)) {
      event.preventDefault();
      toggleMode();
    }
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    const action = handleExternalNavigation(undefined, shell, todayUrl, url);
    return { action };
  });

  win.webContents.on('will-navigate', (event, url) => {
    handleExternalNavigation(event, shell, todayUrl, url);
  });

  void win.loadURL(todayUrl);
  return { win, toggleMode, getState: () => state };
};

/**
 * @param {typeof import('electron')} electron
 * @param {string} [appUrl]
 */
const startDesktopApp = (electron, appUrl = readTodayTasksUrl()) => {
  const { app, BrowserWindow } = electron;

  if (process.platform === 'linux') {
    app.commandLine.appendSwitch('gtk-version', '3');
  }

  app.setName(APP_NAME);
  if (typeof app.userAgentFallback === 'string') {
    app.userAgentFallback = stripElectronFromUserAgent(app.userAgentFallback);
  }

  const open = () => {
    createDesktopWindow(electron, appUrl, {
      statePath: path.join(app.getPath('userData'), STATE_FILE),
    });
  };

  void app.whenReady().then(() => {
    open();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        open();
      }
    });
  });

  app.on('window-all-closed', () => {
    app.quit();
  });
};

// Electron may not set require.main to this file. Node tests require() it
// without process.versions.electron, so they only get the exports.
if (process.versions.electron || require.main === module) {
  let electron;
  try {
    electron = require('electron');
  } catch {
    console.error(
      'Electron is not installed. Run npm ci, or use npm run desktop:chrome.',
    );
    process.exit(1);
  }
  startDesktopApp(electron);
}

module.exports = {
  APP_NAME,
  STATE_FILE,
  createDesktopWindow,
  createStateStore,
  startDesktopApp,
  handleExternalNavigation,
};
