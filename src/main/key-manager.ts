import { safeStorage, dialog } from 'electron'
import * as fs from 'fs'
import { addKey, getKeys, deleteKey, StoredKey } from './store'

export function encryptSecret(plaintext: string): string {
  if (safeStorage.isEncryptionAvailable()) {
    return safeStorage.encryptString(plaintext).toString('base64')
  }
  // Fallback: store as-is (not ideal, but works when keychain unavailable e.g. CI)
  return Buffer.from(plaintext).toString('base64')
}

export function decryptSecret(encrypted: string): string {
  if (safeStorage.isEncryptionAvailable()) {
    try {
      return safeStorage.decryptString(Buffer.from(encrypted, 'base64'))
    } catch {
      // Might be base64-only fallback
      return Buffer.from(encrypted, 'base64').toString('utf8')
    }
  }
  return Buffer.from(encrypted, 'base64').toString('utf8')
}

export async function importKeyFromFile(): Promise<StoredKey> {
  const result = await dialog.showOpenDialog({
    title: 'Select SSH Private Key',
    properties: ['openFile'],
    filters: [
      { name: 'SSH Keys', extensions: ['pem', 'key', 'ppk', '*'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  if (result.canceled || !result.filePaths.length) throw new Error('Cancelled')

  const filePath = result.filePaths[0]
  const keyName = filePath.split('/').pop() || 'Imported Key'
  const rawKey = fs.readFileSync(filePath, 'utf8')

  if (!rawKey.includes('PRIVATE KEY')) {
    throw new Error('File does not appear to be a valid SSH private key')
  }

  const encrypted = encryptSecret(rawKey)
  return addKey(keyName, encrypted)
}

export function importKeyFromText(name: string, rawKey: string): StoredKey {
  if (!rawKey.includes('PRIVATE KEY')) {
    throw new Error('Text does not appear to be a valid SSH private key')
  }
  const encrypted = encryptSecret(rawKey)
  return addKey(name, encrypted)
}

export function listKeys(): StoredKey[] {
  return getKeys()
}

export function removeKey(id: string): void {
  deleteKey(id)
}

export function getDecryptedKey(id: string): string {
  const keys = getKeys()
  const key = keys.find(k => k.id === id)
  if (!key) throw new Error('Key not found: ' + id)
  return decryptSecret(key.privateKey)
}
