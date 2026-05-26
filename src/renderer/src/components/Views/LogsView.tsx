import React, { useState } from 'react'
import { useAppStore } from '../../store/appStore'

export default function LogsView(): React.ReactElement {
  const { connectionLogs, setConnectionLogs } = useAppStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const toggleBookmark = (id: string) => {
    setConnectionLogs(connectionLogs.map(l =>
      l.id === id ? { ...l, bookmarked: !l.bookmarked } : l
    ))
  }

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: 'column' }}>
      {/* Column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '160px 240px 1fr 80px',
        padding: '8px 16px',
        borderBottom: '1px solid var(--border-light)',
        background: 'var(--bg-sidebar)',
        flexShrink: 0,
      }}>
        {['Date', 'User', 'Host', 'Saved'].map(col => (
          <div
            key={col}
            style={{
              fontSize: '11px', fontWeight: 600, letterSpacing: '.04em',
              color: 'var(--text-muted)', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer',
            }}
          >
            {col}
            {col === 'Date' && (
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M6 3v6M3 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {connectionLogs.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '10px', color: 'var(--text-muted)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4 }}>
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            <p style={{ fontSize: '13px' }}>No connection logs yet</p>
          </div>
        )}

        {connectionLogs.map(log => {
          const isSelected = selectedId === log.id
          const dateObj = new Date(log.date)
          const endDate = new Date(log.date + log.duration * 1000)

          const formatTime = (d: Date) =>
            d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
          const formatDate = (d: Date) =>
            d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

          const durationSameDay = dateObj.toDateString() === endDate.toDateString()
          const timeRange = `${formatTime(dateObj)} – ${formatTime(endDate)}${!durationSameDay ? ' (+1d)' : ''}`

          return (
            <div
              key={log.id}
              onClick={() => setSelectedId(isSelected ? null : log.id)}
              style={{
                display: 'grid',
                gridTemplateColumns: '160px 240px 1fr 80px',
                padding: '10px 16px',
                borderBottom: '1px solid rgba(30,45,69,0.5)',
                alignItems: 'center',
                cursor: 'pointer',
                background: isSelected ? 'var(--bg-panel)' : 'transparent',
                transition: 'background .12s',
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(17,24,39,0.5)' }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
            >
              {/* Date */}
              <div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-primary)', fontWeight: 500 }}>
                  {formatDate(dateObj)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: '"JetBrains Mono", monospace' }}>
                  {timeRange}
                </div>
              </div>

              {/* User */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                  background: 'var(--host-generic)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700, color: '#93c5fd',
                }}>
                  {log.userEmail[0].toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.userEmail}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: '"JetBrains Mono", monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.userIp} · {log.deviceName}
                  </div>
                </div>
              </div>

              {/* Host */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0,
                  background: '#e95420',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <circle cx="12" cy="12" r="3.5" fill="white"/>
                    <circle cx="12" cy="2" r="2" fill="white"/>
                    <circle cx="20.8" cy="17" r="2" fill="white"/>
                    <circle cx="3.2" cy="17" r="2" fill="white"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{log.hostLabel}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ssh, {log.hostUsername}</div>
                </div>
              </div>

              {/* Bookmark */}
              <div>
                <button
                  onClick={e => { e.stopPropagation(); toggleBookmark(log.id) }}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: log.bookmarked ? '#93c5fd' : 'var(--text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#93c5fd' }}
                  onMouseLeave={e => { if (!log.bookmarked) e.currentTarget.style.color = 'var(--text-muted)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M4 2h8a1 1 0 011 1v10.5l-5-3-5 3V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill={log.bookmarked ? 'currentColor' : 'none'}/>
                  </svg>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
