import React, { useState } from 'react'
import { useAppStore, StoredKey } from '../../store/appStore'

export default function KeyManagerModal(): React.ReactElement {
  const { keys, setKeys, setShowKeyManager } = useAppStore()
  const [tab, setTab] = useState<'list' | 'paste'>('list')
  const [keyName, setKeyName] = useState('')
  const [keyText, setKeyText] = useState('')
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')

  const close = () => setShowKeyManager(false)

  const importFromFile = async () => {
    setImporting(true)
    setError('')
    try {
      const key = await window.api.keys.importFile()
      setKeys([...keys, key])
      setTab('list')
    } catch (err: any) {
      if (err.message !== 'Cancelled') setError(err.message)
    }
    setImporting(false)
  }

  const importFromText = async () => {
    if (!keyName.trim()) { setError('Key name is required'); return }
    if (!keyText.trim()) { setError('Key content is required'); return }
    setImporting(true)
    setError('')
    try {
      const key = await window.api.keys.importText(keyName.trim(), keyText.trim())
      setKeys([...keys, key])
      setTab('list')
      setKeyName('')
      setKeyText('')
    } catch (err: any) {
      setError(err.message)
    }
    setImporting(false)
  }

  const deleteKey = async (id: string, name: string) => {
    if (!confirm(`Delete key "${name}"?`)) return
    await window.api.keys.delete(id)
    setKeys(keys.filter(k => k.id !== id))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop" onClick={close}>
      <div
        className="rounded-xl w-[480px] animate-fade-in overflow-hidden"
        style={{ background: 'var(--modal-bg)', border: '1px solid var(--border)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>SSH Keys</h2>
          </div>
          <button onClick={close} className="w-6 h-6 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
          {(['list', 'paste'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError('') }}
              className="px-5 py-2.5 text-xs font-medium border-b-2 transition-all"
              style={{
                borderColor: tab === t ? 'var(--accent)' : 'transparent',
                color: tab === t ? 'var(--accent)' : 'var(--text-muted)'
              }}
            >
              {t === 'list' ? 'Stored Keys' : 'Paste / Import'}
            </button>
          ))}
        </div>

        <div className="px-5 py-4" style={{ minHeight: '200px' }}>
          {tab === 'list' ? (
            <>
              {keys.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-8">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                    </svg>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No keys stored yet</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {keys.map(key => (
                    <div
                      key={key.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--accent-light)' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
                          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{key.name}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Added {new Date(key.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteKey(key.id, key.name)}
                        className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(224,93,93,0.15)'; e.currentTarget.style.color = 'var(--error)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={importFromFile}
                disabled={importing}
                className="w-full mt-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all"
                style={{ border: '1px dashed var(--border)', color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {importing ? 'Importing…' : 'Import from file…'}
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Key Name</label>
                <input
                  type="text" placeholder="id_ed25519"
                  value={keyName} onChange={e => { setKeyName(e.target.value); setError('') }}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${error && !keyName ? 'var(--error)' : 'var(--border)'}`, color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Private Key Content</label>
                <textarea
                  placeholder="-----BEGIN OPENSSH PRIVATE KEY-----&#10;...&#10;-----END OPENSSH PRIVATE KEY-----"
                  value={keyText} onChange={e => { setKeyText(e.target.value); setError('') }}
                  rows={7}
                  className="w-full px-3 py-2 rounded-lg text-xs font-mono resize-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${error && !keyText ? 'var(--error)' : 'var(--border)'}`, color: 'var(--text-primary)' }}
                />
              </div>
              {error && <p className="text-xs" style={{ color: 'var(--error)' }}>{error}</p>}
              <button
                onClick={importFromText}
                disabled={importing}
                className="w-full py-2.5 rounded-lg text-xs font-medium transition-all"
                style={{ background: 'var(--accent)', color: 'white', opacity: importing ? 0.7 : 1 }}
              >
                {importing ? 'Saving…' : 'Save Key'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
