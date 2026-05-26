/**
 * Browser preview mock — replaces window.api when running outside Electron.
 * Boots straight to the main app with demo data + a live-looking terminal session.
 */
import { useAppStore } from './store/appStore'

const mockGroups = [
  { id: 'g1', name: 'Production', color: '#e95420', expanded: true },
  { id: 'g2', name: 'Staging',    color: '#f97316', expanded: true },
  { id: 'g3', name: 'Personal',   color: '#22c55e', expanded: false },
]

const mockHosts = [
  { id: 'h1', groupId: 'g1',  label: 'AI Factory',     host: '192.168.70.61',      port: 22, username: 'aifactory', authType: 'key',      keyId: 'k1', createdAt: Date.now() },
  { id: 'h2', groupId: 'g1',  label: 'nueramind server',host: 'ssh.nueramind.com', port: 22, username: 'william',   authType: 'key',      keyId: 'k1', createdAt: Date.now() },
  { id: 'h3', groupId: 'g2',  label: 'Staging Web',    host: 'staging.nueramind.com', port: 22, username: 'deploy',  authType: 'password', createdAt: Date.now() },
  { id: 'h4', groupId: 'g2',  label: 'Staging Worker', host: 'staging.nueramind.com', port: 22, username: 'worker',  authType: 'key',      keyId: 'k1', createdAt: Date.now() },
  { id: 'h5', groupId: null,  label: 'nueramind-server-dubai-comp', host: '192.168.70.30', port: 22, username: 'root', authType: 'key', keyId: 'k1', createdAt: Date.now() },
]

const mockKeys = [
  { id: 'k1', name: 'id_ed25519',  createdAt: Date.now() - 86400000 * 7 },
  { id: 'k2', name: 'deploy_key',  createdAt: Date.now() - 86400000 * 2 },
]

const mockKnownHosts = [
  { ip: '192.168.70.61', fingerprint: 'SHA256:abc123', addedAt: Date.now() - 86400000 * 30 },
  { ip: '192.168.70.30', fingerprint: 'SHA256:def456', addedAt: Date.now() - 86400000 * 14 },
  { ip: '192.168.1.106', fingerprint: 'SHA256:ghi789', addedAt: Date.now() - 86400000 * 7  },
  { ip: '192.168.1.40',  fingerprint: 'SHA256:jkl012', addedAt: Date.now() - 86400000 * 3  },
  { ip: '192.168.1.41',  fingerprint: 'SHA256:mno345', addedAt: Date.now() - 86400000 * 1  },
]

const mockLogs = [
  {
    id: 'log1', date: Date.now() - 3600000 * 5, duration: 19620,
    userEmail: 'thurstonwilliam1603@gmail.com', userIp: '94.201.22.134',
    deviceName: 'Williams-MacBook-Pro-7',
    hostId: 'h1', hostLabel: 'AI Factory', hostUsername: 'aifactory', bookmarked: false,
  },
  {
    id: 'log2', date: Date.now() - 3600000 * 6, duration: 3600,
    userEmail: 'thurstonwilliam1603@gmail.com', userIp: '94.201.22.134',
    deviceName: 'Williams-MacBook-Pro',
    hostId: 'h2', hostLabel: 'nueramind server', hostUsername: 'william', bookmarked: false,
  },
  {
    id: 'log3', date: Date.now() - 86400000 - 3600000 * 13, duration: 82560,
    userEmail: 'thurstonwilliam1603@gmail.com', userIp: '104.28.250.185',
    deviceName: 'Williams-MacBook-Pro',
    hostId: 'h2', hostLabel: 'nueramind server', hostUsername: 'william', bookmarked: false,
  },
  {
    id: 'log4', date: Date.now() - 86400000 * 3 - 3600000 * 4, duration: 6840,
    userEmail: 'thurstonwilliam1603@gmail.com', userIp: '94.201.22.134',
    deviceName: 'Williams-MacBook-Pro-7',
    hostId: 'h2', hostLabel: 'nueramind server', hostUsername: 'william', bookmarked: false,
  },
]

/* ── ANSI colours ── */
const G    = '\x1b[32m'
const B    = '\x1b[34m'
const Y    = '\x1b[33m'
const R    = '\x1b[0m'
const DIM  = '\x1b[2m'
const BOLD = '\x1b[1m'
const ORANGE = '\x1b[38;2;233;84;32m'
const PROMPT = `${BOLD}${G}aifactory${R}${G}@${R}${G}nueramind-server-dubai-comp${R}:${BOLD}${B}~${R}$ `

const sshDataCallbacks:   Map<string, (d: string) => void> = new Map()
const sshClosedCallbacks: Map<string, (m: string) => void> = new Map()

