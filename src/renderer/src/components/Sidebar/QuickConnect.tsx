import React, { useState, useRef, useEffect } from 'react'
import { useAppStore } from '../../store/appStore'

export default function QuickConnect(): React.ReactElement {
  const { setShowQuickConnect, openSession, setSessionStatus } = useAppStore()
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const parse = (raw: string) => {
    // Formats: user@host, user@host:port, host, host:port
    const match = raw.match(/^(?:([^@]+)@)?([^:]+)(?::(\d+))?$/)
    if (!match) return null
    return {
      username: match[1] || 'root',
      host: match[2],
      port: parseInt(match[3] || '22', 10)
    }
  }

  const connect = async () => {
    const parsed = parse(value.trim())
    if (!parsed) { setError('Format: user@host:port'); return }

    const fakeHost = {
      id: `quick-${Date.now()}`,
      groupId: null,
      label: `${parsed.username}@${parsed.host}`,
      host: parsed.host,
      port: parsed.port,
      username: parsed.username,
      authType: 'agent' as const,
      createdAt: Date.now()
    }

    setLoading(true)
    setError('')
    const tabId = openSession(fakeHost)
    setShowQuickConnect(false)

    try {
      await window.api.ssh.connect({
        tabId,
        host: fakeHost.host,
        port: fakeHost.port,
        username: fakeHost.username,
        authType: 'agent',
        rows: 24, cols: 80
      })
      setSessionStatus(tabId, 'connected')
    } catch (err: any) {
      setSessionStatus(tabId, 'error', err.message)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop" onClick={() => setShowQuickConnect(false)}>
      <div
        className="rounded-xl p-5 w-96 animate-fade-in"
        style={{ background: 'var(--modal-bg)', border: '1px solid var(--border)', boxShadow: 'var(--modal-shadow, 0 25px 60px rgba(0,0,0,0.6))' }}
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Connect</h2>

        <input
          ref={inputRef}
          type="text"
          placeholder="user@hostname:22"
          value={value}
          onChange={e => { setValue(e.target.value); setError('') }}
          onKeyDown={e => { if (e.key === 'Enter') connect(); if (e.key === 'Escape') setShowQuickConnect(false) }}
          className="w-full px-3 py-2.5 rounded-lg text-sm font-mono mb-3"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${error ? 'var(--error)' : 'var(--border)'}`,
            color: 'var(--text-primary)'
          }}
        />

        {error && <p className="text-xs mb-3" style={{ color: 'var(--error)' }}>{error}</p>}

        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setShowQuickConnect(false)}
            className="px-4 py-2 rounded-lg text-xs transition-colors"
            style={{ background: 'var(--border)', color: 'var(--text-muted)' }}
          >
            Cancel
          </button>
          <button
            onClick={connect}
            disabled={loading || !value.trim()}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
            style={{ background: 'var(--accent)', color: 'white', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Connecting…' : 'Connect'}
          </button>
        </div>
      </div>
    </div>
  )
}
