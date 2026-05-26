import React from 'react'
import { useAppStore, NavView } from '../../store/appStore'

interface NavItem {
  view: NavView
  label: string
  icon: React.ReactNode
}

/* Termius-exact filled SVG icons */
const NAV_ITEMS: NavItem[] = [
  {
    view: 'hosts', label: 'Hosts',
    icon: (
      /* Termius server/host icon — rack with LED dots */
      <svg width="16" height="16" viewBox="0 0 21 20" fill="currentColor">
        <path d="M0,1.997C0,0.894,0.902,0,1.995,0H19.005C20.107,0,21,0.896,21,1.997V9H0V1.997ZM15,7c1.105,0,2-0.895,2-2s-0.895-2-2-2-2,0.895-2,2,0.895,2,2,2ZM6,3v3c0,0.556,0.448,1,1,1s1-0.448,1-1V3c0-0.556-0.448-1-1-1S6,2.448,6,3ZM3,3v3c0,0.556,0.448,1,1,1s1-0.448,1-1V3c0-0.556-0.448-1-1-1S3,2.448,3,3ZM9,3v3c0,0.556,0.448,1,1,1s1-0.448,1-1V3c0-0.556-0.448-1-1-1S9,2.448,9,3Z"/>
        <path d="M0,11H21v7.003C21,19.106,20.098,20,19.005,20H1.995C0.893,20,0,19.104,0,18.003V11ZM15,17c1.105,0,2-0.895,2-2s-0.895-2-2-2-2,0.895-2,2,0.895,2,2,2ZM9,14v3c0,0.556,0.448,1,1,1s1-0.448,1-1v-3c0-0.556-0.448-1-1-1S9,13.448,9,14ZM3,14v3c0,0.556,0.448,1,1,1s1-0.448,1-1v-3c0-0.556-0.448-1-1-1S3,13.448,3,14ZM6,14v3c0,0.556,0.448,1,1,1s1-0.448,1-1v-3c0-0.556-0.448-1-1-1S6,13.448,6,14Z"/>
      </svg>
    )
  },
  {
    view: 'keychain', label: 'Keychain',
    icon: (
      /* Termius key icon shape */
      <svg width="16" height="16" viewBox="0 0 18 20" fill="currentColor">
        <path fillRule="evenodd" clipRule="evenodd" d="M9 0a5 5 0 100 10A5 5 0 009 0zM6 5a3 3 0 116 0A3 3 0 016 5z"/>
        <path d="M8 9h2v2.5l2 1.5-2 1.5V17l-1 1-1-1v-1.5L4 14l4-3V9z"/>
      </svg>
    )
  },
  {
    view: 'portfwd', label: 'Port Forwarding',
    icon: (
      /* Termius port-forwarding icon — two arrow shapes */
      <svg width="16" height="14" viewBox="0 0 14 12" fill="currentColor">
        <path d="M3.254,8.922H0.31C0.203,8.922,0.104,8.865,0.047,8.77C-0.009,8.676,-0.015,8.557,0.031,8.457L2.2,3.752C2.251,3.64,2.36,3.569,2.479,3.569H5.423C5.529,3.569,5.628,3.626,5.685,3.721C5.742,3.815,5.748,3.934,5.702,4.034L3.533,8.738C3.481,8.851,3.372,8.922,3.254,8.922Z"/>
        <path d="M8.211,11.869C8.174,11.869,8.136,11.862,8.1,11.847C7.98,11.799,7.901,11.679,7.901,11.544V9.084H4.648C4.542,9.084,4.443,9.028,4.387,8.934C4.33,8.84,4.322,8.723,4.367,8.623L6.536,3.756C6.587,3.642,6.696,3.569,6.817,3.569H7.747V0.324C7.747,0.191,7.825,0.071,7.943,0.022C8.062,-0.026,8.197,0.006,8.284,0.104L13.254,5.728C13.364,5.851,13.364,6.041,13.257,6.165L8.442,11.762C8.381,11.831,8.298,11.869,8.211,11.869Z"/>
      </svg>
    )
  },
  {
    view: 'snippets', label: 'Snippets',
    icon: (
      /* Terminal prompt chevron + underscore */
      <svg width="16" height="11" viewBox="0 0 12 8" fill="currentColor">
        <path d="M1.117,7.714C0.988,7.714,0.859,7.663,0.763,7.562C0.577,7.366,0.584,7.057,0.779,6.871L3.793,4L0.779,1.13C0.584,0.943,0.577,0.634,0.763,0.438C0.949,0.243,1.258,0.235,1.454,0.421L4.839,3.646C4.936,3.739,4.991,3.867,4.991,4C4.991,4.134,4.936,4.262,4.839,4.354L1.454,7.579C1.36,7.669,1.238,7.714,1.117,7.714Z"/>
        <path d="M10.911,7.714H6.075C5.821,7.714,5.614,7.507,5.614,7.253C5.614,6.999,5.821,6.793,6.075,6.793H10.911C11.166,6.793,11.372,6.999,11.372,7.253C11.372,7.507,11.166,7.714,10.911,7.714Z"/>
      </svg>
    )
  },
  {
    view: 'knownhosts', label: 'Known Hosts',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    )
  },
  {
    view: 'logs', label: 'Logs',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
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
        width: '52px',
        flexShrink: 0,
        background: '#060A1D',
        borderRight: '1px solid #0F2040',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '52px', /* below titlebar */
        paddingBottom: '8px',
        gap: '2px',
      }}
    >
      {NAV_ITEMS.map(item => {
        const isActive = activeNav === item.view
        return (
          <button
            key={item.view}
            title={item.label}
            onClick={() => setCurrentView(item.view)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isActive ? '#2091F6' : '#4D6EA9',
              background: isActive ? 'rgba(32,145,246,0.12)' : 'transparent',
              transition: 'background .12s, color .12s',
              position: 'relative',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.background = 'rgba(32,145,246,0.08)'
                e.currentTarget.style.color = '#7DAFDB'
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#4D6EA9'
              }
            }}
          >
            {item.icon}
            {/* Termius-style active indicator dot on left edge */}
            {isActive && (
              <span style={{
                position: 'absolute',
                left: '-1px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '3px',
                height: '18px',
                borderRadius: '0 3px 3px 0',
                background: '#2091F6',
              }} />
            )}
          </button>
        )
      })}
    </nav>
  )
}
