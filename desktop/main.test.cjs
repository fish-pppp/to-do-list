'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createDesktopWindow,
  handleExternalNavigation,
} = require('./main.cjs');
const { WINDOW_WIDTH, WINDOW_HEIGHT } = require('./read-web-url.cjs');

const APP_URL = 'https://tasks.example/';

const createFakeElectron = () => {
  const openExternalCalls = [];
  const windows = [];

  class FakeBrowserWindow {
    constructor(options) {
      this.options = options;
      this.menuBarVisible = true;
      this.loadedUrl = '';
      this.windowOpenHandler = null;
      this.listeners = {};
      this.userAgent =
        'Mozilla/5.0 Chrome/144.0.7559.60 Electron/43.5.0 Safari/537.36';
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

    setMenuBarVisibility(visible) {
      this.menuBarVisible = visible;
    }

    loadURL(url) {
      this.loadedUrl = url;
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

test('createDesktopWindow: sidebar size, no menu, sandboxed, loads Today', () => {
  const { electron, windows } = createFakeElectron();
  createDesktopWindow(electron, APP_URL);

  assert.equal(windows.length, 1);
  const win = windows[0];
  assert.equal(win.options.width, WINDOW_WIDTH);
  assert.equal(win.options.height, WINDOW_HEIGHT);
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
