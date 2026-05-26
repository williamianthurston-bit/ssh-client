import React, { useState, useRef, useEffect } from 'react'
import { useAppStore } from '../../store/appStore'

export default function QuickConnect(): React.ReactElement {
  const { setShowQuickConnect, openSession, setSessionStatus } = useAppStore()
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { ref.current?.focus() }, [])

  const parse = (raw: string) => {
    const m = raw.match(/^(?:([^@]+)@)?([^:]+)(?::(\d+))?$/)
    if (!m) return null
    return { username: m[1] || 'root', host: m[2], port: parseInt(m[3] || '22', 10) }
  }

  const connect = async () => {
    const parsed = parse(value.trim())
    if (!parsed) { setError('Format: user@host or user@host:port'); return }
    setLoading(true); setError('')
    const fakeHost: any = { id: `qc-${Date.now()}`, groupId: null, label: `${parsed.username}@${parsed.host}`, ...parsed, authType: 'agent', createdAt: Date.now() }
    const tabId = openSession(fakeHost)
    setShowQuickConnect(false)
    try {
      await window.api?.ssh?.connect({ tabId, ...parsed, authType: 'agent', rows: 24, cols: 80 })
      setSessionStatus(tabId, 'connected')
    } catch (err: any) { setSessionStatus(tabId, 'error', err.message) }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop" onClick={() => setShowQuickConnect(false)}>
      <div className="w-[400px] rounded-2xl p-5 anim-modal"
           style={{ background: 'var(--bg-modal)', border: '1px solid var(--border-light)', boxShadow: '0 24px 80px rgba(0,0,0,0.7)' }}
           onClick={e => e.stopPropagation()}>
        <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Quick Connect</h2>
        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>Connect without saving. Uses SSH agent auth.</p>

        <input ref={ref} type="text" placeholder="user@hostname:22"
          value={value} onChange={e => { setValue(e.target.value); setError('') }}
          onKeyDown={e => { if (e.key === 'Enter') connect(); if (e.key === 'Escape') setShowQuickConnect(false) }}
          className="w-full px-3 py-2.5 rounded-lg text-sm font-mono mb-3"
          style={{ background: 'var(--bg-input)', border: `1px solid ${error ? 'var(--error)' : 'var(--border)'}`, color: 'var(--text-primary)' }}
        />
        {error && <p className="text-xs mb-3" style={{ color: 'var(--error)' }}>{error}</p>}

        <div className="flex gap-2 justify-end">
          <button onClick={() => setShowQuickConnect(false)} className="px-4 py-2 rounded-lg text-xs" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Cancel</button>
          <button onClick={connect} disabled={loading || !value.trim()} className="px-4 py-2 rounded-lg text-xs font-medium" style={{ background: 'var(--accent)', color: 'white', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Connecting…' : 'Connect'}
          </button>
        </div>
      </div>
    </div>
  )
}
