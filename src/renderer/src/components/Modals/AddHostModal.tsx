import React, { useState, useEffect } from 'react'
import { useAppStore, StoredHost } from '../../store/appStore'

export default function AddHostModal(): React.ReactElement {
  const { editHostId, hosts, groups, keys, closeHostModal, setHosts } = useAppStore()

  const isNew = !editHostId || editHostId === 'new' || editHostId?.startsWith('new:')
  const preselectedGroupId = editHostId?.startsWith('new:') ? editHostId.split(':')[1] : undefined
  const existingHost = isNew ? null : hosts.find(h => h.id === editHostId)

  const [form, setForm] = useState({
    label: existingHost?.label || '',
    host: existingHost?.host || '',
    port: existingHost?.port || 22,
    username: existingHost?.username || '',
    authType: existingHost?.authType || 'password' as 'password' | 'key' | 'agent',
    password: existingHost?.password || '',
    keyId: existingHost?.keyId || '',
    groupId: existingHost?.groupId || preselectedGroupId || ''
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.label.trim()) { setError('Name is required'); return }
    if (!form.host.trim()) { setError('Host is required'); return }
    if (!form.username.trim()) { setError('Username is required'); return }

    setSaving(true)
    setError('')

    try {
      const data = {
        label: form.label.trim(),
        host: form.host.trim(),
        port: Number(form.port),
        username: form.username.trim(),
        authType: form.authType,
        password: form.authType === 'password' ? form.password : undefined,
        keyId: form.authType === 'key' ? form.keyId : undefined,
        groupId: form.groupId || null
      }

      if (isNew) {
        const created = await window.api.hosts.add(data)
        setHosts([...hosts, created])
      } else {
        await window.api.hosts.update(existingHost!.id, data)
        setHosts(hosts.map(h => h.id === existingHost!.id ? { ...h, ...data } : h))
      }
      closeHostModal()
    } catch (err: any) {
      setError(err.message)
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop" onClick={closeHostModal}>
      <div
        className="rounded-xl w-[460px] animate-fade-in overflow-hidden"
        style={{ background: 'var(--modal-bg)', border: '1px solid var(--border)', boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(110,63,197,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {isNew ? 'New Host' : 'Edit Host'}
          </h2>
          <button onClick={closeHostModal} className="w-6 h-6 rounded flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-4">
          {/* Label */}
          <Field label="Display Name">
            <input
              type="text" placeholder="My Production Server"
              value={form.label} onChange={e => set('label', e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </Field>

          {/* Host + Port */}
          <div className="flex gap-3">
            <Field label="Hostname / IP" className="flex-1">
              <input
                type="text" placeholder="192.168.1.1"
                value={form.host} onChange={e => set('host', e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </Field>
            <Field label="Port" className="w-20">
              <input
                type="number" min={1} max={65535}
                value={form.port} onChange={e => set('port', e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </Field>
          </div>

          {/* Username */}
          <Field label="Username">
            <input
              type="text" placeholder="root"
              value={form.username} onChange={e => set('username', e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </Field>

          {/* Auth type */}
          <Field label="Authentication">
            <div className="flex gap-2">
              {(['password', 'key', 'agent'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => set('authType', type)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all"
                  style={{
                    background: form.authType === type ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                    color: form.authType === type ? 'white' : 'var(--text-muted)',
                    border: `1px solid ${form.authType === type ? 'var(--accent)' : 'var(--border)'}`
                  }}
                >
                  {type === 'agent' ? 'SSH Agent' : type === 'key' ? 'Private Key' : 'Password'}
                </button>
              ))}
            </div>
          </Field>

          {/* Auth fields */}
          {form.authType === 'password' && (
            <Field label="Password">
              <input
                type="password" placeholder="••••••••"
                value={form.password} onChange={e => set('password', e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </Field>
          )}
          {form.authType === 'key' && (
            <Field label="SSH Key">
              <select
                value={form.keyId} onChange={e => set('keyId', e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: keys.length ? 'var(--text-primary)' : 'var(--text-muted)' }}
              >
                <option value="">Select a key…</option>
                {keys.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
              {keys.length === 0 && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  No keys stored. Import one from SSH Keys in the sidebar.
                </p>
              )}
            </Field>
          )}
          {form.authType === 'agent' && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Uses the system SSH agent (SSH_AUTH_SOCK). Your keys must be added via <code>ssh-add</code>.
            </p>
          )}

          {/* Group */}
          <Field label="Group (optional)">
            <select
              value={form.groupId} onChange={e => set('groupId', e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              <option value="">No group</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </Field>

          {error && <p className="text-xs" style={{ color: 'var(--error)' }}>{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={closeHostModal} className="px-4 py-2 rounded-lg text-xs" style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
            style={{ background: 'var(--accent)', color: 'white', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Saving…' : isNew ? 'Add Host' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children, className = '' }: { label: string, children: React.ReactNode, className?: string }): React.ReactElement {
  return (
    <div className={className}>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</label>
      {children}
    </div>
  )
}
