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

  const dotColor =
    session?.status === 'connected'  ? '#21B568' :
    session?.status === 'connecting' ? '#EFAF76' :
    session?.status === 'error'      ? '#F24E50' : '#4D6EA9'

  return (
    <>
      <div
        className="titlebar-no-drag flex items-center gap-2.5 py-1.5 cursor-pointer group/item"
        style={{
          paddingLeft: `${12 + indent * 16}px`,
          paddingRight: '10px',
          background: isActive ? 'rgba(32,145,246,0.1)' : 'transparent',
          borderLeft: isActive ? '2px solid #2091F6' : '2px solid transparent',
        }}
        onClick={connect}
        onContextMenu={e => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY }) }}
        onMouseEnter={e => {
          if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
        }}
        onMouseLeave={e => {
          if (!isActive) e.currentTarget.style.background = 'transparent'
        }}
      >
        {/* Status dot */}
        <div style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: dotColor, flexShrink: 0,
          boxShadow: session?.status === 'connected' ? `0 0 4px ${dotColor}88` : 'none',
        }} />

        {/* Host info */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium truncate"
               style={{ color: isActive ? '#2091F6' : '#F7F9FA' }}>
            {host.label}
          </div>
          <div className="truncate" style={{ color: '#5A5E73', fontSize: '11px' }}>
            {host.username}@{host.host}
          </div>
        </div>

        {/* Key badge — shown on hover */}
        {host.authType === 'key' && (
          <svg className="opacity-0 group-hover/item:opacity-100 shrink-0 transition-opacity"
               width="10" height="10" viewBox="0 0 10 10" fill="#4D6EA9">
            <path d="M8.455 0.955L7.012 2.399L6.645 2.033C6.173 1.561 5.35 1.56 4.878 2.033L4.375 2.536L4.045 2.205L3.455 2.795L7.205 6.545L7.795 5.955L7.464 5.625L7.967 5.122C8.455 4.635 8.455 3.842 7.967 3.354L7.601 2.988L9.045 1.545L8.455 0.955ZM2.795 3.455L2.205 4.045L2.536 4.375L2.033 4.878C1.545 5.365 1.545 6.158 2.033 6.645L2.399 7.012L0.955 8.455L1.545 9.045L2.988 7.601L3.354 7.967C3.59 8.203 3.904 8.333 4.238 8.333C4.572 8.333 4.886 8.203 5.122 7.967L5.625 7.464L5.955 7.795L6.545 7.205L2.795 3.455Z"/>
          </svg>
        )}
      </div>

      {/* Context menu */}
      {menu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenu(null)} />
          <div className="fixed z-50 py-1 rounded-xl anim-fade"
               style={{
                 left: menu.x, top: menu.y,
                 background: '#1A2F54',
                 border: '1px solid #264E72',
                 boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
                 minWidth: '164px',
               }}>
            <Ctx onClick={connect}>Connect</Ctx>
            <Ctx onClick={() => { openEditHost(host.id); setMenu(null) }}>Edit Host</Ctx>
            <div className="my-1 mx-2" style={{ borderTop: '1px solid #264E72' }} />
            <Ctx onClick={doDelete} danger>Delete</Ctx>
          </div>
        </>
      )}
    </>
  )
}

function Ctx({ children, onClick, danger }: { children: React.ReactNode, onClick: () => void, danger?: boolean }) {
  return (
    <button className="w-full flex items-center px-3 py-1.5 text-xs"
            style={{ color: danger ? '#F24E50' : '#F7F9FA' }}
            onClick={onClick}
            onMouseEnter={e => (e.currentTarget.style.background = danger ? 'rgba(242,78,80,0.1)' : 'rgba(32,145,246,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
      {children}
    </button>
  )
}
