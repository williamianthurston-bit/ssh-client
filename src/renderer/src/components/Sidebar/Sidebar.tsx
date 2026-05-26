import React, { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import HostGroup from './HostGroup'
import HostItem from './HostItem'

export default function Sidebar(): React.ReactElement {
  const {
    groups, hosts, account,
    openAddHost, openAddGroup, setShowKeyManager,
    openPalette, setShowSettings, setShowSnippets
  } = useAppStore()
  const [search, setSearch] = useState('')

  const ungrouped = hosts.filter(h => !h.groupId)
  const filtered = search
    ? ungrouped.filter(h => matchSearch(h.label, h.host, search))
    : ungrouped

  return (
    <div className="flex flex-col w-[260px] shrink-0 h-full"
         style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}>

      {/* Traffic lights space + app name */}
      <div className="titlebar-drag flex items-center px-4"
           style={{ height: '52px', borderBottom: '1px solid var(--border)' }}>
        <div className="titlebar-no-drag ml-20 flex items-center gap-2">
          <div className="w-5 h-5 rounded flex items-center justify-center"
               style={{ background: 'var(--accent)' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5"/>
              <line x1="12" y1="19" x2="20" y2="19"/>
            </svg>
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>SSH Client</span>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
               width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
               style={{ color: 'var(--text-muted)' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search hosts…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="titlebar-no-drag w-full pl-8 pr-3 py-1.5 rounded-md text-xs"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)'
            }}
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-1 rounded"
               style={{ background: 'var(--border)', color: 'var(--text-muted)', fontSize: '10px' }}
               onClick={openPalette}>⌘J</kbd>
        </div>
      </div>

      {/* Vault label + actions */}
      <div className="titlebar-no-drag flex items-center justify-between px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Vault
        </span>
        <div className="flex gap-0.5">
          <SideBtn title="New Host" onClick={() => openAddHost()}>
            <PlusIcon />
          </SideBtn>
          <SideBtn title="New Group" onClick={openAddGroup}>
            <FolderPlusIcon />
          </SideBtn>
        </div>
      </div>

      {/* Host list */}
      <div className="flex-1 overflow-y-auto">
        {hosts.length === 0 && !search ? (
          <EmptyVault onAddHost={() => openAddHost()} />
        ) : (
          <>
            {groups.map(group => (
              <HostGroup key={group.id} group={group} searchTerm={search} />
            ))}
            {filtered.map(host => (
              <HostItem key={host.id} host={host} indent={0} />
            ))}
          </>
        )}
      </div>

      {/* Bottom nav */}
      <div className="shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        <NavBtn icon={<KeyIcon />} label="Keychain" onClick={() => setShowKeyManager(true)} />
        <NavBtn icon={<SnippetIcon />} label="Snippets" onClick={() => setShowSnippets(true)} />
        <NavBtn icon={<SettingsIcon />} label="Settings" onClick={() => setShowSettings(true)} />

        {/* Account badge */}
        {account ? (
          <div className="flex items-center gap-2.5 px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                 style={{ background: 'var(--accent)', color: 'white' }}>
              {account.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{account.email}</div>
              <div className="text-xs" style={{ color: account.synced ? 'var(--accent)' : 'var(--text-muted)' }}>
                {account.synced ? '● Synced' : '○ Offline'}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--text-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Local only</span>
          </div>
        )}
      </div>
    </div>
  )
}

function matchSearch(label: string, host: string, q: string) {
  return label.toLowerCase().includes(q.toLowerCase()) || host.toLowerCase().includes(q.toLowerCase())
}

function SideBtn({ children, title, onClick }: { children: React.ReactNode, title: string, onClick: () => void }) {
  return (
    <button title={title} onClick={onClick}
      className="titlebar-no-drag w-6 h-6 rounded flex items-center justify-center transition-colors"
      style={{ color: 'var(--text-muted)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
    >{children}</button>
  )
}

function NavBtn({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full titlebar-no-drag flex items-center gap-3 px-4 py-2.5 text-xs transition-colors"
      style={{ color: 'var(--text-secondary)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
    >
      {icon}
      {label}
    </button>
  )
}

function EmptyVault({ onAddHost }: { onAddHost: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 mt-10 px-6">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
           style={{ background: 'rgba(0,194,111,0.12)' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
          <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/>
          <line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
        </svg>
      </div>
      <p className="text-xs text-center leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        Your vault is empty.<br/>Add your first host to get started.
      </p>
      <button onClick={onAddHost}
        className="text-xs px-4 py-2 rounded-lg font-medium"
        style={{ background: 'var(--accent)', color: 'white' }}>
        + New Host
      </button>
    </div>
  )
}

/* ── Icons ── */
const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const FolderPlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    <line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
  </svg>
)
const KeyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
)
const SnippetIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
  </svg>
)
const SettingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)
