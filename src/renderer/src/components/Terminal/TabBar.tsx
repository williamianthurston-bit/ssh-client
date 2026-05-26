import React from 'react'
import { useAppStore, Session } from '../../store/appStore'

export default function TabBar(): React.ReactElement {
  const {
    sessions, activeTabId,
    setActiveTab, closeSession, currentView,
    openPalette, account,
  } = useAppStore()

  return (
    <div
      className="titlebar-drag flex items-center shrink-0"
      style={{
        height: '40px',
        background: 'var(--tab-bar)',
        borderBottom: '1px solid var(--border-light)',
      }}
    >
      {/* Traffic lights spacer */}
      <div style={{ width: '80px' }} className="shrink-0" />

      {/* Session tabs */}
      <div
        className="titlebar-no-drag flex items-stretch flex-1 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {sessions.map(s => (
          <SessionTab
            key={s.tabId}
            session={s}
            isActive={s.tabId === activeTabId && currentView === 'terminal'}
            onActivate={() => setActiveTab(s.tabId)}
            onClose={() => {
              window.api?.ssh?.disconnect(s.tabId)
              window.api?.sftp?.close(s.tabId)
              closeSession(s.tabId)
            }}
          />
        ))}
      </div>

      {/* Right controls */}
      <div className="titlebar-no-drag flex items-center gap-1 px-3 shrink-0">
        {/* Command palette */}
        <TitleBtn title="Command Palette (⌘J)" onClick={openPalette}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </TitleBtn>

        {/* Notification bell */}
        <TitleBtn title="Notifications" onClick={() => {}}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M8 2a4 4 0 00-4 4v3l-1.5 2H13.5L12 9V6a4 4 0 00-4-4zM6.5 13a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </TitleBtn>

        {/* User avatar */}
        <div
          style={{
            width: '26px', height: '26px', borderRadius: '50%',
            background: '#e95420',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', fontWeight: 700, color: 'white',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          {account?.email?.[0]?.toUpperCase() ?? 'W'}
        </div>
      </div>
    </div>
  )
}

function SessionTab({
  session, isActive, onActivate, onClose,
}: {
  session: Session; isActive: boolean; onActivate: () => void; onClose: () => void
}) {
  const dotClass =
    session.status === 'connected'  ? 'dot-connected'    :
    session.status === 'connecting' ? 'dot-connecting'   :
    session.status === 'error'      ? 'dot-error'        : 'dot-disconnected'

  /* Tab background colour when it's an active terminal session */
  const isTerminalActive = isActive && session.status === 'connected'

  return (
    <div
      className="flex items-center gap-1.5 px-3 cursor-pointer group/tab shrink-0 relative"
      style={{
        maxWidth: '200px', minWidth: '140px',
        background: isActive ? 'var(--tab-active-bg)' : 'transparent',
        borderRight: '1px solid var(--border-light)',
      }}
      onClick={onActivate}
    >
      {/* Top accent bar */}
      {isActive && <div className="tab-active-indicator" />}

      {/* Host icon */}
      <div
        style={{
          width: '14px', height: '14px', borderRadius: '3px', flexShrink: 0,
          background: isTerminalActive ? '#e95420' : 'var(--bg-card)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {isTerminalActive ? (
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" fill="white"/>
            <circle cx="12" cy="2" r="2" fill="white"/>
            <circle cx="20.8" cy="17" r="2" fill="white"/>
            <circle cx="3.2" cy="17" r="2" fill="white"/>
          </svg>
        ) : (
          <div className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
        )}
      </div>

      <span
        className="text-xs truncate flex-1"
        style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}
      >
        {session.label}
      </span>

      <button
        className="shrink-0 w-3.5 h-3.5 rounded flex items-center justify-center opacity-0 group-hover/tab:opacity-60 hover:!opacity-100 transition-opacity"
        style={{ color: 'var(--text-secondary)' }}
        onClick={e => { e.stopPropagation(); onClose() }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(239,68,68,0.2)'
          e.currentTarget.style.color = '#ef4444'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--text-secondary)'
        }}
      >
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  )
}

function TitleBtn({
  children, title, onClick,
}: {
  children: React.ReactNode; title: string; onClick: () => void
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: '28px', height: '28px', borderRadius: '7px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)', transition: 'background .12s, color .12s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--bg-card)'
        e.currentTarget.style.color = 'var(--text-primary)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = 'var(--text-muted)'
      }}
    >
      {children}
    </button>
  )
}
