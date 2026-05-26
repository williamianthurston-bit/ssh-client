import React from 'react'
import { useAppStore } from '../../store/appStore'
import { TERMINAL_THEMES } from '../../lib/terminalThemes'

interface Props { tabId: string; currentTheme: string }

export default function ThemesPanel({ tabId, currentTheme }: Props): React.ReactElement {
  const { setSessionTheme } = useAppStore()

  return (
    <div
      className="anim-slide"
      style={{
        width: '220px', flexShrink: 0,
        background: 'var(--bg-sidebar)',
        borderLeft: '1px solid var(--border-light)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Font section header */}
      <div style={{
        padding: '12px 14px 4px',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{
          fontSize: '11px', fontWeight: 600,
          color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em',
        }}>
          Font
        </div>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--text-muted)' }}>
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Themes label */}
      <div style={{
        padding: '10px 14px 4px',
        fontSize: '11px', fontWeight: 600,
        color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em',
      }}>
        Themes
      </div>

      {/* Theme list */}
      {TERMINAL_THEMES.map(t => {
        const isActive = t.key === currentTheme
        return (
          <ThemeItem
            key={t.key}
            label={t.label}
            bg={t.theme.background as string}
            accent={t.theme.cursor as string}
            isActive={isActive}
            stars={t.stars}
            isNew={t.isNew}
            onClick={() => setSessionTheme(tabId, t.key)}
          />
        )
      })}
    </div>
  )
}

function ThemeItem({
  label, bg, accent, isActive, stars, isNew, onClick,
}: {
  label: string; bg: string; accent: string; isActive: boolean;
  stars?: number; isNew?: boolean; onClick: () => void
}) {
  const [hovered, setHovered] = React.useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '9px 14px',
        background: isActive ? 'var(--bg-panel)' : hovered ? 'var(--bg-card)' : 'transparent',
        border: 'none', width: '100%', textAlign: 'left',
        cursor: 'pointer', transition: 'background .12s',
      }}
    >
      {/* Thumbnail */}
      <div style={{
        width: '44px', height: '28px', borderRadius: '5px', overflow: 'hidden',
        border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
        flexShrink: 0, position: 'relative', background: bg,
      }}>
        <div style={{
          height: '8px', background: 'rgba(255,255,255,0.08)',
          margin: '4px 4px 2px', borderRadius: '2px',
        }} />
        <div style={{
          height: '4px', width: '60%',
          background: accent || '#3b82f6',
          margin: '0 4px', borderRadius: '2px',
        }} />
      </div>

      {/* Label + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '12.5px', fontWeight: 500,
          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {label}
        </div>
        {(stars !== undefined || isNew) && (
          <div style={{ fontSize: '11px', color: isNew ? 'var(--accent-green)' : 'var(--text-muted)', marginTop: '1px' }}>
            {isNew ? 'new' : `⭐ ${stars!.toLocaleString()}`}
          </div>
        )}
      </div>

      {isActive && (
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--accent)', flexShrink: 0 }}>
          <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  )
}