function simulateShell(tabId: string) {
  const emit = (d: string) => sshDataCallbacks.get(tabId)?.(d)

  setTimeout(() => emit(`${DIM}Welcome to Ubuntu 26.04 LTS (GNU/Linux 7.0.0-15-generic x86_64)${R}\r\n\r\n`), 200)
  setTimeout(() => emit(`${DIM}System information as of ${new Date().toUTCString()}${R}\r\n\r\n`), 400)
  setTimeout(() => emit([
    `  ${Y}System load:${R}  1.18              ${Y}Temperature:${R}  61.0 C`,
    `  ${Y}Usage of /:${R}   17.1% of 97.87GB  ${Y}Processes:${R}    264`,
    `  ${Y}Memory usage:${R} 28%               ${Y}Users logged:${R} 0`,
    `  ${Y}Swap usage:${R}   0%                ${Y}IPv4:${R}         ${ORANGE}192.168.70.61${R}`,
  ].join('\r\n') + '\r\n\r\n'), 600)
  setTimeout(() => emit(`${DIM}Last login: ${new Date(Date.now() - 7200000).toUTCString()} from 192.168.70.8${R}\r\n\r\n`), 800)
  setTimeout(() => emit(PROMPT), 1000)
}

export function installMockApi() {
  ;(window as any).api = {
    groups: {
      get:    () => Promise.resolve([...mockGroups]),
      add:    (name: string, color: string) =>
        Promise.resolve({ id: `g${Date.now()}`, name, color, expanded: true }),
      update: (_id: string, _p: any) => Promise.resolve(),
      delete: (_id: string) => Promise.resolve(),
    },
    hosts: {
      get:    () => Promise.resolve([...mockHosts]),
      add:    (h: any) => Promise.resolve({ ...h, id: `h${Date.now()}`, createdAt: Date.now() }),
      update: () => Promise.resolve(),
      delete: () => Promise.resolve(),
    },
    ssh: {
      connect: (_opts: any) => new Promise(resolve => setTimeout(resolve, 900)),
      write: (_tabId: string, data: string) => {
        const cb = sshDataCallbacks.get(_tabId)
        if (!cb) return Promise.resolve()
        cb(data)
        if (data === '\r') cb('\r\n' + PROMPT)
        return Promise.resolve()
      },
      resize:      () => Promise.resolve(),
      disconnect:  () => Promise.resolve(),
      isConnected: () => Promise.resolve(true),
      onData: (tabId: string, cb: (d: string) => void) => {
        sshDataCallbacks.set(tabId, cb)
        simulateShell(tabId)
        return () => sshDataCallbacks.delete(tabId)
      },
      onClosed: (tabId: string, cb: (m: string) => void) => {
        sshClosedCallbacks.set(tabId, cb)
        return () => sshClosedCallbacks.delete(tabId)
      },
    },
    sftp: {
      open:    () => Promise.resolve(),
      close:   () => Promise.resolve(),
      readdir: (_tabId: string, _path: string) => Promise.resolve([
        { filename: 'app',       longname: 'drwxr-xr-x', attrs: { size: 4096, mtime: Date.now(), isDirectory: true,  isSymbolicLink: false, mode: 0o755, permissions: 'drwxr-xr-x' } },
        { filename: 'logs',      longname: 'drwxr-xr-x', attrs: { size: 4096, mtime: Date.now(), isDirectory: true,  isSymbolicLink: false, mode: 0o755, permissions: 'drwxr-xr-x' } },
        { filename: '.env',      longname: '-rw-------',  attrs: { size: 512,  mtime: Date.now(), isDirectory: false, isSymbolicLink: false, mode: 0o600, permissions: '-rw-------'  } },
        { filename: 'deploy.sh', longname: '-rwxr-xr-x', attrs: { size: 2048, mtime: Date.now(), isDirectory: false, isSymbolicLink: false, mode: 0o755, permissions: '-rwxr-xr-x'  } },
        { filename: 'README.md', longname: '-rw-r--r--',  attrs: { size: 4096, mtime: Date.now(), isDirectory: false, isSymbolicLink: false, mode: 0o644, permissions: '-rw-r--r--'  } },
      ]),
      download: () => Promise.resolve('/tmp/downloaded'),
      upload:   () => Promise.resolve('/remote/upload'),
      mkdir:    () => Promise.resolve(),
      delete:   () => Promise.resolve(),
      rename:   () => Promise.resolve(),
    },
    keys: {
      list:       () => Promise.resolve([...mockKeys]),
      importFile: () => Promise.resolve(mockKeys[0]),
      importText: (name: string) => Promise.resolve({ id: `k${Date.now()}`, name, createdAt: Date.now() }),
      delete:     () => Promise.resolve(),
    },
    settings: {
      get:    () => Promise.resolve({ fontSize: 13, fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace', cursorStyle: 'bar', theme: 'default' }),
      update: () => Promise.resolve(),
    },
  }
}

/* Auto-open a demo SSH session in preview mode */
export function openDemoSession() {
  const store = useAppStore.getState()
  const {
    openSession, setSessionStatus,
    setKnownHosts, setConnectionLogs,
  } = store

  /* Inject mock data */
  setKnownHosts(mockKnownHosts)
  setConnectionLogs(mockLogs)

  const demoHost = mockHosts[0] as any
  const tabId = openSession(demoHost)
  setTimeout(() => setSessionStatus(tabId, 'connected'), 900)
}
