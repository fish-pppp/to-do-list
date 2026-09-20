'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createDesktopWindow,
  createStateStore,
  handleExternalNavigation,
} = require('./main.cjs');
const {
  COMPACT,
  FULL,
  COMPACT_BOUNDS,
  FULL_BOUNDS,
  MIN_SIZE,
} = require('./window-mode.cjs');

const APP_URL = 'https://tasks.example/';

const createFakeElectron = () => {
  const openExternalCalls = [];
  const windows = [];

  class FakeBrowserWindow {
    constructor(options) {
      this.options = options;
      this.bounds = {
        width: options.width,
        height: options.height,
        x: options.x ?? 100,
        y: options.y ?? 100,
      };
      this.maximized = false;
      this.menuBarVisible = true;
      this.loadedUrl = '';
      this.windowOpenHandler = null;
      this.listeners = {};
      this.winListeners = {};
      this.userAgent = 'Mozilla/5.0 Chrome/144.0.7559.60 Electron/43.5.0 Safari/537.36';
      this.webContents = {
        getUserAgent: () => this.userAgent,
        setUserAgent: (ua) => {
          this.userAgent = ua;
        },
        setWindowOpenHandler: (fn) => {
          this.windowOpenHandler = fn;
        },
        on: (eventName, fn) => {
          this.listeners[eventName] = fn;
        },
      };
      windows.push(this);
    }

    on(eventName, fn) {
      this.winListeners[eventName] = fn;
    }

    setMenuBarVisibility(visible) {
      this.menuBarVisible = visible;
    }

    loadURL(url) {
      this.loadedUrl = url;
    }

    getBounds() {
      return { ...this.bounds };
    }

    setBounds(bounds) {
      this.bounds = { ...this.bounds, ...bounds };
    }

    isMaximized() {
      return this.maximized;
    }

    unmaximize() {
      this.maximized = false;
    }

    center() {
      this.centered = true;
    }
  }

  return {
    windows,
    openExternalCalls,
    electron: {
      BrowserWindow: FakeBrowserWindow,
      Menu: {
        setApplicationMenu: (menu) => {
          FakeBrowserWindow.lastMenu = menu;
        },
      },
      shell: {
        openExternal: (url) => {
          openExternalCalls.push(url);
        },
      },
    },
  };
};

const createMemoryFs = (initial = {}) => {
  const files = { ...initial };
  return {
    files,
    fsImpl: {
      readFileSync: (p) => {
        if (!(p in files)) {
          const err = new Error('ENOENT');
          err.code = 'ENOENT';
          throw err;
        }
        return files[p];
      },
      writeFileSync: (p, contents) => {
        files[p] = contents;
      },
      mkdirSync: () => {},
    },
  };
};

test('createDesktopWindow: starts compact, no menu, sandboxed, loads Today', () => {
  const { electron, windows } = createFakeElectron();
  createDesktopWindow(electron, APP_URL);

  assert.equal(windows.length, 1);
  const win = windows[0];
  assert.equal(win.options.width, COMPACT_BOUNDS.width);
  assert.equal(win.options.height, COMPACT_BOUNDS.height);
  assert.equal(win.options.minWidth, MIN_SIZE.width);
  assert.equal(win.options.minHeight, MIN_SIZE.height);
  assert.equal(win.options.title, '今日待办');
  assert.equal(win.options.autoHideMenuBar, true);
  assert.equal(win.menuBarVisible, false);
  assert.equal(electron.BrowserWindow.lastMenu, null);
  assert.deepEqual(win.options.webPreferences, {
    sandbox: true,
    contextIsolation: true,
    nodeIntegration: false,
    nodeIntegrationInSubFrames: false,
  });
  assert.equal(win.loadedUrl, 'https://tasks.example/#/tag/TODAY/tasks');
  assert.equal(win.userAgent.includes('Electron'), false);
});

