import { app, BrowserWindow, Menu, shell, ipcMain, dialog, session } from 'electron';
import * as path from 'path';

// Enable webview support
app.commandLine.appendSwitch('enable-features', 'WebContentsForceDark');

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development';

function createWindow(): void {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
          webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
        webviewTag: true, // Enable webview tag
        preload: path.join(__dirname, 'preload.js')
      },
    icon: path.join(__dirname, '../assets/icon.png'), // You can add an icon later
    titleBarStyle: 'default',
    show: false
  });

  // Load the index.html file
  mainWindow.loadFile(path.join(__dirname, '../src/index.html'));

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Create application menu
  createMenu();
}

function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload', label: 'Reload' },
        { role: 'forceReload', label: 'Force Reload' },
        { role: 'toggleDevTools', label: 'Toggle Developer Tools' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Actual Size' },
        { role: 'zoomIn', label: 'Zoom In' },
        { role: 'zoomOut', label: 'Zoom Out' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Toggle Full Screen' }
      ]
    },
    {
      label: 'Cookies',
      submenu: [
        {
          label: 'Clear All Cookies',
          accelerator: 'Ctrl+Shift+Delete',
          click: async () => {
            try {
              await session.defaultSession.clearStorageData({
                storages: ['cookies']
              });
              // Reload the webview to reflect changes
              if (mainWindow) {
                mainWindow.webContents.send('cookies-cleared');
              }
            } catch (error) {
              console.error('Error clearing cookies:', error);
            }
          }
        },
        {
          label: 'Reload Page',
          accelerator: 'Ctrl+R',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('reload-requested');
            }
          }
        },
        {
          label: 'Open Cookies Location',
          click: () => {
            // Get the user data path where cookies are stored
            const userDataPath = app.getPath('userData');
            shell.openPath(userDataPath);
          }
        },
        { type: 'separator' },
        {
          label: 'Cookie Information',
          click: async () => {
            try {
              const cookies = await session.defaultSession.cookies.get({});
              const cookieCount = cookies.length;
              dialog.showMessageBox(mainWindow!, {
                type: 'info',
                title: 'Cookie Information',
                message: `Total Cookies: ${cookieCount}`,
                detail: `The application currently has ${cookieCount} cookies stored. Use "Clear All Cookies" to remove them all.`
              });
            } catch (error) {
              console.error('Error getting cookie info:', error);
            }
          }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize', label: 'Minimize' },
        { role: 'close', label: 'Close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Open Source',
          click: () => {
            require('electron').shell.openExternal('https://github.com/staFF6773/apple-music-desktop-linux');
          }
        },
        {
          label: 'Open Source License',
          click: () => {
            require('electron').shell.openExternal('https://github.com/staFF6773/apple-music-desktop-linux/blob/main/LICENSE');
          }
        }
      ]
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event: any, navigationUrl: string) => {
    if (navigationUrl.startsWith('http')) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });
});

// IPC handlers for communication between main and renderer processes
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-name', () => {
  return app.getName();
});

// Cookie management handlers
ipcMain.handle('get-cookies', async (event, url: string) => {
  try {
    const cookies = await session.defaultSession.cookies.get({ url });
    return cookies;
  } catch (error) {
    console.error('Error getting cookies:', error);
    throw error;
  }
});

ipcMain.handle('set-cookie', async (event, cookieDetails: Electron.CookiesSetDetails) => {
  try {
    await session.defaultSession.cookies.set(cookieDetails);
    return true;
  } catch (error) {
    console.error('Error setting cookie:', error);
    throw error;
  }
});

ipcMain.handle('remove-cookie', async (event, url: string, name: string) => {
  try {
    await session.defaultSession.cookies.remove(url, name);
    return true;
  } catch (error) {
    console.error('Error removing cookie:', error);
    throw error;
  }
});

ipcMain.handle('clear-all-cookies', async (event) => {
  try {
    await session.defaultSession.clearStorageData({
      storages: ['cookies']
    });
    return true;
  } catch (error) {
    console.error('Error clearing cookies:', error);
    throw error;
  }
});

ipcMain.handle('get-all-cookies', async (event) => {
  try {
    const cookies = await session.defaultSession.cookies.get({});
    return cookies;
  } catch (error) {
    console.error('Error getting all cookies:', error);
    throw error;
  }
});
