import { create } from 'zustand'

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
  lastConnected?: number
  createdAt: number
}

export interface StoredKey {
  id: string
  name: string
  publicKey?: string
  createdAt: number
}

export type SessionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface Session {
  tabId: string
  hostId: string
  label: string
  host: string
  status: SessionStatus
  errorMsg?: string
  showSFTP: boolean
  sftpPath: string
}

interface AppState {
  // Data
  groups: HostGroup[]
  hosts: StoredHost[]
  keys: StoredKey[]

  // UI state
  sessions: Session[]
  activeTabId: string | null

  // Modals
  showAddHost: boolean
  editHostId: string | null
  showAddGroup: boolean
  editGroupId: string | null
  showKeyManager: boolean
  showQuickConnect: boolean

  // Actions — data
  setGroups: (groups: HostGroup[]) => void
  setHosts: (hosts: StoredHost[]) => void
  setKeys: (keys: StoredKey[]) => void

  // Actions — sessions
  openSession: (host: StoredHost) => string
  closeSession: (tabId: string) => void
  setSessionStatus: (tabId: string, status: SessionStatus, errorMsg?: string) => void
  setActiveTab: (tabId: string) => void
  toggleSFTP: (tabId: string) => void
  setSFTPPath: (tabId: string, path: string) => void

  // Actions — modals
  openAddHost: (groupId?: string) => void
  openEditHost: (hostId: string) => void
  closeHostModal: () => void
  openAddGroup: () => void
  openEditGroup: (groupId: string) => void
  closeGroupModal: () => void
  setShowKeyManager: (show: boolean) => void
  setShowQuickConnect: (show: boolean) => void
}

let tabCounter = 0

export const useAppStore = create<AppState>((set, get) => ({
  groups: [],
  hosts: [],
  keys: [],
  sessions: [],
  activeTabId: null,
  showAddHost: false,
  editHostId: null,
  showAddGroup: false,
  editGroupId: null,
  showKeyManager: false,
  showQuickConnect: false,

  setGroups: (groups) => set({ groups }),
  setHosts: (hosts) => set({ hosts }),
  setKeys: (keys) => set({ keys }),

  openSession: (host) => {
    tabCounter++
    const tabId = `${host.id}:${tabCounter}`
    const session: Session = {
      tabId,
      hostId: host.id,
      label: host.label,
      host: host.host,
      status: 'connecting',
      showSFTP: false,
      sftpPath: '/'
    }
    set(state => ({
      sessions: [...state.sessions, session],
      activeTabId: tabId
    }))
    return tabId
  },

  closeSession: (tabId) => {
    set(state => {
      const sessions = state.sessions.filter(s => s.tabId !== tabId)
      const activeTabId = state.activeTabId === tabId
        ? (sessions.length > 0 ? sessions[sessions.length - 1].tabId : null)
        : state.activeTabId
      return { sessions, activeTabId }
    })
  },

  setSessionStatus: (tabId, status, errorMsg) => {
    set(state => ({
      sessions: state.sessions.map(s =>
        s.tabId === tabId ? { ...s, status, errorMsg } : s
      )
    }))
  },

  setActiveTab: (tabId) => set({ activeTabId: tabId }),

  toggleSFTP: (tabId) => {
    set(state => ({
      sessions: state.sessions.map(s =>
        s.tabId === tabId ? { ...s, showSFTP: !s.showSFTP } : s
      )
    }))
  },

  setSFTPPath: (tabId, path) => {
    set(state => ({
      sessions: state.sessions.map(s =>
        s.tabId === tabId ? { ...s, sftpPath: path } : s
      )
    }))
  },

  openAddHost: (groupId) => set({ showAddHost: true, editHostId: groupId ? `new:${groupId}` : 'new' }),
  openEditHost: (hostId) => set({ showAddHost: true, editHostId: hostId }),
  closeHostModal: () => set({ showAddHost: false, editHostId: null }),

  openAddGroup: () => set({ showAddGroup: true, editGroupId: null }),
  openEditGroup: (groupId) => set({ showAddGroup: true, editGroupId: groupId }),
  closeGroupModal: () => set({ showAddGroup: false, editGroupId: null }),

  setShowKeyManager: (show) => set({ showKeyManager: show }),
  setShowQuickConnect: (show) => set({ showQuickConnect: show })
}))
