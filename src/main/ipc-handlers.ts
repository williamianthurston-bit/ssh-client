import { ipcMain, BrowserWindow } from 'electron'
import {
  getGroups, addGroup, updateGroup, deleteGroup,
  getHosts, addHost, updateHost, deleteHost, touchHost,
  getSettings, updateSettings,
  StoredHost, HostGroup
} from './store'
import {
  connectSSH, writeSSH, resizeSSH, disconnectSSH, getActiveClient, isConnected,
  ConnectOptions
} from './ssh-manager'
import {
  openSFTP, closeSFTP, readdir, downloadFile, uploadFile,
  mkdir, deleteRemote, rename
} from './sftp-manager'
import {
  importKeyFromFile, importKeyFromText, listKeys, removeKey, getDecryptedKey,
  encryptSecret, decryptSecret
} from './key-manager'

export function registerIpcHandlers(win: BrowserWindow): void {

  // ─── Groups ───────────────────────────────────────────────
  ipcMain.handle('groups:get', () => getGroups())
  ipcMain.handle('groups:add', (_, name: string, color?: string) => addGroup(name, color))
  ipcMain.handle('groups:update', (_, id: string, patch: Partial<HostGroup>) => { updateGroup(id, patch) })
  ipcMain.handle('groups:delete', (_, id: string) => { deleteGroup(id) })

  // ─── Hosts ────────────────────────────────────────────────
  ipcMain.handle('hosts:get', () => {
    const hosts = getHosts()
    // Decrypt passwords before sending to renderer
    return hosts.map(h => ({
      ...h,
      password: h.password ? decryptSecret(h.password) : undefined
    }))
  })

  ipcMain.handle('hosts:add', (_, hostData: Omit<StoredHost, 'id' | 'createdAt'>) => {
    const toStore = {
      ...hostData,
      password: hostData.password ? encryptSecret(hostData.password) : undefined
    }
    const added = addHost(toStore)
    return { ...added, password: hostData.password }
  })

  ipcMain.handle('hosts:update', (_, id: string, patch: Partial<StoredHost>) => {
    const toStore = {
      ...patch,
      password: patch.password ? encryptSecret(patch.password) : patch.password
    }
    updateHost(id, toStore)
  })

  ipcMain.handle('hosts:delete', (_, id: string) => { deleteHost(id) })

  // ─── SSH ──────────────────────────────────────────────────
  ipcMain.handle('ssh:connect', async (_, opts: ConnectOptions) => {
    // If key auth, decrypt and inject the private key
    if (opts.authType === 'key' && opts.keyId) {
      opts.privateKey = getDecryptedKey(opts.keyId)
    }
    touchHost(opts.tabId.split(':')[0]) // tabId format: hostId:uuid
    await connectSSH(opts, win)
  })

  ipcMain.handle('ssh:write', (_, tabId: string, data: string) => {
    writeSSH(tabId, data)
  })

  ipcMain.handle('ssh:resize', (_, tabId: string, rows: number, cols: number) => {
    resizeSSH(tabId, rows, cols)
  })

  ipcMain.handle('ssh:disconnect', (_, tabId: string) => {
    disconnectSSH(tabId)
  })

  ipcMain.handle('ssh:is-connected', (_, tabId: string) => isConnected(tabId))

  // ─── SFTP ─────────────────────────────────────────────────
  ipcMain.handle('sftp:open', async (_, tabId: string) => {
    const client = getActiveClient(tabId)
    if (!client) throw new Error('No SSH session for tab ' + tabId)
    await openSFTP(client, tabId)
  })

  ipcMain.handle('sftp:close', (_, tabId: string) => { closeSFTP(tabId) })

  ipcMain.handle('sftp:readdir', async (_, tabId: string, remotePath: string) => {
    return readdir(tabId, remotePath)
  })

  ipcMain.handle('sftp:download', async (_, tabId: string, remotePath: string) => {
    return downloadFile(tabId, remotePath)
  })

  ipcMain.handle('sftp:upload', async (_, tabId: string, remotePath: string) => {
    return uploadFile(tabId, remotePath)
  })

  ipcMain.handle('sftp:mkdir', async (_, tabId: string, remotePath: string) => {
    await mkdir(tabId, remotePath)
  })

  ipcMain.handle('sftp:delete', async (_, tabId: string, remotePath: string, isDir: boolean) => {
    await deleteRemote(tabId, remotePath, isDir)
  })

  ipcMain.handle('sftp:rename', async (_, tabId: string, oldPath: string, newPath: string) => {
    await rename(tabId, oldPath, newPath)
  })

  // ─── Keys ─────────────────────────────────────────────────
  ipcMain.handle('keys:list', () => listKeys().map(k => ({ id: k.id, name: k.name, publicKey: k.publicKey, createdAt: k.createdAt })))
  ipcMain.handle('keys:import-file', () => importKeyFromFile())
  ipcMain.handle('keys:import-text', (_, name: string, rawKey: string) => importKeyFromText(name, rawKey))
  ipcMain.handle('keys:delete', (_, id: string) => { removeKey(id) })

  // ─── Settings ─────────────────────────────────────────────
  ipcMain.handle('settings:get', () => getSettings())
  ipcMain.handle('settings:update', (_, patch: object) => { updateSettings(patch as any) })
}
