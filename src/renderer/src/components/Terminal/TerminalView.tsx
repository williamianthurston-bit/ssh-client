import React, { useEffect, useRef, useCallback } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'
import { Session, useAppStore } from '../../store/appStore'
import { getTheme } from '../../lib/terminalThemes'
import ThemesPanel from './ThemesPanel'

interface Props { session: Session }

export default function TerminalView({ session }: Props): React.ReactElement {
  const containerRef  = useRef<HTMLDivElement>(null)
  const termRef       = useRef<Terminal | null>(null)
  const fitRef        = useRef<FitAddon | null>(null)
  const cleanupRef    = useRef<(() => void) | null>(null)

  const {
    setSessionStatus, toggleSFTP,
    setSessionTheme, settings,
    themesPanelOpen, setThemesPanelOpen,
  } = useAppStore()

  /* ── Mount terminal ── */
  const initTerminal = useCallback(() => {
    if (!containerRef.current || termRef.current) return

    const term = new Terminal({
      theme: getTheme(session.theme || settings.terminalTheme),
      fontFamily: settings.fontFamily,
      fontSize: settings.fontSize,
      lineHeight: 1.65,
      cursorStyle: settings.cursorStyle,
      cursorBlink: true,
      scrollback: 10000,
      allowTransparency: true,
      convertEol: false,
      macOptionIsMeta: true,
    })

    const fit = new FitAddon()
    term.loadAddon(fit)
    term.loadAddon(new WebLinksAddon())
    term.open(containerRef.current)
    fit.fit()

    termRef.current = term
    fitRef.current  = fit

    const disposeData = term.onData(data => {
      if (session.status === 'connected') {
        window.api?.ssh?.write(session.tabId, data)
      }
    })

    const unsubData = window.api?.ssh?.onData(session.tabId, (chunk: string) => {
      term.write(chunk)
    }) ?? (() => {})

    const unsubClosed = window.api?.ssh?.onClosed(session.tabId, (msg: string) => {
      term.writeln(`\r\n\x1b[33m[${msg}]\x1b[0m`)
      setSessionStatus(session.tabId, 'disconnected')
    }) ?? (() => {})

    if (session.status === 'connecting') {
      term.writeln(`\x1b[2mConnecting to ${session.host}…\x1b[0m`)
    }

    cleanupRef.current = () => {
      disposeData.dispose()
      unsubData()
      unsubClosed()
      term.dispose()
      termRef.current = null
    }
  }, [session.tabId])

  useEffect(() => {
    const t = setTimeout(initTerminal, 30)
    return () => {
      clearTimeout(t)
      cleanupRef.current?.()
      cleanupRef.current = null
    }
  }, [initTerminal])

  /* ── Error messages ── */
  useEffect(() => {
    if (!termRef.current || session.status !== 'error') return
    termRef.current.writeln(`\r\n\x1b[31m[Error: ${session.errorMsg}]\x1b[0m`)
  }, [session.status])

  /* ── Resize observer ── */
  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(() => {
      try {
        fitRef.current?.fit()
        const { rows, cols } = termRef.current ?? {}
        if (rows && cols) window.api?.ssh?.resize(session.tabId, rows, cols)
      } catch {}
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [session.tabId])

  /* ── Live theme switch ── */
  useEffect(() => {
    if (termRef.current?.options) {
      termRef.current.options.theme = getTheme(session.theme)
    }
  }, [session.theme])

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: 'var(--bg-terminal)' }}>
      {/* xterm area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <div ref={containerRef} style={{ flex: 1, position: 'relative' }} />

        {/* Connecting overlay */}
        {session.status === 'connecting' && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(11,15,28,0.85)', backdropFilter: 'blur(4px)',
          }}>
            <ConnectingCard session={session} />
          </div>
        )}

        {/* Error overlay */}
        {session.status === 'error' && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '12px',
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(239,68,68,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#ef4444' }}>Connection failed</p>
              <p style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                {session.errorMsg}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Themes panel (slides in) */}
      {themesPanelOpen && (
        <ThemesPanel tabId={session.tabId} currentTheme={session.theme} />
      )}

      {/* Right icon bar */}
      <div style={{
        width: '44px', flexShrink: 0,
        background: 'var(--bg-sidebar)',
        borderLeft: '1px solid var(--border-light)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: '10px 0', gap: '6px',
      }}>
        <RightBtn title="Navigation" active onClick={() => {}}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </RightBtn>
        <RightBtn title="Code mode" onClick={() => {}}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M5 5l-3 3 3 3M11 5l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </RightBtn>
        <RightBtn title="Help" onClick={() => {}}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M7 6.5C7 5.7 7.7 5 8.5 5S10 5.7 10 6.5c0 .6-.4 1.1-.9 1.4L8 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <circle cx="8" cy="11" r=".8" fill="currentColor"/>
          </svg>
        </RightBtn>
        <RightBtn
          title="Themes"
          active={themesPanelOpen}
          onClick={() => setThemesPanelOpen(!themesPanelOpen)}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 5.5a2.5 2.5 0 11-1.77 4.27" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </RightBtn>
        <RightBtn title="SFTP" onClick={() => toggleSFTP(session.tabId)}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </RightBtn>
      </div>
    </div>
  )
}

/* ── Connecting card ── */
function ConnectingCard({ session }: { session: Session }) {
  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '20px 24px',
      display: 'flex', flexDirection: 'column', gap: '14px',
      width: '340px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '9px',
            background: '#e95420',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <circle cx="12" cy="12" r="4" fill="white"/>
              <circle cx="12" cy="2" r="2.5" fill="white"/>
              <circle cx="20.8" cy="17" r="2.5" fill="white"/>
              <circle cx="3.2" cy="17" r="2.5" fill="white"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {session.label}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: '"JetBrains Mono", monospace' }}>
              SSH {session.host}:22
            </div>
          </div>
        </div>
        <button style={{
          padding: '6px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 500,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          color: 'var(--text-secondary)',
        }}>
          Show logs
        </button>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
          border: '2.5px solid var(--border)', borderTopColor: 'var(--accent)',
          animation: 'spin 0.7s linear infinite',
        }} />
        <div style={{
          flex: 1, height: '3px',
          background: 'var(--border)', borderRadius: '99px', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: '65%',
            background: 'linear-gradient(to right, var(--accent), #60a5fa)',
            borderRadius: '99px',
            animation: 'progressPulse 1.5s ease-in-out infinite',
          }} />
        </div>
        <div style={{
          width: '28px', height: '28px', borderRadius: '7px',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0,
        }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M3 5l3 3-3 3M9 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <button style={{
        padding: '7px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 500,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        color: 'var(--text-secondary)', alignSelf: 'flex-start',
        cursor: 'pointer',
      }}>
        Cancel
      </button>
    </div>
  )
}

function RightBtn({ children, title, active, onClick }: {
  children: React.ReactNode; title: string; active?: boolean; onClick: () => void
}) {
  const [hovered, setHovered] = React.useState(false)
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '30px', height: '30px', borderRadius: '7px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hovered ? 'var(--bg-card)' : 'transparent',
        color: active ? 'var(--accent)' : hovered ? 'var(--text-primary)' : 'var(--text-muted)',
        transition: 'background .12s, color .12s',
      }}
    >
      {children}
    </button>
  )
}
