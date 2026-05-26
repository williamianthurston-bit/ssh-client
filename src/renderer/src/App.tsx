import React, { useEffect } from 'react'
import { useAppStore } from './store/appStore'
import Sidebar from './components/Sidebar/Sidebar'
import TabBar from './components/Terminal/TabBar'
import TerminalView from './components/Terminal/TerminalView'
import SFTPPanel from './components/SFTP/SFTPPanel'
import AddHostModal from './components/Modals/AddHostModal'
import AddGroupModal from './components/Modals/AddGroupModal'
import KeyManagerModal from './components/Modals/KeyManagerModal'
import QuickConnect from './components/Sidebar/QuickConnect'

declare global {
  interface Window {
    api: any
    electron: any
  }
}

export default function App(): React.ReactElement {
  const {
    setGroups, setHosts, setKeys,
    sessions, activeTabId,
    showAddHost, showAddGroup, showKeyManager, showQuickConnect
  } = useAppStore()

  // Load persisted data on boot
  useEffect(() => {
    const load = async () => {
      const [groups, hosts, keys] = await Promise.all([
        window.api.groups.get(),
        window.api.hosts.get(),
        window.api.keys.list()
      ])
      setGroups(groups)
      setHosts(hosts)
      setKeys(keys)
    }
    load()
  }, [])

  const activeSession = sessions.find(s => s.tabId === activeTabId)

  return (
    <div className="flex h-full w-full overflow-hidden" style={{ background: 'var(--bg-app)' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Tab bar */}
        <TabBar />

        {/* Terminal + SFTP */}
        <div className="flex flex-1 min-h-0">
          {/* Terminal panels (one per session, only active visible) */}
          <div className="flex-1 min-w-0 relative">
            {sessions.length === 0 ? (
              <WelcomeScreen />
            ) : (
              sessions.map(session => (
                <div
                  key={session.tabId}
                  className="absolute inset-0"
                  style={{ display: session.tabId === activeTabId ? 'block' : 'none' }}
                >
                  <TerminalView session={session} />
                </div>
              ))
            )}
          </div>

          {/* SFTP Panel */}
          {activeSession?.showSFTP && (
            <SFTPPanel tabId={activeSession.tabId} />
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddHost && <AddHostModal />}
      {showAddGroup && <AddGroupModal />}
      {showKeyManager && <KeyManagerModal />}
      {showQuickConnect && <QuickConnect />}
    </div>
  )
}

function WelcomeScreen(): React.ReactElement {
  const { setShowQuickConnect, openAddHost } = useAppStore()

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6"
         style={{ background: 'var(--bg-terminal)' }}>
      {/* Logo */}
      <div className="flex flex-col items-center gap-3 mb-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
             style={{ background: 'var(--accent)', boxShadow: '0 8px 32px rgba(110,63,197,0.4)' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 9l3 3-3 3M13 15h3" />
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>SSH Client</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Connect to your servers</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowQuickConnect(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{ background: 'var(--accent)', color: 'white' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Quick Connect
        </button>
        <button
          onClick={() => openAddHost()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{ background: 'var(--border)', color: 'var(--text-primary)' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#3a3a58')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--border)')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Host
        </button>
      </div>

      {/* Keyboard hint */}
      <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
        Click a host in the sidebar to connect
      </p>
    </div>
  )
}
