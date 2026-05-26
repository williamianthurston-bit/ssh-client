import React from 'react'
import { useAppStore, Session } from '../../store/appStore'

export default function TabBar(): React.ReactElement {
  const { sessions, activeTabId, setActiveTab, closeSession, setShowQuickConnect } = useAppStore()

  if (sessions.length === 0) return <div style={{ height: '40px', background: 'var(--bg-app)' }} className="titlebar-drag" />

  return (
    <div
      className="flex items-end titlebar-drag"
      style={{
        background: 'var(--bg-app)',
        borderBottom: '1px solid var(--border)',
        minHeight: '44px',
        paddingLeft: '80px' // Mac traffic lights space
      }}
    >
      {/* Tabs */}
      <div className="flex items-end overflow-x-auto titlebar-no-drag" style={{ maxWidth: 'calc(100% - 60px)' }}>
        {sessions.map(session => (
          <Tab
            key={session.tabId}
            session={session}
            isActive={session.tabId === activeTabId}
            onActivate={() => setActiveTab(session.tabId)}
            onClose={() => {
              window.api.ssh.disconnect(session.tabId)
              window.api.sftp.close(session.tabId)
              closeSession(session.tabId)
            }}
          />
        ))}
      </div>

      {/* New tab / Quick Connect */}
      <button
        className="titlebar-no-drag flex items-center justify-center w-8 h-8 mb-1 ml-1 rounded transition-colors shrink-0"
        style={{ color: 'var(--text-muted)' }}
        title="Quick Connect"
        onClick={() => setShowQuickConnect(true)}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-light)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  )
}

function Tab({ session, isActive, onActivate, onClose }: {
  session: Session
  isActive: boolean
  onActivate: () => void
  onClose: () => void
}): React.ReactElement {
  const statusColor = session.status === 'connected' ? 'var(--success)'
    : session.status === 'connecting' ? 'var(--warning)'
    : session.status === 'error' ? 'var(--error)'
    : 'var(--text-muted)'

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 cursor-pointer shrink-0 group/tab relative"
      style={{
        background: isActive ? 'var(--bg-terminal)' : 'transparent',
        borderTop: isActive ? `2px solid var(--accent)` : '2px solid transparent',
        borderRight: `1px solid var(--border)`,
        maxWidth: '200px',
        minWidth: '120px'
      }}
      onClick={onActivate}
    >
      {/* Status dot */}
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{
          background: statusColor,
          boxShadow: session.status === 'connected' ? `0 0 5px ${statusColor}` : 'none',
        }}
      />

      {/* Label */}
      <span
        className="text-xs truncate flex-1"
        style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}
      >
        {session.label}
      </span>

      {/* Close button */}
      <button
        className="shrink-0 w-4 h-4 rounded flex items-center justify-center opacity-0 group-hover/tab:opacity-60 hover:!opacity-100 transition-opacity"
        style={{ color: 'var(--text-muted)' }}
        onClick={e => { e.stopPropagation(); onClose() }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(224,93,93,0.2)'; e.currentTarget.style.color = 'var(--error)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
