'use strict';

const { app, BrowserWindow, Menu, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { resolveWebUrl, toTodayTasksUrl, isSameOrigin } = require('./today-url.cjs');

const APP_NAME = '今日待办';
const WINDOW_WIDTH = 420;
const WINDOW_HEIGHT = 780;
const WEB_URL_FILE = path.join(__dirname, 'web-url.txt');
const SETUP_PAGE = path.join(__dirname, 'setup.html');

const readConfiguredUrl = () => {
  let fileContents = '';
  try {
    fileContents = fs.readFileSync(WEB_URL_FILE, 'utf8');
  } catch {
    fileContents = '';
  }
  return resolveWebUrl({
    envUrl: process.env.SP_WEB_URL,
    fileContents,
  });
};

const createWindow = () => {
  const win = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    minWidth: 360,
    minHeight: 520,
    title: APP_NAME,
    autoHideMenuBar: true,
    backgroundColor: '#f7f4ef',
    show: false,
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });

  const configured = readConfiguredUrl();
  const todayUrl = toTodayTasksUrl(configured);

  win.once('ready-to-show', () => {
    win.show();
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, url) => {
    if (!todayUrl) {
      return;
    }
    if (!isSameOrigin(url, todayUrl)) {
      event.preventDefault();
      void shell.openExternal(url);
    }
  });

  if (!todayUrl) {
    void win.loadFile(SETUP_PAGE);
    return win;
  }

  void win.loadURL(todayUrl);
  return win;
};

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const [win] = BrowserWindow.getAllWindows();
    if (!win) {
      return;
    }
    if (win.isMinimized()) {
      win.restore();
    }
    win.focus();
  });

  app.setName(APP_NAME);

  if (process.platform === 'linux') {
    app.commandLine.appendSwitch('gtk-version', '3');
  }

  void app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
