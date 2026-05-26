import React, { useState } from 'react'
import { useAppStore, StoredHost } from '../../store/appStore'

interface Props { host: StoredHost; indent: number }

export default function HostItem({ host, indent }: Props): React.ReactElement {
  const { sessions, activeTabId, openSession, setActiveTab, openEditHost, hosts, setHosts, setSessionStatus } = useAppStore()
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null)

  const session = sessions.find(s => s.hostId === host.id)
  const isActive = activeTabId === session?.tabId

  const connect = async () => {
    if (session) { setActiveTab(session.tabId); return }
    const tabId = openSession(host)
    try {
      await window.api?.ssh?.connect({
        tabId, host: host.host, port: host.port,
        username: host.username, authType: host.authType,
        password: host.password, keyId: host.keyId,
        rows: 24, cols: 80
      })
      setSessionStatus(tabId, 'connected')
    } catch (err: any) {
      setSessionStatus(tabId, 'error', err.message)
    }
  }

  const doDelete = async () => {
    await window.api?.hosts?.delete(host.id)
    setHosts(hosts.filter(h => h.id !== host.id))
    setMenu(null)
  }

  const statusClass = session?.status === 'connected'    ? 'dot-connected'
                    : session?.status === 'connecting'   ? 'dot-connecting'
                    : session?.status === 'error'        ? 'dot-error'
                    : 'dot-disconnected'

  return (
    <>
      <div
        className={`titlebar-no-drag flex items-center gap-2.5 py-1.5 cursor-pointer group/item transition-colors ${isActive ? 'sidebar-item-active' : ''}`}
        style={{ paddingLeft: `${12 + indent * 16}px`, paddingRight: '12px' }}
        onClick={connect}
        onContextMenu={e => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY }) }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)' }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
      >
        {/* Status dot */}
        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusClass}`} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium truncate" style={{ color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}>
            {host.label}
          </div>
          <div className="text-xs truncate" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
            {host.username}@{host.host}
          </div>
        </div>

        {/* Auth badge */}
        {host.authType === 'key' && (
          <svg className="opacity-0 group-hover/item:opacity-40 shrink-0" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}>
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
          </svg>
        )}
      </div>

      {/* Context menu */}
      {menu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenu(null)} />
          <div className="fixed z-50 py-1 rounded-xl anim-fade"
               style={{ left: menu.x, top: menu.y, background: 'var(--bg-modal)', border: '1px solid var(--border-light)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', minWidth: '164px' }}>
            <Ctx onClick={connect}>Connect</Ctx>
            <Ctx onClick={() => { openEditHost(host.id); setMenu(null) }}>Edit Host</Ctx>
            <div className="my-1 mx-2" style={{ borderTop: '1px solid var(--border)' }} />
            <Ctx onClick={doDelete} danger>Delete</Ctx>
          </div>
        </>
      )}
    </>
  )
}

function Ctx({ children, onClick, danger }: { children: React.ReactNode, onClick: () => void, danger?: boolean }) {
  return (
    <button className="w-full flex items-center px-3 py-1.5 text-xs transition-colors"
            style={{ color: danger ? 'var(--error)' : 'var(--text-primary)' }}
            onClick={onClick}
            onMouseEnter={e => (e.currentTarget.style.background = danger ? 'rgba(224,93,93,0.1)' : 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
      {children}
    </button>
  )
}
