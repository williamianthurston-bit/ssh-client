import React from 'react'

export default function PortForwardingView(): React.ReactElement {
  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 16px',
        borderBottom: '1px solid var(--border-light)',
        background: 'var(--bg-sidebar)', flexShrink: 0,
      }}>
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '6px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 500,
            background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.5)',
            color: '#93c5fd',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.25)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.15)' }}
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          New rule
        </button>
      </div>

      {/* Empty state */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '10px', color: 'var(--text-muted)',
      }}>
        <div style={{ fontSize: '32px', opacity: 0.4 }}>⇄</div>
        <p style={{ fontSize: '13px' }}>No port forwarding rules configured</p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', opacity: 0.7 }}>
          Create a rule to forward local or remote ports
        </p>
      </div>
    </div>
  )
}
