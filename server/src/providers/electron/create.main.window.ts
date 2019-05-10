import { Display, BrowserWindow, globalShortcut } from 'electron';
import { Config } from '../../config/config';

async function setupWindow(
  screen: Display,
  url: string
): Promise<BrowserWindow> {
  const { x, y, width, height } = screen.workArea;
  const window = new BrowserWindow({
    alwaysOnTop: false,
    fullscreen: true,
    x,
    y,
    width,
    height,
    minWidth: width,
    minHeight: height,
    maxWidth: width,
    maxHeight: height,
    resizable: true,
    show: true,
    frame: false,
    acceptFirstMouse: true,
    enableLargerThanScreen: true,
    title: 'labeller',
    titleBarStyle: 'default',
    thickFrame: false,
    hasShadow: false,
    skipTaskbar: true,
    webPreferences: {
      offscreen: false
    }
  });
  window.setMenu(null);
  window.setMenuBarVisibility(false);
  window.loadURL(url);
  window.maximize();
  window.setResizable(false);
  console.log('Loading %j at %j', url, screen);

  globalShortcut.register('f5', () => {
    console.log('f5 is pressed');
    window.reload();
  });
  globalShortcut.register('CommandOrControl+R', () => {
    console.log('CommandOrControl+R is pressed');
    window.webContents.reloadIgnoringCache();
  });

  globalShortcut.register('f1', () => {
    if (window.webContents.isDevToolsOpened()) {
      window.webContents.closeDevTools();
    } else {
      window.webContents.openDevTools();
    }
  });
  return window;
}

export async function createMainWindow(): Promise<BrowserWindow | null> {
  const config = Config.instance;
  const { electronOptions } = config.getConfig();
  const screen = (await require('electron')).screen.getPrimaryDisplay();

  const window = await setupWindow(
    screen,
    `http://${electronOptions.HOST}:${electronOptions.PORT}`
  );

  return window;
}
