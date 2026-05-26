import { create } from 'zustand'

/* ── Types ─────────────────────────────────────────────────── */

export interface HostGroup {
  id: string
  name: string
  color: string
  expanded: boolean
}

export interface StoredHost {
  id: string
  groupId: string | null
  label: string
  host: string
  port: number
  username: string
  authType: 'password' | 'key' | 'agent'
  password?: string
  keyId?: string
  tags?: string[]
  lastConnected?: number
  createdAt: number
}

export interface StoredKey {
  id: string
  name: string
  publicKey?: string
  createdAt: number
}

export interface Snippet {
  id: string
  name: string
  command: string
  description?: string
  createdAt: number
}

export interface KnownHost {
  ip: string
  fingerprint: string
  addedAt: number
}

export interface ConnectionLog {
  id: string
  date: number           // timestamp
  duration: number       // seconds
  userEmail: string
  userIp: string
  deviceName: string
  hostId: string
  hostLabel: string
  hostUsername: string
  bookmarked: boolean
}

export type SessionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface Session {
  tabId: string
  hostId: string
  label: string
  host: string
  username: string
  status: SessionStatus
  errorMsg?: string
  showSFTP: boolean
  sftpPath: string
  theme: string
}

export interface Account {
  email: string
  token: string
  synced: boolean
  lastSync?: number
}

export type NavView = 'hosts' | 'keychain' | 'portfwd' | 'snippets' | 'knownhosts' | 'logs' | 'terminal'

export type TerminalTheme =
  | 'default' | 'termius-light'
  | 'dracula' | 'nord' | 'monokai'
  | 'ayu-dark' | 'ayu-light'
  | 'kanagawa-wave' | 'kanagawa-dragon' | 'kanagawa-lotus'
  | 'hacker-blue' | 'hacker-green' | 'hacker-red'
  | 'everforest-dark' | 'night-owl' | 'light-owl'

export interface AppSettings {
  fontSize: number
  fontFamily: string
  cursorStyle: 'block' | 'underline' | 'bar'
  terminalTheme: TerminalTheme
  apiUrl: string
}

/* ── Store ─────────────────────────────────────────────────── */

interface AppState {
  /* Auth */
  account: Account | null
  authChecked: boolean

  /* Navigation */
  currentView: NavView
  selectedHostId: string | null
  newHostPanelOpen: boolean
  themesPanelOpen: boolean

  /* Vault data */
  groups: HostGroup[]
  hosts: StoredHost[]
  keys: StoredKey[]
  snippets: Snippet[]
  knownHosts: KnownHost[]
  connectionLogs: ConnectionLog[]

  /* Sessions */
  sessions: Session[]
  activeTabId: string | null

  /* Settings */
  settings: AppSettings

  /* Command palette */
  paletteOpen: boolean
  paletteQuery: string

  /* Modals */
  showAddHost: boolean
  editHostId: string | null
  showAddGroup: boolean
  editGroupId: string | null
  showKeyManager: boolean
  showSnippets: boolean
  showSettings: boolean
  showQuickConnect: boolean

  /* Actions — auth */
  setAccount: (account: Account | null) => void
  setAuthChecked: (v: boolean) => void

  /* Actions — navigation */
  setCurrentView: (view: NavView) => void
  setSelectedHostId: (id: string | null) => void
  setNewHostPanelOpen: (v: boolean) => void
  setThemesPanelOpen: (v: boolean) => void

  /* Actions — vault */
  setGroups: (g: HostGroup[]) => void
  setHosts: (h: StoredHost[]) => void
  setKeys: (k: StoredKey[]) => void
  setSnippets: (s: Snippet[]) => void
  setKnownHosts: (kh: KnownHost[]) => void
  setConnectionLogs: (logs: ConnectionLog[]) => void

  /* Actions — sessions */
  openSession: (host: StoredHost) => string
  closeSession: (tabId: string) => void
  setSessionStatus: (tabId: string, status: SessionStatus, errorMsg?: string) => void
  setActiveTab: (tabId: string) => void
  toggleSFTP: (tabId: string) => void
  setSFTPPath: (tabId: string, path: string) => void
  setSessionTheme: (tabId: string, theme: string) => void

  /* Actions — palette */
  openPalette: () => void
  closePalette: () => void
  setPaletteQuery: (q: string) => void

  /* Actions — modals */
  openAddHost: (groupId?: string) => void
  openEditHost: (hostId: string) => void
  closeHostModal: () => void
  openAddGroup: () => void
  openEditGroup: (groupId: string) => void
  closeGroupModal: () => void
  setShowKeyManager: (v: boolean) => void
  setShowSnippets: (v: boolean) => void
  setShowSettings: (v: boolean) => void
  setShowQuickConnect: (v: boolean) => void

