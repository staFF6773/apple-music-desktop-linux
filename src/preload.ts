import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppName: () => ipcRenderer.invoke('get-app-name'),
  
  // Cookie management methods
  getCookies: (url: string) => ipcRenderer.invoke('get-cookies', url),
  setCookie: (cookieDetails: Electron.CookiesSetDetails) => ipcRenderer.invoke('set-cookie', cookieDetails),
  removeCookie: (url: string, name: string) => ipcRenderer.invoke('remove-cookie', url, name),
  clearAllCookies: () => ipcRenderer.invoke('clear-all-cookies'),
  getAllCookies: () => ipcRenderer.invoke('get-all-cookies'),
  
  // Menu event listeners
  onCookiesCleared: (callback: () => void) => ipcRenderer.on('cookies-cleared', callback),
  onReloadRequested: (callback: () => void) => ipcRenderer.on('reload-requested', callback),
  
  // Add more API methods as needed
});

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<string>;
      getAppName: () => Promise<string>;
      
      // Cookie management types
      getCookies: (url: string) => Promise<Electron.Cookie[]>;
      setCookie: (cookieDetails: Electron.CookiesSetDetails) => Promise<boolean>;
      removeCookie: (url: string, name: string) => Promise<boolean>;
      clearAllCookies: () => Promise<boolean>;
      getAllCookies: () => Promise<Electron.Cookie[]>;
      
      // Menu event listeners
      onCookiesCleared: (callback: () => void) => void;
      onReloadRequested: (callback: () => void) => void;
    };
  }
}
