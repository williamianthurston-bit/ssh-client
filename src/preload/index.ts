import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  // ─── Groups ───────────────────────────────────────────────
  groups: {
    get: () => ipcRenderer.invoke('groups:get'),
    add: (name: string, color?: string) => ipcRenderer.invoke('groups:add', name, color),
    update: (id: string, patch: object) => ipcRenderer.invoke('groups:update', id, patch),
    delete: (id: string) => ipcRenderer.invoke('groups:delete', id)
  },

  // ─── Hosts ────────────────────────────────────────────────
  hosts: {
    get: () => ipcRenderer.invoke('hosts:get'),
    add: (host: object) => ipcRenderer.invoke('hosts:add', host),
    update: (id: string, patch: object) => ipcRenderer.invoke('hosts:update', id, patch),
    delete: (id: string) => ipcRenderer.invoke('hosts:delete', id)
  },

  // ─── SSH ──────────────────────────────────────────────────
  ssh: {
    connect: (opts: object) => ipcRenderer.invoke('ssh:connect', opts),
    write: (tabId: string, data: string) => ipcRenderer.invoke('ssh:write', tabId, data),
    resize: (tabId: string, rows: number, cols: number) => ipcRenderer.invoke('ssh:resize', tabId, rows, cols),
    disconnect: (tabId: string) => ipcRenderer.invoke('ssh:disconnect', tabId),
    isConnected: (tabId: string) => ipcRenderer.invoke('ssh:is-connected', tabId),
    // Event listeners (called from TerminalView)
    onData: (tabId: string, callback: (data: string) => void) => {
      const handler = (_: unknown, data: string) => callback(data)
      ipcRenderer.on(`ssh:data:${tabId}`, handler)
      return () => ipcRenderer.removeListener(`ssh:data:${tabId}`, handler)
    },
    onClosed: (tabId: string, callback: (msg: string) => void) => {
      const handler = (_: unknown, msg: string) => callback(msg)
      ipcRenderer.on(`ssh:closed:${tabId}`, handler)
      return () => ipcRenderer.removeListener(`ssh:closed:${tabId}`, handler)
    }
  },

  // ─── SFTP ─────────────────────────────────────────────────
  sftp: {
    open: (tabId: string) => ipcRenderer.invoke('sftp:open', tabId),
    close: (tabId: string) => ipcRenderer.invoke('sftp:close', tabId),
    readdir: (tabId: string, remotePath: string) => ipcRenderer.invoke('sftp:readdir', tabId, remotePath),
    download: (tabId: string, remotePath: string) => ipcRenderer.invoke('sftp:download', tabId, remotePath),
    upload: (tabId: string, remotePath: string) => ipcRenderer.invoke('sftp:upload', tabId, remotePath),
    mkdir: (tabId: string, remotePath: string) => ipcRenderer.invoke('sftp:mkdir', tabId, remotePath),
    delete: (tabId: string, remotePath: string, isDir: boolean) => ipcRenderer.invoke('sftp:delete', tabId, remotePath, isDir),
    rename: (tabId: string, oldPath: string, newPath: string) => ipcRenderer.invoke('sftp:rename', tabId, oldPath, newPath)
  },

  // ─── Keys ─────────────────────────────────────────────────
  keys: {
    list: () => ipcRenderer.invoke('keys:list'),
    importFile: () => ipcRenderer.invoke('keys:import-file'),
    importText: (name: string, rawKey: string) => ipcRenderer.invoke('keys:import-text', name, rawKey),
    delete: (id: string) => ipcRenderer.invoke('keys:delete', id)
  },

  // ─── Settings ─────────────────────────────────────────────
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    update: (patch: object) => ipcRenderer.invoke('settings:update', patch)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

export type API = typeof api
