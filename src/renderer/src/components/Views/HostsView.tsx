import React, { useState, useCallback } from 'react'
import { useAppStore, StoredHost } from '../../store/appStore'
import NewHostPanel from '../Panels/NewHostPanel'

export default function HostsView(): React.ReactElement {
  const {
    hosts, groups,
    openSession, setSessionStatus,
    selectedHostId, setSelectedHostId,
    newHostPanelOpen, setNewHostPanelOpen,
  } = useAppStore()

  const [search, setSearch] = useState('')
  const [connectingId, setConnectingId] = useState<string | null>(null)

  const filtered = search
    ? hosts.filter(h =>
        h.label.toLowerCase().includes(search.toLowerCase()) ||
        h.host.toLowerCase().includes(search.toLowerCase()) ||
        h.username.toLowerCase().includes(search.toLowerCase())
      )
    : hosts

  const connectHost = useCallback(async (host: StoredHost) => {
    setConnectingId(host.id)
    const tabId = openSession(host)
    try {
      await window.api?.ssh?.connect({
        tabId, host: host.host, port: host.port,
        username: host.username, authType: host.authType,
        keyId: host.keyId, rows: 24, cols: 80,
      })
      setSessionStatus(tabId, 'connected')
    } catch (err: any) {
      setSessionStatus(tabId, 'error', err.message)
    }
    setConnectingId(null)
  }, [openSession, setSessionStatus])

  const selectedHost = hosts.find(h => h.id === selectedHostId)

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 16px',
        borderBottom: '1px solid var(--border-light)',
        background: 'var(--bg-sidebar)',
        flexShrink: 0,
      }}>
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Find a host or ssh user@hostname…"
          style={{
            flex: 1,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '7px',
            padding: '6px 12px',
            fontSize: '12.5px',
            color: 'var(--text-primary)',
          }}
        />

        {/* Connect button */}
        <button
          onClick={() => selectedHost && connectHost(selectedHost)}
          disabled={!selectedHost}
          style={{
            padding: '6px 14px',
            borderRadius: '7px',
            fontSize: '12.5px',
            fontWeight: 600,
            background: selectedHost ? 'var(--bg-card)' : 'transparent',
            border: `1px solid ${selectedHost ? 'var(--accent)' : 'var(--border)'}`,
            color: selectedHost ? '#93c5fd' : 'var(--text-muted)',
            transition: 'all .15s',
          }}
        >
          Connect
        </button>

        <Divider />

        {/* New host */}
        <ToolbarBtn
          primary
          onClick={() => setNewHostPanelOpen(true)}
          icon={
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          }
        >
          New host
          <svg width="8" height="8" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 3 }}>
            <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ToolbarBtn>

        {/* Terminal */}
        <ToolbarBtn
          onClick={() => {
            const first = hosts[0]
            if (first) connectHost(first)
          }}
          icon={
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M3 5l3 3-3 3M9 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        >
          Terminal
        </ToolbarBtn>

        {/* Serial */}
        <ToolbarBtn
          onClick={() => {}}
          icon={
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M4 8h8M6 5l-2 3 2 3M10 5l2 3-2 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        >
          Serial
        </ToolbarBtn>

        <div style={{ flex: 1 }} />

        {/* View toggles */}
        <IconBtn active title="Grid view" onClick={() => {}}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="9" y="2" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="2" y="9" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="9" y="9" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </IconBtn>
        <IconBtn title="List view" onClick={() => {}}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </IconBtn>

        {/* User avatar */}
        <div style={{
          width: '26px', height: '26px', borderRadius: '50%',
          background: '#e95420', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', fontWeight: 700, cursor: 'pointer',
        }}>
          W
        </div>

        {/* Add button */}
        <div
          onClick={() => setNewHostPanelOpen(true)}
          style={{
            width: '26px', height: '26px', borderRadius: '50%',
            background: 'var(--bg-card)',
            border: '1px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#93c5fd', fontSize: '16px', fontWeight: 300,
            cursor: 'pointer',
          }}
        >
          +
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: 1, overflow: 'auto', padding: '0' }}>

          {/* Invite banner */}
          <div style={{ padding: '12px 16px 0' }}>
            <div style={{
              padding: '10px 14px',
              borderRadius: '9px',
              background: 'var(--bg-panel)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: 'var(--text-secondary)' }}>
                <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M2 13c0-2.2 1.8-4 4-4h4a4 4 0 014 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M12 3v4M10 5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)', flex: 1 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Invite members.</strong> Manage and use data together with your team.
              </span>
              <button style={{
                padding: '4px 12px', borderRadius: '6px',
                background: 'rgba(59,130,246,0.15)',
                border: '1px solid rgba(59,130,246,0.4)',
                fontSize: '12px', fontWeight: 500,
                color: '#93c5fd', cursor: 'pointer',
              }}>
                Invite
              </button>
            </div>
          </div>

          {/* Section label */}
          <div style={{
            padding: '12px 16px 6px',
            fontSize: '11px', fontWeight: 600,
            letterSpacing: '.06em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
          }}>
            Hosts
          </div>

          {/* Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '10px',
            padding: '0 16px 16px',
          }}>
            {/* "New host" placeholder card */}
            <HostCard
              isNew
              isSelected={false}
              onClick={() => setNewHostPanelOpen(true)}
              onDoubleClick={() => setNewHostPanelOpen(true)}
            />

            {filtered.map(host => {
              const group = groups.find(g => g.id === host.groupId)
              const isSelected = selectedHostId === host.id
              const isConnecting = connectingId === host.id
              return (
                <HostCard
                  key={host.id}
                  host={host}
                  group={group}
                  isSelected={isSelected}
                  isConnecting={isConnecting}
                  onClick={() => setSelectedHostId(isSelected ? null : host.id)}
                  onDoubleClick={() => connectHost(host)}
                />
              )
            })}
          </div>
        </div>

        {/* Right panel */}
        {newHostPanelOpen && <NewHostPanel onClose={() => setNewHostPanelOpen(false)} />}
      </div>
    </div>
  )
}

