import React from 'react'
import { useAppStore, NavView } from '../../store/appStore'

interface NavItem {
  view: NavView
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  {
    view: 'hosts', label: 'Hosts',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="3" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 13h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 12v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    view: 'keychain', label: 'Keychain',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8.5 8.5l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    view: 'portfwd', label: 'Port Forwarding',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M2 8h12M10 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    view: 'snippets', label: 'Snippets',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M4 5h8M4 8h6M4 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    view: 'knownhosts', label: 'Known Hosts',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M8 2C5 5 2 7 2 10a6 6 0 0012 0c0-3-3-5-6-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    view: 'logs', label: 'Logs',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
]

export default function NavSidebar(): React.ReactElement {
  const { currentView, setCurrentView } = useAppStore()

  /* Treat 'terminal' as 'hosts' for nav highlight purposes */
  const activeNav = currentView === 'terminal' ? 'hosts' : currentView

  return (
    <nav
      style={{
        width: '160px',
        flexShrink: 0,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        padding: '10px 8px',
        gap: '2px',
      }}
    >
      {NAV_ITEMS.map(item => {
        const isActive = activeNav === item.view
        return (
          <button
            key={item.view}
            onClick={() => setCurrentView(item.view)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 10px',
              borderRadius: '7px',
              fontSize: '12.5px',
              fontWeight: 500,
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: isActive ? 'var(--bg-panel)' : 'transparent',
              transition: 'background .12s, color .12s',
              textAlign: 'left',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.background = 'var(--bg-card)'
                e.currentTarget.style.color = 'var(--text-primary)'
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }
            }}
          >
            <span style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.label}
            </span>
            {isActive && (
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
            )}
          </button>
        )
      })}
    </nav>
  )
}
