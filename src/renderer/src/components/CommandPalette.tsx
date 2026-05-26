import React, { useEffect, useRef, useState } from 'react'
import { useAppStore, StoredHost } from '../store/appStore'

export default function CommandPalette(): React.ReactElement {
  const { hosts, groups, closePalette, paletteQuery, setPaletteQuery,
          openSession, setSessionStatus, openAddHost, setShowSettings, setShowKeyManager } = useAppStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [selected, setSelected] = useState(0)

  useEffect(() => { inputRef.current?.focus() }, [])

  // Build items: hosts + actions
  const q = paletteQuery.toLowerCase()
  const hostItems = hosts.filter(h =>
    !q || h.label.toLowerCase().includes(q) || h.host.toLowerCase().includes(q) || h.username.toLowerCase().includes(q)
  )

  const actions = [
    { id: 'new-host',    label: 'New Host',     icon: '＋', action: () => { openAddHost(); closePalette() } },
    { id: 'keychain',   label: 'Keychain',     icon: '🔑', action: () => { setShowKeyManager(true); closePalette() } },
    { id: 'settings',   label: 'Settings',     icon: '⚙',  action: () => { setShowSettings(true); closePalette() } },
  ].filter(a => !q || a.label.toLowerCase().includes(q))

  const allItems = [...hostItems.map(h => ({ type: 'host' as const, host: h })),
                    ...actions.map(a => ({ type: 'action' as const, ...a }))]

  const totalCount = allItems.length

  useEffect(() => { setSelected(0) }, [paletteQuery])

  const activate = (idx: number) => {
    const item = allItems[idx]
    if (!item) return
    if (item.type === 'host') {
      connectHost(item.host)
    } else {
      item.action()
    }
  }

  const connectHost = async (host: StoredHost) => {
    closePalette()
    const tabId = openSession(host)
    try {
      await window.api?.ssh?.connect({ tabId, host: host.host, port: host.port, username: host.username, authType: host.authType, password: host.password, keyId: host.keyId, rows: 24, cols: 80 })
      setSessionStatus(tabId, 'connected')
    } catch (err: any) {
      setSessionStatus(tabId, 'error', err.message)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape')    { closePalette(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, totalCount - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
    if (e.key === 'Enter')     { activate(selected) }
  }

  const getGroup = (groupId: string | null) => groups.find(g => g.id === groupId)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 modal-backdrop" onClick={closePalette}>
      <div className="w-[560px] rounded-2xl overflow-hidden anim-modal"
           style={{ background: 'var(--bg-modal)', border: '1px solid var(--border-light)', boxShadow: '0 24px 80px rgba(0,0,0,0.8)' }}
           onClick={e => e.stopPropagation()}>

        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search hosts, connect, or run a command…"
            value={paletteQuery}
            onChange={e => setPaletteQuery(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 text-sm bg-transparent"
            style={{ color: 'var(--text-primary)', border: 'none', outline: 'none' }}
          />
          <kbd className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--border)', color: 'var(--text-muted)', fontSize: '10px' }}>ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto py-1">
          {allItems.length === 0 && (
            <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No results for "{paletteQuery}"</div>
          )}

          {/* Section: Hosts */}
          {hostItems.length > 0 && (
            <div>
              <div className="px-4 py-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Hosts
              </div>
              {hostItems.map((host, i) => {
                const group = getGroup(host.groupId)
                const isSelected = allItems[selected]?.type === 'host' && (allItems[selected] as any).host?.id === host.id
                return (
                  <div key={host.id}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer ${isSelected ? 'palette-item-selected' : ''}`}
                    style={{ borderLeft: isSelected ? '2px solid var(--accent)' : '2px solid transparent' }}
                    onClick={() => connectHost(host)}
                    onMouseEnter={() => setSelected(i)}
                    onMouseMove={() => setSelected(i)}
                  >
                    {/* Icon */}
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                         style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}>
                        <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/>
                        <line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{host.label}</div>
                      <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                        {host.username}@{host.host}:{host.port}
                        {group && <span className="ml-2" style={{ color: group.color }}>{group.name}</span>}
                      </div>
                    </div>

                    {isSelected && (
                      <kbd className="shrink-0 text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--border)', color: 'var(--text-secondary)', fontSize: '10px' }}>↵ connect</kbd>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Section: Actions */}
          {actions.length > 0 && (
            <div>
              <div className="px-4 py-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Actions
              </div>
              {actions.map((action, i) => {
                const idx = hostItems.length + i
                const isSelected = selected === idx
                return (
                  <div key={action.id}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer ${isSelected ? 'palette-item-selected' : ''}`}
                    style={{ borderLeft: isSelected ? '2px solid var(--accent)' : '2px solid transparent' }}
                    onClick={action.action}
                    onMouseEnter={() => setSelected(idx)}
                    onMouseMove={() => setSelected(idx)}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                         style={{ background: 'rgba(255,255,255,0.05)' }}>
                      {action.icon}
                    </div>
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{action.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-4 py-2.5" style={{ borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
          {[['↑↓', 'navigate'], ['↵', 'connect'], ['ESC', 'close']].map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <kbd className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--border)', color: 'var(--text-secondary)', fontSize: '10px' }}>{key}</kbd>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
