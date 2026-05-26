import React, { useEffect } from 'react'
import { useAppStore } from './store/appStore'
import LoginScreen from './components/Auth/LoginScreen'
import NavSidebar from './components/Nav/NavSidebar'
import TabBar from './components/Terminal/TabBar'
import HostsView from './components/Views/HostsView'
import KeychainView from './components/Views/KeychainView'
import LogsView from './components/Views/LogsView'
import KnownHostsView from './components/Views/KnownHostsView'
import PortForwardingView from './components/Views/PortForwardingView'
import SnippetsView from './components/Views/SnippetsView'
import TerminalView from './components/Terminal/TerminalView'
import SFTPPanel from './components/SFTP/SFTPPanel'
import CommandPalette from './components/CommandPalette'
import SettingsPanel from './components/Modals/SettingsPanel'
import AddHostModal from './components/Modals/AddHostModal'
import AddGroupModal from './components/Modals/AddGroupModal'
import KeyManagerModal from './components/Modals/KeyManagerModal'

declare global {
  interface Window { api: any; electron: any }
}

export default function App(): React.ReactElement {
  const {
    authChecked, setAuthChecked,
    setGroups, setHosts, setKeys,
    sessions, activeTabId, currentView,
    paletteOpen, openPalette, closePalette,
    showSettings, showAddHost, showAddGroup, showKeyManager,
  } = useAppStore()

  /* Skip login in browser preview */
  useEffect(() => {
    if ((window as any).__PREVIEW_MODE__) {
      setAuthChecked(true)
      loadLocalData()
    }
  }, [])

  const loadLocalData = async () => {
    try {
      const [groups, hosts, keys] = await Promise.all([
        window.api?.groups?.get() ?? [],
        window.api?.hosts?.get() ?? [],
        window.api?.keys?.list() ?? [],
      ])
      setGroups(groups); setHosts(hosts); setKeys(keys)
    } catch {}
  }

  /* Global keyboard shortcuts */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault()
        paletteOpen ? closePalette() : openPalette()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [paletteOpen])

  if (!authChecked) return <LoginScreen />

  const activeSession = sessions.find(s => s.tabId === activeTabId)
  const showTerminal = currentView === 'terminal' && activeSession != null

  return (
    <div className="flex flex-col h-full w-full overflow-hidden" style={{ background: 'var(--bg-app)' }}>
      {/* Tab bar / titlebar */}
      <TabBar />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <NavSidebar />

        <div className="flex flex-1 overflow-hidden">
          {showTerminal ? (
            /* Terminal view */
            <div className="flex flex-1 overflow-hidden">
              <div className="flex-1 min-w-0 relative">
                <TerminalView session={activeSession!} />
              </div>
              {activeSession?.showSFTP && <SFTPPanel tabId={activeSession.tabId} />}
            </div>
          ) : (
            /* Nav views */
            <>
              {currentView === 'hosts'      && <HostsView />}
              {currentView === 'keychain'   && <KeychainView />}
              {currentView === 'portfwd'    && <PortForwardingView />}
              {currentView === 'snippets'   && <SnippetsView />}
              {currentView === 'knownhosts' && <KnownHostsView />}
              {currentView === 'logs'       && <LogsView />}
            </>
          )}
        </div>
      </div>

      {/* Overlays */}
      {paletteOpen  && <CommandPalette />}
      {showAddHost  && <AddHostModal />}
      {showAddGroup && <AddGroupModal />}
      {showKeyManager && <KeyManagerModal />}
      {showSettings && <SettingsPanel />}
    </div>
  )
}