/* ── Host Card ── */
function HostCard({
  host, group, isNew, isSelected, isConnecting, onClick, onDoubleClick,
}: {
  host?: StoredHost
  group?: { name: string; color: string }
  isNew?: boolean
  isSelected: boolean
  isConnecting?: boolean
  onClick: () => void
  onDoubleClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  if (isNew) {
    return (
      <div
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 14px', borderRadius: '10px',
          background: 'transparent',
          border: `1.5px dashed ${hovered ? 'var(--accent)' : '#2a3d60'}`,
          cursor: 'pointer',
          transition: 'background .15s, border-color .15s',
          ...(hovered ? { background: 'var(--bg-panel)' } : {}),
        }}
      >
        <div style={{
          width: '36px', height: '36px', borderRadius: '9px',
          background: 'var(--host-generic)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="12" height="12" rx="3" stroke="#93c5fd" strokeWidth="1.5"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
            Enter IP or Hostname…
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>ssh</div>
        </div>
      </div>
    )
  }

  if (!host) return null

  const avatarBg = host.username === 'ubuntu' || host.username === 'deploy'
    ? 'var(--host-ubuntu)'
    : group
      ? group.color
      : 'var(--host-generic)'

  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px 14px', borderRadius: '10px',
        background: isSelected ? 'rgba(59,130,246,0.08)' : hovered ? 'var(--bg-card)' : 'var(--bg-panel)',
        border: `1px solid ${isSelected ? 'var(--accent)' : hovered ? '#2a3d60' : '#1a2540'}`,
        cursor: 'pointer',
        transition: 'background .15s, border-color .15s, transform .1s',
        transform: hovered && !isSelected ? 'translateY(-1px)' : 'none',
        boxShadow: isSelected ? '0 0 0 2px rgba(59,130,246,0.15)' : 'none',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: '36px', height: '36px', borderRadius: '9px',
        background: avatarBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, position: 'relative',
      }}>
        {isConnecting ? (
          <div style={{
            width: '14px', height: '14px', borderRadius: '50%',
            border: '2px solid white', borderTopColor: 'transparent',
            animation: 'spin 0.7s linear infinite',
          }} />
        ) : (
          <UbuntuIcon />
        )}
      </div>

      {/* Info */}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {host.label}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          ssh, {host.username}
          {group && (
            <>
              {' · '}
              <span style={{ color: group.color }}>{group.name}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Ubuntu logo icon ── */
function UbuntuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <circle cx="12" cy="12" r="3.5" fill="white"/>
      <circle cx="12" cy="2.5" r="2" fill="white"/>
      <circle cx="20.6" cy="17" r="2" fill="white"/>
      <circle cx="3.4" cy="17" r="2" fill="white"/>
    </svg>
  )
}

/* ── Toolbar helpers ── */
function ToolbarBtn({
  children, primary, icon, onClick,
}: {
  children?: React.ReactNode; primary?: boolean; icon?: React.ReactNode; onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '6px 12px', borderRadius: '7px',
        fontSize: '12px', fontWeight: 500,
        background: primary
          ? (hovered ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.15)')
          : (hovered ? 'var(--bg-hover)' : 'var(--bg-card)'),
        border: `1px solid ${primary ? 'rgba(59,130,246,0.5)' : 'var(--border)'}`,
        color: primary ? '#93c5fd' : 'var(--text-secondary)',
        transition: 'background .15s',
        whiteSpace: 'nowrap',
      }}
    >
      {icon}{children}
    </button>
  )
}

function IconBtn({ children, title, active, onClick }: {
  children: React.ReactNode; title: string; active?: boolean; onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
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

function Divider() {
  return (
    <div style={{ width: '1px', height: '18px', background: 'var(--border)', margin: '0 2px' }} />
  )
}
