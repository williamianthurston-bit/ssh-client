import React from 'react'
import { useAppStore, HostGroup as HG } from '../../store/appStore'
import HostItem from './HostItem'

interface Props { group: HG; searchTerm: string }

export default function HostGroup({ group, searchTerm }: Props): React.ReactElement | null {
  const { hosts, openAddHost } = useAppStore()

  const groupHosts = hosts.filter(h => h.groupId === group.id)
  const filtered = searchTerm
    ? groupHosts.filter(h => h.label.toLowerCase().includes(searchTerm.toLowerCase()) || h.host.toLowerCase().includes(searchTerm.toLowerCase()))
    : groupHosts

  if (searchTerm && filtered.length === 0) return null

  const toggle = () => {
    window.api?.groups?.update(group.id, { expanded: !group.expanded })
    useAppStore.setState(s => ({ groups: s.groups.map(g => g.id === group.id ? { ...g, expanded: !g.expanded } : g) }))
  }

  return (
    <div>
      {/* Group row */}
      <div
        className="titlebar-no-drag flex items-center gap-2 px-3 py-1.5 cursor-pointer group/grp transition-colors"
        onClick={toggle}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        {/* Chevron */}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
             style={{ color: 'var(--text-muted)', transition: 'transform .15s', transform: group.expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          <polyline points="9 18 15 12 9 6"/>
        </svg>

        {/* Colour dot */}
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: group.color }} />

        {/* Name */}
        <span className="flex-1 text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
          {group.name}
        </span>

        {/* Count */}
        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--text-muted)' }}>
          {groupHosts.length}
        </span>

        {/* Add host button */}
        <button
          title="Add host to group"
          className="opacity-0 group-hover/grp:opacity-100 w-5 h-5 rounded flex items-center justify-center"
          style={{ color: 'var(--text-muted)' }}
          onClick={e => { e.stopPropagation(); openAddHost(group.id) }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      {/* Children */}
      {group.expanded && (
        <div>
          {filtered.map(host => <HostItem key={host.id} host={host} indent={1} />)}
          {filtered.length === 0 && !searchTerm && (
            <div className="pl-8 pr-3 py-1.5 text-xs cursor-pointer transition-colors"
                 style={{ color: 'var(--text-muted)' }}
                 onClick={() => openAddHost(group.id)}>
              + Add a host…
            </div>
          )}
        </div>
      )}
    </div>
  )
}
