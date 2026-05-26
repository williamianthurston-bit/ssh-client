import { Client, SFTPWrapper } from 'ssh2'
import { dialog } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

const sftpSessions = new Map<string, SFTPWrapper>()

export function openSFTP(client: Client, tabId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (sftpSessions.has(tabId)) {
      resolve()
      return
    }
    client.sftp((err, sftp) => {
      if (err) return reject(err)
      sftpSessions.set(tabId, sftp)
      sftp.on('end', () => sftpSessions.delete(tabId))
      resolve()
    })
  })
}

export function closeSFTP(tabId: string): void {
  const sftp = sftpSessions.get(tabId)
  if (sftp) {
    sftp.end()
    sftpSessions.delete(tabId)
  }
}

export interface FileEntry {
  filename: string
  longname: string
  attrs: {
    size: number
    mtime: number
    isDirectory: boolean
    isSymbolicLink: boolean
    mode: number
    permissions: string
  }
}

export function readdir(tabId: string, remotePath: string): Promise<FileEntry[]> {
  return new Promise((resolve, reject) => {
    const sftp = sftpSessions.get(tabId)
    if (!sftp) return reject(new Error('No SFTP session for tab ' + tabId))

    sftp.readdir(remotePath, (err, list) => {
      if (err) return reject(err)
      const entries: FileEntry[] = list.map(item => ({
        filename: item.filename,
        longname: item.longname,
        attrs: {
          size: item.attrs.size || 0,
          mtime: (item.attrs as any).mtime || 0,
          isDirectory: item.attrs.isDirectory?.() ?? false,
          isSymbolicLink: item.attrs.isSymbolicLink?.() ?? false,
          mode: (item.attrs as any).mode || 0,
          permissions: item.longname.substring(0, 10)
        }
      }))
      // Sort: dirs first, then files
      entries.sort((a, b) => {
        if (a.attrs.isDirectory && !b.attrs.isDirectory) return -1
        if (!a.attrs.isDirectory && b.attrs.isDirectory) return 1
        return a.filename.localeCompare(b.filename)
      })
      resolve(entries)
    })
  })
}

export function stat(tabId: string, remotePath: string): Promise<{ isDirectory: boolean; size: number }> {
  return new Promise((resolve, reject) => {
    const sftp = sftpSessions.get(tabId)
    if (!sftp) return reject(new Error('No SFTP session'))
    sftp.stat(remotePath, (err, attrs) => {
      if (err) return reject(err)
      resolve({ isDirectory: attrs.isDirectory?.() ?? false, size: attrs.size || 0 })
    })
  })
}

export async function downloadFile(tabId: string, remotePath: string): Promise<string> {
  const sftp = sftpSessions.get(tabId)
  if (!sftp) throw new Error('No SFTP session for tab ' + tabId)

  const filename = path.basename(remotePath)
  const result = await dialog.showSaveDialog({
    defaultPath: path.join(os.homedir(), 'Downloads', filename),
    buttonLabel: 'Download'
  })
  if (result.canceled || !result.filePath) throw new Error('Cancelled')

  return new Promise((resolve, reject) => {
    sftp.fastGet(remotePath, result.filePath!, {}, (err) => {
      if (err) return reject(err)
      resolve(result.filePath!)
    })
  })
}

export async function uploadFile(tabId: string, remotePath: string): Promise<string> {
  const sftp = sftpSessions.get(tabId)
  if (!sftp) throw new Error('No SFTP session for tab ' + tabId)

  const result = await dialog.showOpenDialog({ properties: ['openFile'] })
  if (result.canceled || !result.filePaths.length) throw new Error('Cancelled')

  const localPath = result.filePaths[0]
  const filename = path.basename(localPath)
  const dest = remotePath.endsWith('/') ? remotePath + filename : remotePath + '/' + filename

  return new Promise((resolve, reject) => {
    sftp.fastPut(localPath, dest, {}, (err) => {
      if (err) return reject(err)
      resolve(dest)
    })
  })
}

export function mkdir(tabId: string, remotePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const sftp = sftpSessions.get(tabId)
    if (!sftp) return reject(new Error('No SFTP session'))
    sftp.mkdir(remotePath, (err) => (err ? reject(err) : resolve()))
  })
}

export function deleteRemote(tabId: string, remotePath: string, isDir: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    const sftp = sftpSessions.get(tabId)
    if (!sftp) return reject(new Error('No SFTP session'))
    if (isDir) {
      sftp.rmdir(remotePath, (err) => (err ? reject(err) : resolve()))
    } else {
      sftp.unlink(remotePath, (err) => (err ? reject(err) : resolve()))
    }
  })
}

export function rename(tabId: string, oldPath: string, newPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const sftp = sftpSessions.get(tabId)
    if (!sftp) return reject(new Error('No SFTP session'))
    sftp.rename(oldPath, newPath, (err) => (err ? reject(err) : resolve()))
  })
}
