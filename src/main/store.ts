import Store from 'electron-store'
import { randomUUID } from 'crypto'

export interface HostGroup {
  id: string
  name: string
  color: string
  expanded: boolean
}

export interface StoredKey {
  id: string
  name: string
  privateKey: string // safeStorage encrypted (base64)
  publicKey?: string
  createdAt: number
}

export interface StoredHost {
  id: string
  groupId: string | null
  label: string
  host: string
  port: number
  username: string
  authType: 'password' | 'key' | 'agent'
  password?: string // safeStorage encrypted (base64)
  keyId?: string
  lastConnected?: number
  createdAt: number
}

interface StoreSchema {
  groups: HostGroup[]
  hosts: StoredHost[]
  keys: StoredKey[]
  settings: {
    fontSize: number
    fontFamily: string
    cursorStyle: 'block' | 'underline' | 'bar'
    theme: 'dark'
  }
}

const defaults: StoreSchema = {
  groups: [],
  hosts: [],
  keys: [],
  settings: {
    fontSize: 14,
    fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
    cursorStyle: 'bar',
    theme: 'dark'
  }
}

export const store = new Store<StoreSchema>({ defaults })

// ---------- Group CRUD ----------

export function getGroups(): HostGroup[] {
  return store.get('groups')
}

export function addGroup(name: string, color = '#6E3FC5'): HostGroup {
  const group: HostGroup = { id: randomUUID(), name, color, expanded: true }
  store.set('groups', [...store.get('groups'), group])
  return group
}

export function updateGroup(id: string, patch: Partial<Pick<HostGroup, 'name' | 'color' | 'expanded'>>): void {
  store.set('groups', store.get('groups').map(g => g.id === id ? { ...g, ...patch } : g))
}

export function deleteGroup(id: string): void {
  store.set('groups', store.get('groups').filter(g => g.id !== id))
  // Orphan hosts (move to ungrouped)
  store.set('hosts', store.get('hosts').map(h => h.groupId === id ? { ...h, groupId: null } : h))
}

// ---------- Host CRUD ----------

export function getHosts(): StoredHost[] {
  return store.get('hosts')
}

export function addHost(host: Omit<StoredHost, 'id' | 'createdAt'>): StoredHost {
  const newHost: StoredHost = { ...host, id: randomUUID(), createdAt: Date.now() }
  store.set('hosts', [...store.get('hosts'), newHost])
  return newHost
}

export function updateHost(id: string, patch: Partial<Omit<StoredHost, 'id' | 'createdAt'>>): void {
  store.set('hosts', store.get('hosts').map(h => h.id === id ? { ...h, ...patch } : h))
}

export function deleteHost(id: string): void {
  store.set('hosts', store.get('hosts').filter(h => h.id !== id))
}

export function touchHost(id: string): void {
  store.set('hosts', store.get('hosts').map(h => h.id === id ? { ...h, lastConnected: Date.now() } : h))
}

// ---------- Key CRUD ----------

export function getKeys(): StoredKey[] {
  return store.get('keys')
}

export function addKey(name: string, privateKey: string, publicKey?: string): StoredKey {
  const key: StoredKey = { id: randomUUID(), name, privateKey, publicKey, createdAt: Date.now() }
  store.set('keys', [...store.get('keys'), key])
  return key
}

export function deleteKey(id: string): void {
  store.set('keys', store.get('keys').filter(k => k.id !== id))
}

// ---------- Settings ----------

export function getSettings() {
  return store.get('settings')
}

export function updateSettings(patch: Partial<StoreSchema['settings']>): void {
  store.set('settings', { ...store.get('settings'), ...patch })
}
