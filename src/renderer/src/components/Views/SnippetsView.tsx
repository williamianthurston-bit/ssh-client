import React from 'react'
import { useAppStore } from '../../store/appStore'

export default function SnippetsView(): React.ReactElement {
  const { snippets } = useAppStore()

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
          New snippet
        </button>
      </div>

      {snippets.length === 0 ? (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '10px', color: 'var(--text-muted)',
        }}>
          <div style={{ fontSize: '28px', opacity: 0.4, fontFamily: '"JetBrains Mono", monospace' }}>{'{ }'}</div>
          <p style={{ fontSize: '13px' }}>No snippets yet</p>
          <p style={{ fontSize: '12px', opacity: 0.7 }}>Save reusable commands here for quick access</p>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {snippets.map(s => (
            <div
              key={s.id}
              style={{
                padding: '12px 14px', borderRadius: '9px',
                background: 'var(--bg-panel)', border: '1px solid #1a2540',
                cursor: 'pointer', transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = '#2a3d60' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-panel)'; e.currentTarget.style.borderColor = '#1a2540' }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: '"JetBrains Mono", monospace', marginTop: '4px' }}>
                {s.command}
              </div>
              {s.description && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.description}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
