import React, { useState } from 'react'
import { useAppStore } from '../../store/appStore'

const COLORS = ['#6E3FC5', '#4CAF82', '#F5A623', '#E05D5D', '#5B8AF0', '#C678DD', '#56B6C2', '#FF6B6B']

export default function AddGroupModal(): React.ReactElement {
  const { editGroupId, groups, closeGroupModal, setGroups } = useAppStore()

  const existing = editGroupId ? groups.find(g => g.id === editGroupId) : null
  const [name, setName] = useState(existing?.name || '')
  const [color, setColor] = useState(existing?.color || COLORS[0])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const save = async () => {
    if (!name.trim()) { setError('Name is required'); return }
    setSaving(true)
    try {
      if (existing) {
        await window.api.groups.update(existing.id, { name: name.trim(), color })
        setGroups(groups.map(g => g.id === existing.id ? { ...g, name: name.trim(), color } : g))
      } else {
        const created = await window.api.groups.add(name.trim(), color)
        setGroups([...groups, created])
      }
      closeGroupModal()
    } catch (err: any) {
      setError(err.message)
    }
    setSaving(false)
  }

  const deleteGroup = async () => {
    if (!existing) return
    if (!confirm(`Delete group "${existing.name}"? Hosts will become ungrouped.`)) return
    await window.api.groups.delete(existing.id)
    setGroups(groups.filter(g => g.id !== existing.id))
    closeGroupModal()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop" onClick={closeGroupModal}>
      <div
        className="rounded-xl w-80 animate-fade-in overflow-hidden"
        style={{ background: 'var(--modal-bg)', border: '1px solid var(--border)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {existing ? 'Edit Group' : 'New Group'}
          </h2>
          <button onClick={closeGroupModal} className="w-6 h-6 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Group Name</label>
            <input
              type="text" placeholder="Production"
              value={name} onChange={e => { setName(e.target.value); setError('') }}
              onKeyDown={e => { if (e.key === 'Enter') save() }}
              autoFocus
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${error ? 'var(--error)' : 'var(--border)'}`, color: 'var(--text-primary)' }}
            />
            {error && <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Colour</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-lg transition-all"
                  style={{
                    background: c,
                    outline: color === c ? `2px solid white` : 'none',
                    outlineOffset: '2px',
                    transform: color === c ? 'scale(1.15)' : 'scale(1)'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
          {existing ? (
            <button onClick={deleteGroup} className="text-xs px-3 py-2 rounded-lg" style={{ color: 'var(--error)', background: 'rgba(224,93,93,0.1)' }}>
              Delete Group
            </button>
          ) : <div />}
          <div className="flex gap-2">
            <button onClick={closeGroupModal} className="px-4 py-2 rounded-lg text-xs" style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>
              Cancel
            </button>
            <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg text-xs font-medium" style={{ background: color, color: 'white', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : existing ? 'Save' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
