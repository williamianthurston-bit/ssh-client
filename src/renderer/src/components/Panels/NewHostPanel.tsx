import React, { useState } from 'react'
import { useAppStore } from '../../store/appStore'

interface Props { onClose: () => void }

export default function NewHostPanel({ onClose }: Props): React.ReactElement {
  const { groups, hosts, setHosts, openSession, setSessionStatus } = useAppStore()

  const [address, setAddress]   = useState('')
  const [label, setLabel]       = useState('')
  const [username, setUsername] = useState('')
  const [sshPort, setSshPort]   = useState('22')
  const [groupId, setGroupId]   = useState<string | null>(null)
  const [saving, setSaving]     = useState(false)

  const handleConnect = async () => {
    if (!address) return
    setSaving(true)
    const hostData = {
      groupId,
      label: label || `${username || 'root'}@${address}`,
      host: address,
      port: parseInt(sshPort) || 22,
      username: username || 'root',
      authType: 'agent' as const,
      createdAt: Date.now(),
    }
    try {
      const saved = await window.api?.hosts?.add(hostData)
      const newHost = saved ?? { ...hostData, id: `h${Date.now()}` }
      setHosts([...hosts, newHost])
      onClose()
      const tabId = openSession(newHost)
      try {
        await window.api?.ssh?.connect({
          tabId, host: newHost.host, port: newHost.port,
          username: newHost.username, authType: newHost.authType,
          rows: 24, cols: 80,
        })
        setSessionStatus(tabId, 'connected')
      } catch (err: any) {
        setSessionStatus(tabId, 'error', err.message)
      }
    } catch {}
    setSaving(false)
  }

  const handleSave = async () => {
    if (!address) return
    setSaving(true)
    const hostData = {
      groupId,
      label: label || `${username || 'root'}@${address}`,
      host: address,
      port: parseInt(sshPort) || 22,
      username: username || 'root',
      authType: 'agent' as const,
      createdAt: Date.now(),
    }
    try {
      const saved = await window.api?.hosts?.add(hostData)
      const newHost = saved ?? { ...hostData, id: `h${Date.now()}` }
      setHosts([...hosts, newHost])
      onClose()
    } catch {}
    setSaving(false)
  }

  return (
    <div
      className="anim-slide"
      style={{
        width: '240px',
        flexShrink: 0,
        background: 'var(--bg-sidebar)',
        borderLeft: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        padding: '14px 14px 10px',
        borderBottom: '1px solid var(--border-light)',
      }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>New Host</div>
          <div style={{
            fontSize: '11px', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px',
          }}>
            Personal vault
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
              <path d="M3 4l2 2 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <PanelIconBtn title="Options" onClick={() => {}}>⋯</PanelIconBtn>
          <PanelIconBtn title="Close" onClick={onClose}>→</PanelIconBtn>
        </div>
      </div>

      {/* Address */}
      <FieldSection title="Address">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '7px',
            background: 'var(--host-generic)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="12" height="12" rx="3" stroke="#93c5fd" strokeWidth="1.5"/>
            </svg>
          </div>
          <FieldInput
            value={address}
            onChange={setAddress}
            placeholder="IP or Hostname"
            style={{ flex: 1 }}
          />
        </div>
      </FieldSection>

      {/* General */}
      <FieldSection title="General">
        <FieldInput value={label} onChange={setLabel} placeholder="Label" />
        <FieldRow label="Parent Group">
          <select
            value={groupId ?? ''}
            onChange={e => setGroupId(e.target.value || null)}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '3px 6px',
              fontSize: '11px',
              color: 'var(--text-secondary)',
            }}
          >
            <option value="">None</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Backspace">
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Default</span>
        </FieldRow>
      </FieldSection>

      {/* SSH port */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 14px',
        borderBottom: '1px solid var(--border-light)',
      }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>SSH on</span>
        <input
          type="number"
          value={sshPort}
          onChange={e => setSshPort(e.target.value)}
          style={{
            width: '52px', background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: '6px',
            padding: '4px 8px', fontSize: '12px', color: 'var(--text-primary)',
            fontFamily: '"JetBrains Mono", monospace', textAlign: 'center',
          }}
        />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>port</span>
      </div>

      {/* Credentials */}
      <FieldSection title="Credentials">
        <FieldInput
          value={username}
          onChange={setUsername}
          placeholder="Username"
          icon={
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M2 12c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          }
        />
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 0',
          cursor: 'pointer', color: 'var(--text-muted)', fontSize: '12px',
        }}>
          <span style={{ fontSize: '14px', color: 'var(--accent)' }}>+</span>
          SSH ID, Key, Certificate, FIDO2
        </div>
        <FieldRow label="Agent Forwarding">
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Disabled</span>
        </FieldRow>
        <FieldRow label="Startup snippet">
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>—</span>
        </FieldRow>
        <FieldRow label="Host Chaining">
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>—</span>
        </FieldRow>
        <FieldRow label="Proxy">
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>—</span>
        </FieldRow>
      </FieldSection>

      {/* Share */}
      <div style={{
        padding: '8px 14px',
        borderBottom: '1px solid var(--border-light)',
      }}>
        <button style={{
          width: '100%', padding: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          color: 'var(--text-muted)', fontSize: '12px',
          background: 'transparent', border: 'none',
        }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <circle cx="13" cy="4" r="2" stroke="currentColor" strokeWidth="1.4"/>
            <circle cx="3" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/>
            <circle cx="13" cy="12" r="2" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M5 7l6-2M5 9l6 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Share this host
        </button>
      </div>

      {/* Actions */}
      <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <button
          onClick={handleConnect}
          disabled={!address || saving}
          style={{
            padding: '9px',
            borderRadius: '8px', textAlign: 'center',
            fontSize: '13px', fontWeight: 600,
            background: address ? 'rgba(59,130,246,0.15)' : 'var(--bg-card)',
            border: `1px solid ${address ? 'var(--accent)' : 'var(--border)'}`,
            color: address ? '#93c5fd' : 'var(--text-muted)',
            cursor: address ? 'pointer' : 'not-allowed',
            transition: 'all .15s',
          }}
        >
          {saving ? 'Connecting…' : 'Connect'}
        </button>
        <button
          onClick={handleSave}
          disabled={!address || saving}
          style={{
            padding: '7px',
            borderRadius: '8px', textAlign: 'center',
            fontSize: '12px',
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            cursor: address ? 'pointer' : 'not-allowed',
          }}
        >
          Save without connecting
        </button>
      </div>
    </div>
  )
}

/* ── Sub-components ── */

function FieldSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-light)' }}>
      <div style={{
        fontSize: '11px', fontWeight: 600, letterSpacing: '.05em',
        color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px',
      }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {children}
      </div>
    </div>
  )
}

function FieldInput({
  value, onChange, placeholder, icon, style = {},
}: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  icon?: React.ReactNode; style?: React.CSSProperties
}) {
  return (
    <div style={{ position: 'relative', ...style }}>
      {icon && (
        <span style={{
          position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)', pointerEvents: 'none',
        }}>
          {icon}
        </span>
      )}
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '7px',
          padding: icon ? '7px 10px 7px 26px' : '7px 10px',
          fontSize: '12px',
          color: 'var(--text-primary)',
        }}
      />
    </div>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '6px 0',
      borderBottom: '1px solid rgba(30,45,69,0.5)',
    }}>
      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</span>
      {children}
    </div>
  )
}

function PanelIconBtn({ title, children, onClick }: {
  title: string; children: React.ReactNode; onClick: () => void
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: '26px', height: '26px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '13px', color: 'var(--text-muted)',
        background: 'transparent', border: 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--bg-card)'
        e.currentTarget.style.color = 'var(--text-primary)'
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
