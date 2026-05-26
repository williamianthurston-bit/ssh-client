import React from 'react'
import { useAppStore } from '../../store/appStore'

export default function KnownHostsView(): React.ReactElement {
  const { knownHosts } = useAppStore()

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 16px',
        borderBottom: '1px solid var(--border-light)',
        background: 'var(--bg-sidebar)', flexShrink: 0,
      }}>
        <ToolBtn>Import</ToolBtn>
        <div style={{ flex: 1 }} />
        <IconBtn title="Search">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </IconBtn>
        <IconBtn title="Grid view">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="9" y="2" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="2" y="9" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="9" y="9" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </IconBtn>
        <IconBtn title="List view">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </IconBtn>
      </div>

      {/* Section label */}
      <div style={{
        padding: '12px 16px 6px',
        fontSize: '11px', fontWeight: 600,
        letterSpacing: '.06em', color: 'var(--text-muted)',
        textTransform: 'uppercase',
      }}>
        Known Hosts
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '10px',
        padding: '0 16px 16px',
        overflowY: 'auto', flex: 1,
      }}>
        {knownHosts.length === 0 && (
          <div style={{
            gridColumn: '1 / -1',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            height: '200px', gap: '10px', color: 'var(--text-muted)',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4 }}>
              <path d="M12 2C7 5 3 8 3 13a9 9 0 0018 0c0-5-4-8-9-11z"/>
            </svg>
            <p style={{ fontSize: '13px' }}>No known hosts yet</p>
          </div>
        )}

        {knownHosts.map(kh => (
          <div
            key={kh.ip}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 13px', borderRadius: '9px',
              background: 'var(--bg-panel)', border: '1px solid #1a2540',
              cursor: 'pointer', transition: 'background .15s, border-color .15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--bg-card)'
              e.currentTarget.style.borderColor = '#2a3d60'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--bg-panel)'
              e.currentTarget.style.borderColor = '#1a2540'
            }}
          >
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'var(--host-generic)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C7 5 3 8 3 13a9 9 0 0018 0c0-5-4-8-9-11z" stroke="#93c5fd" strokeWidth="1.6" strokeLinejoin="round"/>
                <path d="M12 10a2 2 0 100 4 2 2 0 000-4z" fill="#93c5fd"/>
              </svg>
            </div>
            <span style={{
              fontSize: '12.5px', fontWeight: 500,
              fontFamily: '"JetBrains Mono", monospace',
              color: 'var(--text-primary)',
            }}>
              {kh.ip}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ToolBtn({ children }: { children: React.ReactNode }) {
  const [hov, setHov] = React.useState(false)
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '6px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 500,
        background: hov ? 'var(--bg-hover)' : 'var(--bg-card)',
        border: '1px solid var(--border)',
        color: 'var(--text-secondary)',
      }}
    >
      {children}
    </button>
  )
}

function IconBtn({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <button title={title} style={{ width: '30px', height: '30px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: 'transparent' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-primary)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
    >
      {children}
    </button>
  )
}
