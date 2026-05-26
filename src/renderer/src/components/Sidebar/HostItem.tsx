import React, { useState } from 'react'
import { useAppStore, StoredHost } from '../../store/appStore'

interface Props {
  host: StoredHost
}

export default function HostItem({ host }: Props): React.ReactElement {
  const { sessions, activeTabId, openSession, setActiveTab, openEditHost, hosts, setHosts } = useAppStore()
  const [showMenu, setShowMenu] = useState(false)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })

  const existingSession = sessions.find(s => s.hostId === host.id)
  const isActive = activeTabId === existingSession?.tabId
  const status = existingSession?.status

  const connect = async () => {
    if (existingSession) {
      setActiveTab(existingSession.tabId)
      return
    }
    const tabId = openSession(host)

    try {
      await window.api.ssh.connect({
        tabId,
        host: host.host,
        port: host.port,
        username: host.username,
        authType: host.authType,
        password: host.password,
        keyId: host.keyId,
        rows: 24, cols: 80
      })
      useAppStore.getState().setSessionStatus(tabId, 'connected')
    } catch (err: any) {
      useAppStore.getState().setSessionStatus(tabId, 'error', err.message)
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setMenuPos({ x: e.clientX, y: e.clientY })
    setShowMenu(true)
  }

  const deleteHost = async () => {
    await window.api.hosts.delete(host.id)
    setHosts(hosts.filter(h => h.id !== host.id))
    setShowMenu(false)
  }

  return (
    <>
      <div
        className="titlebar-no-drag flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer group transition-all mb-0.5"
        style={{
          background: isActive ? 'var(--accent-light)' : 'transparent',
          boxShadow: isActive ? 'inset 3px 0 0 var(--accent)' : 'none',
          borderRadius: isActive ? '0 8px 8px 0' : '8px'
        }}
        onClick={connect}
        onContextMenu={handleContextMenu}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
      >
        {/* Status dot */}
        <div className="shrink-0 relative">
          <div className="w-2 h-2 rounded-full"
            style={{
              background: status === 'connected' ? 'var(--success)'
                : status === 'connecting' ? 'var(--warning)'
                : status === 'error' ? 'var(--error)'
                : 'var(--text-muted)',
              boxShadow: status === 'connected' ? '0 0 6px var(--success)' : 'none'
            }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium truncate" style={{ color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}>
            {host.label}
          </div>
          <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
            {host.username}@{host.host}:{host.port}
          </div>
        </div>

        {/* Auth type icon */}
        <div className="shrink-0 opacity-0 group-hover:opacity-60 transition-opacity">
          {host.authType === 'key' ? (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
        </div>
      </div>

      {/* Context menu */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div
            className="fixed z-50 rounded-lg py-1 animate-fade-in"
            style={{
              left: menuPos.x, top: menuPos.y,
              background: 'var(--modal-bg)',
              border: '1px solid var(--border)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              minWidth: '160px'
            }}
          >
            <MenuItem onClick={connect} icon="▶">Connect</MenuItem>
            <MenuItem onClick={() => { openEditHost(host.id); setShowMenu(false) }} icon="✏">Edit</MenuItem>
            <div className="my-1" style={{ borderTop: '1px solid var(--border)' }} />
            <MenuItem onClick={deleteHost} icon="✕" danger>Delete</MenuItem>
          </div>
        </>
      )}
    </>
  )
}

function MenuItem({ children, onClick, icon, danger }: { children: React.ReactNode, onClick: () => void, icon: string, danger?: boolean }): React.ReactElement {
  return (
    <button
      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs transition-colors"
      style={{ color: danger ? 'var(--error)' : 'var(--text-primary)' }}
      onClick={onClick}
      onMouseEnter={e => (e.currentTarget.style.background = danger ? 'rgba(224,93,93,0.12)' : 'var(--accent-light)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <span style={{ fontSize: '10px', opacity: 0.7 }}>{icon}</span>
      {children}
    </button>
  )
}
