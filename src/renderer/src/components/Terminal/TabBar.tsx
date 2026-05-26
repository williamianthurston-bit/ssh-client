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
      className="titlebar-drag flex items-stretch shrink-0"
      style={{
        height: '40px',
        background: '#0C1A38',
        borderBottom: '1px solid #0F2040',
      }}
    >
      {/* Traffic lights spacer */}
      <div style={{ width: '72px' }} className="shrink-0" />

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
      <div className="titlebar-no-drag flex items-center gap-0.5 px-2 shrink-0">
        <TitleBtn title="Command Palette (⌘J)" onClick={openPalette}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </TitleBtn>

        {/* User avatar — Termius gradient style */}
        <div
          style={{
            width: '24px', height: '24px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #2091F6, #21B568)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', fontWeight: 700, color: 'white',
            cursor: 'pointer', flexShrink: 0, marginLeft: '4px',
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
  const isConnected = session.status === 'connected'
  const dotColor =
    session.status === 'connected'  ? '#21B568' :
    session.status === 'connecting' ? '#EFAF76' :
    session.status === 'error'      ? '#F24E50' : '#4D6EA9'

  return (
    <div
      className="flex items-center gap-2 px-3 cursor-pointer group/tab shrink-0 relative"
      style={{
        maxWidth: '200px', minWidth: '140px',
        height: '100%',
        background: isActive ? '#141729' : 'transparent',
        borderRight: '1px solid #0F2040',
      }}
      onClick={onActivate}
    >
      {/* Termius bottom-bar tab indicator */}
      {isActive && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, #2091F6, #21B568)',
        }} />
      )}

      {/* Status dot */}
      <div style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: dotColor, flexShrink: 0,
        boxShadow: isConnected ? `0 0 4px ${dotColor}88` : 'none',
      }} />

      <span
        className="text-xs truncate flex-1"
        style={{ color: isActive ? '#F7F9FA' : '#8D91A5' }}
      >
        {session.label}
      </span>

      {/* Close button — appears on hover */}
      <button
        className="shrink-0 w-3.5 h-3.5 rounded flex items-center justify-center opacity-0 group-hover/tab:opacity-60 hover:!opacity-100 transition-opacity"
        style={{ color: '#8D91A5' }}
        onClick={e => { e.stopPropagation(); onClose() }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(242,78,80,0.2)'
          e.currentTarget.style.color = '#F24E50'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = '#8D91A5'
        }}
      >
        {/* Termius ×× close icon */}
        <svg width="8" height="8" viewBox="0 0 11 11" fill="currentColor">
          <path d="M0.392 1.186c0.346-0.346 0.912-0.351 1.258-0.005L9.873 9.403c0.346 0.346 0.341 0.912-0.005 1.258c-0.346 0.346-0.912 0.351-1.258 0.005L0.387 2.444C0.041 2.098 0.046 1.532 0.392 1.186Z"/>
          <path d="M8.609 1.181c0.346-0.346 0.912-0.341 1.258 0.005c0.346 0.346 0.351 0.912 0.005 1.258L1.65 10.667C1.304 11.013 0.738 11.008 0.392 10.662C0.046 10.316 0.041 9.749 0.387 9.403L8.609 1.181Z"/>
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
        color: '#4D6EA9',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(32,145,246,0.08)'
        e.currentTarget.style.color = '#7DAFDB'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = '#4D6EA9'
      }}
    >
      {children}
    </button>
  )
}
