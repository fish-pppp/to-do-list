'use strict';

const {
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
  readWebUrl,
  isSameAppOrigin,
  shouldOpenExternally,
} = require('./read-web-url.cjs');

const APP_NAME = 'Super Productivity';

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
 * Tiny BrowserWindow that just loads the production web app.
 * Electron is injected so this file can be unit-tested without the package.
 *
 * @param {typeof import('electron')} electron
 * @param {string} appUrl
 */
const createDesktopWindow = (electron, appUrl) => {
  const { BrowserWindow, Menu, shell } = electron;
  Menu.setApplicationMenu(null);

  const win = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    minWidth: 360,
    minHeight: 560,
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

  win.webContents.setWindowOpenHandler(({ url }) => {
    const action = handleExternalNavigation(undefined, shell, appUrl, url);
    return { action };
  });

  win.webContents.on('will-navigate', (event, url) => {
    handleExternalNavigation(event, shell, appUrl, url);
  });

  void win.loadURL(appUrl);
  return win;
};

/**
 * @param {typeof import('electron')} electron
 * @param {string} [appUrl]
 */
const startDesktopApp = (electron, appUrl = readWebUrl()) => {
  const { app, BrowserWindow } = electron;

  if (process.platform === 'linux') {
    app.commandLine.appendSwitch('gtk-version', '3');
  }

  app.setName(APP_NAME);

  const open = () => {
    createDesktopWindow(electron, appUrl);
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

if (require.main === module) {
  let electron;
  try {
    electron = require('electron');
  } catch {
    console.error(
      'Electron is not installed. Use npm run desktop (Chrome/Edge --app=) instead.',
    );
    process.exit(1);
  }
  startDesktopApp(electron);
}

module.exports = {
  APP_NAME,
  createDesktopWindow,
  startDesktopApp,
  handleExternalNavigation,
};
