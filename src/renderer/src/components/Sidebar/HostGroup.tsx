import React from 'react'
import { useAppStore, HostGroup as HostGroupType } from '../../store/appStore'
import HostItem from './HostItem'

interface Props {
  group: HostGroupType
  searchTerm: string
}

export default function HostGroup({ group, searchTerm }: Props): React.ReactElement | null {
  const { hosts, openAddHost, openEditGroup, groups: allGroups } = useAppStore()

  const groupHosts = hosts.filter(h => h.groupId === group.id)
  const filtered = searchTerm
    ? groupHosts.filter(h =>
        h.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.host.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : groupHosts

  // Hide group if search yields no results
  if (searchTerm && filtered.length === 0) return null

  const toggleExpanded = () => {
    window.api.groups.update(group.id, { expanded: !group.expanded })
    useAppStore.setState(state => ({
      groups: state.groups.map(g => g.id === group.id ? { ...g, expanded: !g.expanded } : g)
    }))
  }

  return (
    <div className="mb-1">
      {/* Group header */}
      <div
        className="titlebar-no-drag flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer group/grp transition-colors"
        onClick={toggleExpanded}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        {/* Chevron */}
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ color: 'var(--text-muted)', transition: 'transform 0.15s', transform: group.expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>

        {/* Colour dot */}
        <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: group.color }} />

        {/* Name */}
        <span className="flex-1 text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
          {group.name}
        </span>

        {/* Count badge */}
        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>
          {groupHosts.length}
        </span>

        {/* Add host to group */}
        <button
          title="Add host to group"
          className="opacity-0 group-hover/grp:opacity-100 w-5 h-5 rounded flex items-center justify-center transition-all"
          style={{ color: 'var(--text-muted)' }}
          onClick={e => { e.stopPropagation(); openAddHost(group.id) }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Host list */}
      {group.expanded && (
        <div className="ml-4">
          {filtered.map(host => (
            <HostItem key={host.id} host={host} />
          ))}
          {filtered.length === 0 && !searchTerm && (
            <div
              className="px-3 py-2 text-xs cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
              onClick={() => openAddHost(group.id)}
            >
              + Add host…
            </div>
          )}
        </div>
      )}
    </div>
  )
}