  /* Actions — settings */
  updateSettings: (patch: Partial<AppSettings>) => void
}

let tabCounter = 0

const defaultSettings: AppSettings = {
  fontSize: 13,
  fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
  cursorStyle: 'bar',
  terminalTheme: 'default',
  apiUrl: 'https://api.ssh-client.nueramind.com'
}

export const useAppStore = create<AppState>((set, get) => ({
  account: null,
  authChecked: false,
  currentView: 'hosts',
  selectedHostId: null,
  newHostPanelOpen: false,
  themesPanelOpen: false,
  groups: [],
  hosts: [],
  keys: [],
  snippets: [],
  knownHosts: [],
  connectionLogs: [],
  sessions: [],
  activeTabId: null,
  settings: defaultSettings,
  paletteOpen: false,
  paletteQuery: '',
  showAddHost: false,
  editHostId: null,
  showAddGroup: false,
  editGroupId: null,
  showKeyManager: false,
  showSnippets: false,
  showSettings: false,
  showQuickConnect: false,

  setAccount: (account) => set({ account }),
  setAuthChecked: (authChecked) => set({ authChecked }),

  setCurrentView: (currentView) => set({ currentView }),
  setSelectedHostId: (selectedHostId) => set({ selectedHostId }),
  setNewHostPanelOpen: (newHostPanelOpen) => set({ newHostPanelOpen }),
  setThemesPanelOpen: (themesPanelOpen) => set({ themesPanelOpen }),

  setGroups: (groups) => set({ groups }),
  setHosts: (hosts) => set({ hosts }),
  setKeys: (keys) => set({ keys }),
  setSnippets: (snippets) => set({ snippets }),
  setKnownHosts: (knownHosts) => set({ knownHosts }),
  setConnectionLogs: (connectionLogs) => set({ connectionLogs }),

  openSession: (host) => {
    tabCounter++
    const tabId = `${host.id}:${tabCounter}`
    set(state => ({
      sessions: [...state.sessions, {
        tabId, hostId: host.id,
        label: host.label,
        host: host.host,
        username: host.username,
        status: 'connecting',
        showSFTP: false,
        sftpPath: '/',
        theme: get().settings.terminalTheme
      }],
      activeTabId: tabId,
      currentView: 'terminal',
    }))
    return tabId
  },

  closeSession: (tabId) => set(state => {
    const sessions = state.sessions.filter(s => s.tabId !== tabId)
    const wasActive = state.activeTabId === tabId
    const newActiveTabId = wasActive
      ? (sessions.length > 0 ? sessions[sessions.length - 1].tabId : null)
      : state.activeTabId
    return {
      sessions,
      activeTabId: newActiveTabId,
      currentView: sessions.length === 0 ? 'hosts' : state.currentView,
    }
  }),

  setSessionStatus: (tabId, status, errorMsg) => set(state => ({
    sessions: state.sessions.map(s => s.tabId === tabId ? { ...s, status, errorMsg } : s)
  })),

  setActiveTab: (tabId) => set({ activeTabId: tabId, currentView: 'terminal' }),

  toggleSFTP: (tabId) => set(state => ({
    sessions: state.sessions.map(s => s.tabId === tabId ? { ...s, showSFTP: !s.showSFTP } : s)
  })),

  setSFTPPath: (tabId, path) => set(state => ({
    sessions: state.sessions.map(s => s.tabId === tabId ? { ...s, sftpPath: path } : s)
  })),

  setSessionTheme: (tabId, theme) => set(state => ({
    sessions: state.sessions.map(s => s.tabId === tabId ? { ...s, theme } : s)
  })),

  openPalette: () => set({ paletteOpen: true, paletteQuery: '' }),
  closePalette: () => set({ paletteOpen: false, paletteQuery: '' }),
  setPaletteQuery: (paletteQuery) => set({ paletteQuery }),

  openAddHost: (groupId) => set({ showAddHost: true, editHostId: groupId ? `new:${groupId}` : 'new' }),
  openEditHost: (hostId) => set({ showAddHost: true, editHostId: hostId }),
  closeHostModal: () => set({ showAddHost: false, editHostId: null }),
  openAddGroup: () => set({ showAddGroup: true, editGroupId: null }),
  openEditGroup: (editGroupId) => set({ showAddGroup: true, editGroupId }),
  closeGroupModal: () => set({ showAddGroup: false, editGroupId: null }),
  setShowKeyManager: (showKeyManager) => set({ showKeyManager }),
  setShowSnippets: (showSnippets) => set({ showSnippets }),
  setShowSettings: (showSettings) => set({ showSettings }),
  setShowQuickConnect: (showQuickConnect) => set({ showQuickConnect }),

  updateSettings: (patch) => set(state => ({ settings: { ...state.settings, ...patch } }))
}))