test('Ctrl+Shift+F grows the window to full size and back, remembering bounds', () => {
  const { electron, windows } = createFakeElectron();
  const { fsImpl, files } = createMemoryFs();
  const statePath = '/state/today-window.json';
  const handle = createDesktopWindow(electron, APP_URL, { statePath, fsImpl });
  const win = windows[0];

  // user drags the compact pane to a corner
  win.bounds = { width: 360, height: 600, x: 1500, y: 40 };
  let prevented = false;
  win.listeners['before-input-event'](
    {
      preventDefault: () => {
        prevented = true;
      },
    },
    { type: 'keyDown', key: 'F', control: true, shift: true },
  );

  assert.equal(prevented, true);
  assert.equal(handle.getState().mode, FULL);
  assert.equal(win.bounds.width, FULL_BOUNDS.width);
  assert.equal(win.bounds.height, FULL_BOUNDS.height);
  assert.equal(win.centered, true);
  assert.deepEqual(handle.getState().bounds[COMPACT], {
    width: 360,
    height: 600,
    x: 1500,
    y: 40,
  });

  const saved = JSON.parse(files[statePath]);
  assert.equal(saved.mode, FULL);

  // back to compact restores the dragged position
  handle.toggleMode();
  assert.equal(handle.getState().mode, COMPACT);
  assert.deepEqual(win.bounds, { width: 360, height: 600, x: 1500, y: 40 });
});

test('toggle from a maximized window unmaximizes first', () => {
  const { electron, windows } = createFakeElectron();
  const handle = createDesktopWindow(electron, APP_URL);
  const win = windows[0];
  win.maximized = true;
  handle.toggleMode();
  assert.equal(win.maximized, false);
  assert.equal(handle.getState().mode, FULL);
});

test('reopens in the last saved mode and bounds', () => {
  const statePath = '/state/today-window.json';
  const { fsImpl } = createMemoryFs({
    [statePath]: JSON.stringify({
      mode: 'full',
      bounds: { full: { width: 1280, height: 800, x: 20, y: 30 } },
    }),
  });
  const { electron, windows } = createFakeElectron();
  createDesktopWindow(electron, APP_URL, { statePath, fsImpl });
  const win = windows[0];
  assert.equal(win.options.width, 1280);
  assert.equal(win.options.height, 800);
  assert.equal(win.options.x, 20);
  assert.equal(win.options.y, 30);
});

test('plain Shift+F is left to the web app search', () => {
  const { electron, windows } = createFakeElectron();
  const handle = createDesktopWindow(electron, APP_URL);
  let prevented = false;
  windows[0].listeners['before-input-event'](
    {
      preventDefault: () => {
        prevented = true;
      },
    },
    { type: 'keyDown', key: 'F', shift: true },
  );
  assert.equal(prevented, false);
  assert.equal(handle.getState().mode, COMPACT);
});

test('createStateStore: missing path is a no-op store', () => {
  const store = createStateStore(undefined);
  assert.equal(store.load().mode, COMPACT);
  assert.doesNotThrow(() => store.save(store.load()));
});

test('createDesktopWindow: foreign links open in the system browser', () => {
  const { electron, windows, openExternalCalls } = createFakeElectron();
  createDesktopWindow(electron, APP_URL);
  const win = windows[0];

  const popup = win.windowOpenHandler({ url: 'https://other.example/docs' });
  assert.deepEqual(popup, { action: 'deny' });
  assert.deepEqual(openExternalCalls, ['https://other.example/docs']);

  const same = win.windowOpenHandler({ url: 'https://tasks.example/#/config' });
  assert.deepEqual(same, { action: 'allow' });

  let prevented = false;
  win.listeners['will-navigate'](
    {
      preventDefault: () => {
        prevented = true;
      },
    },
    'https://other.example/out',
  );
  assert.equal(prevented, true);
  assert.equal(openExternalCalls[1], 'https://other.example/out');
});

test('handleExternalNavigation: javascript URLs are blocked, not opened', () => {
  const opened = [];
  const shell = { openExternal: (url) => opened.push(url) };
  let prevented = false;
  const action = handleExternalNavigation(
    {
      preventDefault: () => {
        prevented = true;
      },
    },
    shell,
    APP_URL,
    'javascript:alert(1)',
  );
  assert.equal(action, 'deny');
  assert.equal(prevented, true);
  assert.deepEqual(opened, []);
});
