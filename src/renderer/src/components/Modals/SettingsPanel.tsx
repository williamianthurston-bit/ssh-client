import React from 'react'
import { useAppStore } from '../../store/appStore'
import { TERMINAL_THEMES } from '../../lib/terminalThemes'

const FONTS = [
  'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
  'Menlo, Monaco, Consolas, monospace',
  'Cascadia Code, Consolas, monospace',
  'Fira Code, Menlo, monospace',
]

export default function SettingsPanel(): React.ReactElement {
  const { settings, updateSettings, setShowSettings, account, setAccount } = useAppStore()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop"
      onClick={() => setShowSettings(false)}
    >
      <div
        className="w-[520px] rounded-2xl overflow-hidden anim-modal"
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Settings
          </h2>
          <button
            onClick={() => setShowSettings(false)}
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-6">
          {/* Account */}
          <Section title="Account">
            {account ? (
              <div
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'var(--bg-card)' }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                  style={{ background: 'var(--accent)', color: 'white' }}
                >
                  {account.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {account.email}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--accent-green)' }}>● Vault synced</div>
                </div>
                <button
                  onClick={() => setAccount(null)}
                  className="text-xs px-3 py-1.5 rounded-lg"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                  }}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div
                className="p-3 rounded-xl text-sm"
                style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
              >
                Not signed in — data is stored locally only.
              </div>
            )}
          </Section>

          {/* Terminal */}
          <Section title="Terminal">
            <div className="flex flex-col gap-3">
              <SettingRow label="Default Theme">
                <select
                  value={settings.terminalTheme}
                  onChange={e => updateSettings({ terminalTheme: e.target.value as any })}
                  className="px-3 py-1.5 rounded-lg text-xs"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {TERMINAL_THEMES.map(t => (
                    <option key={t.key} value={t.key}>{t.label}</option>
                  ))}
                </select>
              </SettingRow>

              <SettingRow label="Font Family">
                <select
                  value={settings.fontFamily}
                  onChange={e => updateSettings({ fontFamily: e.target.value })}
                  className="px-3 py-1.5 rounded-lg text-xs"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {FONTS.map(f => (
                    <option key={f} value={f}>{f.split(',')[0]}</option>
                  ))}
                </select>
              </SettingRow>

              <SettingRow label={`Font Size (${settings.fontSize}px)`}>
                <input
                  type="range" min={10} max={20}
                  value={settings.fontSize}
                  onChange={e => updateSettings({ fontSize: Number(e.target.value) })}
                  className="w-32"
                />
              </SettingRow>

              <SettingRow label="Cursor Style">
                <div className="flex gap-1">
                  {(['bar', 'block', 'underline'] as const).map(style => (
                    <button
                      key={style}
                      onClick={() => updateSettings({ cursorStyle: style })}
                      className="px-3 py-1.5 rounded-lg text-xs capitalize"
                      style={{
                        background: settings.cursorStyle === style ? 'var(--accent)' : 'var(--bg-card)',
                        color: settings.cursorStyle === style ? 'white' : 'var(--text-secondary)',
                        border: `1px solid ${settings.cursorStyle === style ? 'var(--accent)' : 'var(--border)'}`,
                      }}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </SettingRow>
            </div>
          </Section>

          {/* Sync */}
          <Section title="Sync">
            <div
              className="p-3 rounded-xl text-xs"
              style={{
                background: 'var(--bg-card)',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: 'var(--text-primary)' }}>End-to-end encrypted vault sync.</strong>
              <br/>
              Your hosts, credentials, and SSH keys are encrypted with your master password before
              leaving this device. We cannot access your data.
              <br/><br/>
              Sync server:{' '}
              <span style={{ color: 'var(--text-link)', fontFamily: '"JetBrains Mono", monospace' }}>
                {settings.apiUrl}
              </span>
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3
        className="text-xs font-semibold uppercase tracking-widest mb-3"
        style={{ color: 'var(--text-muted)' }}
      >
        {title}
      </h3>
      {children}
    </div>
  )
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      {children}
    </div>
  )
}
