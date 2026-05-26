import React, { useState } from 'react'
import { useAppStore } from '../../store/appStore'

export default function KeychainView(): React.ReactElement {
  const { keys, hosts, account } = useAppStore()
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(keys[0]?.id ?? null)

  const selectedKey = keys.find(k => k.id === selectedKeyId)
  const linkedHosts = hosts.filter(h => h.keyId === selectedKeyId)

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 16px',
        borderBottom: '1px solid var(--border-light)',
        background: 'var(--bg-sidebar)', flexShrink: 0,
      }}>
        <ToolBtn primary icon={<PlusIcon />}>New key</ToolBtn>
        <ToolBtn icon={<CertIcon />}>Certificate</ToolBtn>
        <ToolBtn icon={<TouchIdIcon />}>Touch ID</ToolBtn>
        <ToolBtn icon={<Fido2Icon />}>FIDO2</ToolBtn>
        <div style={{ flex: 1 }} />
        <IconBtn title="Search">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </IconBtn>
        <IconBtn title="Grid view">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="9" y="2" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="2" y="9" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="9" y="9" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </IconBtn>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Identity list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{
            padding: '4px 0 8px',
            fontSize: '11px', fontWeight: 600,
            letterSpacing: '.06em', color: 'var(--text-muted)',
            textTransform: 'uppercase',
          }}>
            SSH Keys
          </div>

          {keys.length === 0 && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', flex: 1, gap: '10px', color: 'var(--text-muted)',
              paddingTop: '40px',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4 }}>
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
              </svg>
              <p style={{ fontSize: '13px' }}>No SSH keys yet</p>
            </div>
          )}

          {keys.map(key => {
            const isSelected = selectedKeyId === key.id
            return (
              <div
                key={key.id}
                onClick={() => setSelectedKeyId(key.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '11px 13px', borderRadius: '9px',
                  background: isSelected ? 'rgba(59,130,246,0.08)' : 'var(--bg-panel)',
                  border: `1.5px solid ${isSelected ? 'var(--accent)' : '#1a2540'}`,
                  cursor: 'pointer', transition: 'all .15s',
                }}
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '7px',
                  background: 'var(--host-generic)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="2" width="12" height="12" rx="3" stroke="#93c5fd" strokeWidth="1.5"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {key.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    SSH key · {new Date(key.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Identities from account */}
          {account && (
            <>
              <div style={{
                padding: '12px 0 8px',
                fontSize: '11px', fontWeight: 600,
                letterSpacing: '.06em', color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}>
                Identities
              </div>
              <div
                onClick={() => setSelectedKeyId('identity-' + account.email)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '11px 13px', borderRadius: '9px',
                  background: selectedKeyId === 'identity-' + account.email ? 'rgba(59,130,246,0.08)' : 'var(--bg-panel)',
                  border: `1.5px solid ${selectedKeyId === 'identity-' + account.email ? 'var(--accent)' : '#1a2540'}`,
                  cursor: 'pointer', transition: 'all .15s',
                }}
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '7px',
                  background: 'var(--host-generic)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="2" width="12" height="12" rx="3" stroke="#93c5fd" strokeWidth="1.5"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {account.email.split('@')[0]}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Auth password</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Edit panel */}
        {selectedKey && (
          <div style={{
            width: '240px', flexShrink: 0,
            background: 'var(--bg-sidebar)',
            borderLeft: '1px solid var(--border-light)',
            overflowY: 'auto',
          }}>
            <div style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              padding: '14px 14px 10px',
              borderBottom: '1px solid var(--border-light)',
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedKey.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                  SSH key
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <PanelIconBtn>⋯</PanelIconBtn>
                <PanelIconBtn onClick={() => setSelectedKeyId(null)}>→</PanelIconBtn>
              </div>
            </div>

            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.05em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Details
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <FieldRow label="Name">
                  <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{selectedKey.name}</span>
                </FieldRow>
                <FieldRow label="Added">
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(selectedKey.createdAt).toLocaleDateString()}
                  </span>
                </FieldRow>
              </div>
            </div>

            {linkedHosts.length > 0 && (
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.05em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Linked to
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {linkedHosts.map(h => (
                    <div key={h.id} style={{
                      display: 'flex', alignItems: 'center', gap: '9px',
                      padding: '9px 10px', borderRadius: '8px',
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                    }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '7px', background: '#e95420',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px',
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                          <circle cx="12" cy="12" r="3.5" fill="white"/>
                          <circle cx="12" cy="2" r="2" fill="white"/>
                          <circle cx="20.8" cy="17" r="2" fill="white"/>
                          <circle cx="3.2" cy="17" r="2" fill="white"/>
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>{h.label}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ssh, {h.username}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0' }}>
      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</span>
      {children}
    </div>
  )
}

function PanelIconBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '26px', height: '26px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '13px', color: 'var(--text-muted)',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-primary)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
    >
      {children}
    </button>
  )
}

function ToolBtn({ children, primary, icon }: { children: React.ReactNode; primary?: boolean; icon?: React.ReactNode }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '6px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 500,
        background: primary ? (hov ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.15)') : (hov ? 'var(--bg-hover)' : 'var(--bg-card)'),
        border: `1px solid ${primary ? 'rgba(59,130,246,0.5)' : 'var(--border)'}`,
        color: primary ? '#93c5fd' : 'var(--text-secondary)',
      }}
    >
      {icon}{children}
    </button>
  )
}

function IconBtn({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <button title={title} style={{ width: '30px', height: '30px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-primary)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
    >
      {children}
    </button>
  )
}

const PlusIcon = () => <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
const CertIcon = () => <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="3" y="2" width="10" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M6 6h4M6 9h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
const TouchIdIcon = () => <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M5 8c0-1.66 1.34-3 3-3s3 1.34 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M3 8a5 5 0 0010 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
const Fido2Icon = () => <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="4" y="7" width="8" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M6 7V5a2 2 0 014 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
