import React, { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import HostGroup from './HostGroup'
import HostItem from './HostItem'

export default function Sidebar(): React.ReactElement {
  const {
    groups, hosts,
    openAddHost, openAddGroup, setShowKeyManager, setShowQuickConnect
  } = useAppStore()

  const [search, setSearch] = useState('')

  const ungroupedHosts = hosts.filter(h => !h.groupId)
  const filteredUngrouped = search
    ? ungroupedHosts.filter(h => h.label.toLowerCase().includes(search.toLowerCase()) || h.host.toLowerCase().includes(search.toLowerCase()))
    : ungroupedHosts

  return (
    <div
      className="flex flex-col w-64 shrink-0 border-r"
      style={{
        background: 'var(--bg-sidebar)',
        borderColor: 'var(--border)',
        paddingTop: '44px' // Space for Mac traffic lights
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-3">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Hosts
        </span>
        <div className="flex gap-1">
          <IconButton title="Quick Connect" onClick={() => setShowQuickConnect(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
            </svg>
          </IconButton>
          <IconButton title="Add Host" onClick={() => openAddHost()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </IconButton>
          <IconButton title="New Group" onClick={() => openAddGroup()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" />
            </svg>
          </IconButton>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pb-3">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search hosts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="titlebar-no-drag w-full pl-7 pr-3 py-1.5 rounded-md text-xs transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Host list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {/* Groups */}
        {groups.map(group => (
          <HostGroup key={group.id} group={group} searchTerm={search} />
        ))}

        {/* Ungrouped hosts */}
        {filteredUngrouped.length > 0 && (
          <div>
            {groups.length > 0 && (
              <div className="px-2 pt-3 pb-1">
                <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Ungrouped</span>
              </div>
            )}
            {filteredUngrouped.map(host => (
              <HostItem key={host.id} host={host} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {hosts.length === 0 && !search && (
          <div className="flex flex-col items-center gap-3 mt-8 px-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                <line x1="6" y1="6" x2="6.01" y2="6" />
                <line x1="6" y1="18" x2="6.01" y2="18" />
              </svg>
            </div>
            <p className="text-xs text-center leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              No hosts yet.<br />
              Click <span style={{ color: 'var(--accent)' }}>+</span> to add your first server.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-3 border-t flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
        <IconButton title="SSH Keys" onClick={() => setShowKeyManager(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
          </svg>
        </IconButton>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>SSH Keys</span>
      </div>
    </div>
  )
}

function IconButton({ children, title, onClick }: { children: React.ReactNode, title: string, onClick?: () => void }): React.ReactElement {
  return (
    <button
      title={title}
      onClick={onClick}
      className="titlebar-no-drag w-6 h-6 rounded flex items-center justify-center transition-colors"
      style={{ color: 'var(--text-muted)' }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--accent-light)'
        e.currentTarget.style.color = 'var(--accent)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = 'var(--text-muted)'
      }}
    >
      {children}
    </button>
  )
}
