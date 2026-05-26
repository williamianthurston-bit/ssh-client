import React, { useEffect, useRef, useCallback } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'
import { Session, useAppStore } from '../../store/appStore'

interface Props {
  session: Session
}

export default function TerminalView({ session }: Props): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const { setSessionStatus, toggleSFTP } = useAppStore()

  const initTerminal = useCallback(() => {
    if (!containerRef.current || termRef.current) return

    const term = new Terminal({
      theme: {
        background: '#0D0D1A',
        foreground: '#E4E6F0',
        cursor: '#6E3FC5',
        cursorAccent: '#1C1C2E',
        selectionBackground: 'rgba(110, 63, 197, 0.35)',
        black: '#13131F',
        red: '#E05D5D',
        green: '#4CAF82',
        yellow: '#F5A623',
        blue: '#5B8AF0',
        magenta: '#C678DD',
        cyan: '#56B6C2',
        white: '#E4E6F0',
        brightBlack: '#5C6370',
        brightRed: '#E06C75',
        brightGreen: '#98C379',
        brightYellow: '#E5C07B',
        brightBlue: '#61AFEF',
        brightMagenta: '#C678DD',
        brightCyan: '#56B6C2',
        brightWhite: '#FFFFFF'
      },
      fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
      fontSize: 14,
      lineHeight: 1.4,
      cursorStyle: 'bar',
      cursorBlink: true,
      scrollback: 10000,
      allowTransparency: true,
      convertEol: false
    })

    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()

    term.loadAddon(fitAddon)
    term.loadAddon(webLinksAddon)

    term.open(containerRef.current)
    fitAddon.fit()

    termRef.current = term
    fitAddonRef.current = fitAddon

    // Send keystroke data to SSH
    const disposeData = term.onData((data) => {
      if (session.status === 'connected') {
        window.api.ssh.write(session.tabId, data)
      }
    })

    // Receive SSH data → write to terminal
    const unsubData = window.api.ssh.onData(session.tabId, (chunk: string) => {
      term.write(chunk)
    })

    // Handle connection closed
    const unsubClosed = window.api.ssh.onClosed(session.tabId, (msg: string) => {
      term.writeln('')
      term.writeln(`\x1b[33m[${msg}]\x1b[0m`)
      setSessionStatus(session.tabId, 'disconnected')
    })

    // Write connecting message
    if (session.status === 'connecting') {
      term.writeln(`\x1b[36mConnecting to ${session.host}…\x1b[0m`)
    }

    cleanupRef.current = () => {
      disposeData.dispose()
      unsubData()
      unsubClosed()
      term.dispose()
      termRef.current = null
    }
  }, [session.tabId])

  // Mount terminal
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const t = setTimeout(initTerminal, 50)
    return () => {
      clearTimeout(t)
      cleanupRef.current?.()
      cleanupRef.current = null
    }
  }, [initTerminal])

  // Update status message
  useEffect(() => {
    if (!termRef.current) return
    if (session.status === 'connected') {
      // Clear connecting message when connected
    } else if (session.status === 'error') {
      termRef.current.writeln(`\x1b[31m[Error: ${session.errorMsg}]\x1b[0m`)
    }
  }, [session.status])

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(() => {
      if (fitAddonRef.current && termRef.current) {
        try {
          fitAddonRef.current.fit()
          const { rows, cols } = termRef.current
          window.api.ssh.resize(session.tabId, rows, cols)
        } catch (_) { /* ignore during unmount */ }
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [session.tabId])

  const isBusy = session.status === 'connecting'
  const isError = session.status === 'error'

  return (
    <div className="relative h-full" style={{ background: 'var(--bg-terminal)' }}>
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-1.5 border-b"
        style={{ background: 'rgba(13,13,26,0.8)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: session.status === 'connected' ? 'var(--success)'
                : session.status === 'connecting' ? 'var(--warning)'
                : session.status === 'error' ? 'var(--error)'
                : 'var(--text-muted)',
              boxShadow: session.status === 'connected' ? '0 0 6px var(--success)' : 'none'
            }}
          />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {session.label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* SFTP toggle */}
          <button
            title="Toggle SFTP"
            onClick={() => toggleSFTP(session.tabId)}
            className="flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all"
            style={{ color: 'var(--text-muted)', background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-light)'; e.currentTarget.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            SFTP
          </button>
        </div>
      </div>

      {/* Terminal container */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ top: '36px' }}
      />

      {/* Connecting overlay */}
      {isBusy && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ top: '36px', background: 'rgba(13,13,26,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Connecting to {session.host}…</span>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {isError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ top: '36px', background: 'rgba(13,13,26,0.85)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(224,93,93,0.15)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--error)' }}>
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <p className="text-sm" style={{ color: 'var(--error)' }}>Connection failed</p>
          <p className="text-xs max-w-xs text-center" style={{ color: 'var(--text-muted)' }}>{session.errorMsg}</p>
        </div>
      )}
    </div>
  )
}
