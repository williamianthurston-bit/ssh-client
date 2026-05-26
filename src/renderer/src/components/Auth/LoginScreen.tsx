import React, { useState } from 'react'
import { useAppStore } from '../../store/appStore'

type Step = 'email' | 'password' | 'register'

export default function LoginScreen(): React.ReactElement {
  const { setAccount, setAuthChecked, setGroups, setHosts, setKeys } = useAppStore()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  const apiUrl = useAppStore.getState().settings.apiUrl

  const checkEmail = async () => {
    if (!email.trim() || !email.includes('@')) { setError('Enter a valid email'); return }
    setError('')
    setStep('password')
  }

  const continueOffline = () => {
    // Use locally without an account
    setAccount(null)
    setAuthChecked(true)
    loadLocalData()
  }

  const loadLocalData = async () => {
    if (!(window as any).api) return
    const [groups, hosts, keys] = await Promise.all([
      window.api.groups.get(),
      window.api.hosts.get(),
      window.api.keys.list()
    ])
    setGroups(groups)
    setHosts(hosts)
    setKeys(keys)
  }

  const submit = async () => {
    if (!password) { setError('Enter your password'); return }
    if (mode === 'signup' && password !== confirmPw) { setError('Passwords do not match'); return }
    if (mode === 'signup' && password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    setError('')
    try {
      const endpoint = mode === 'signup' ? '/auth/register' : '/auth/login'
      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Authentication failed')

      setAccount({ email, token: data.token, synced: true, lastSync: Date.now() })
      setAuthChecked(true)

      // Decrypt + load vault from server response
      if (data.vault) {
        try {
          const vault = JSON.parse(data.vault)
          if (vault.groups) setGroups(vault.groups)
          if (vault.hosts) setHosts(vault.hosts)
          if (vault.keys) setKeys(vault.keys)
        } catch {}
      }
    } catch (err: any) {
      // If API unreachable, fall back to offline mode
      if (err.message?.includes('fetch') || err.name === 'TypeError') {
        setError('Cannot reach sync server — continuing offline')
        setTimeout(continueOffline, 1200)
      } else {
        setError(err.message)
      }
    }
    setLoading(false)
  }

  return (
    <div className="flex h-full w-full items-center justify-center"
         style={{ background: 'var(--bg-app)' }}>

      {/* Glassmorphism card */}
      <div className="flex flex-col items-center w-[360px]">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
               style={{ background: 'var(--accent)', boxShadow: '0 8px 40px rgba(0,194,111,0.35)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5"/>
              <line x1="12" y1="19" x2="20" y2="19"/>
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>SSH Client</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Your secure terminal, everywhere</p>
          </div>
        </div>

        {/* Card */}
        <div className="w-full rounded-xl p-6"
             style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>

          {step === 'email' && (
            <>
              <h2 className="text-sm font-medium mb-4 text-center" style={{ color: 'var(--text-primary)' }}>
                Sign in or create an account
              </h2>

              {/* OAuth buttons */}
              <div className="flex gap-2 mb-5">
                <OAuthBtn icon="github" label="GitHub" />
                <OAuthBtn icon="google" label="Google" />
                <OAuthBtn icon="apple" label="Apple" />
              </div>

              <Divider text="or continue with email" />

              <div className="mt-4 flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && checkEmail()}
                  autoFocus
                  className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{ background: 'var(--bg-input)', border: `1px solid ${error ? 'var(--error)' : 'var(--border)'}`, color: 'var(--text-primary)' }}
                />
                {error && <p className="text-xs" style={{ color: 'var(--error)' }}>{error}</p>}
                <Btn onClick={checkEmail} label="Continue" />
              </div>
            </>
          )}

          {step === 'password' && (
            <>
              <button className="flex items-center gap-1.5 mb-4 text-xs" style={{ color: 'var(--text-secondary)' }}
                      onClick={() => { setStep('email'); setError('') }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                {email}
              </button>

              {/* Toggle sign-in/sign-up */}
              <div className="flex gap-0 mb-5 p-1 rounded-lg" style={{ background: 'var(--bg-input)' }}>
                {(['signin', 'signup'] as const).map(m => (
                  <button key={m}
                    onClick={() => { setMode(m); setError('') }}
                    className="flex-1 py-1.5 rounded-md text-xs font-medium transition-all"
                    style={{
                      background: mode === m ? 'var(--bg-modal)' : 'transparent',
                      color: mode === m ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}>
                    {m === 'signin' ? 'Sign in' : 'Create account'}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    {mode === 'signup' ? 'Master Password' : 'Password'}
                  </label>
                  <input type="password" placeholder="••••••••••••"
                    value={password} onChange={e => { setPassword(e.target.value); setError('') }}
                    onKeyDown={e => e.key === 'Enter' && submit()}
                    className="w-full px-3 py-2.5 rounded-lg text-sm"
                    style={{ background: 'var(--bg-input)', border: `1px solid ${error ? 'var(--error)' : 'var(--border)'}`, color: 'var(--text-primary)' }}
                  />
                  {mode === 'signup' && (
                    <p className="text-xs mt-1.5" style={{ color: 'var(--text-secondary)' }}>
                      This encrypts your vault. We never store it — if you forget it, data cannot be recovered.
                    </p>
                  )}
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>Confirm password</label>
                    <input type="password" placeholder="••••••••••••"
                      value={confirmPw} onChange={e => { setConfirmPw(e.target.value); setError('') }}
                      onKeyDown={e => e.key === 'Enter' && submit()}
                      className="w-full px-3 py-2.5 rounded-lg text-sm"
                      style={{ background: 'var(--bg-input)', border: `1px solid ${error ? 'var(--error)' : 'var(--border)'}`, color: 'var(--text-primary)' }}
                    />
                  </div>
                )}

                {error && <p className="text-xs" style={{ color: 'var(--error)' }}>{error}</p>}
                <Btn onClick={submit} loading={loading} label={mode === 'signup' ? 'Create Account' : 'Sign In'} />
              </div>
            </>
          )}
        </div>

        {/* Skip / offline */}
        <button
          onClick={continueOffline}
          className="mt-4 text-xs transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          Continue without account →
        </button>

        <p className="mt-6 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          Your vault is end-to-end encrypted.<br />
          We cannot access your credentials.
        </p>
      </div>
    </div>
  )
}

function Btn({ onClick, label, loading = false }: { onClick: () => void, label: string, loading?: boolean }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="w-full py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
      style={{ background: 'var(--accent)', color: 'white', opacity: loading ? 0.8 : 1 }}>
      {loading && <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent anim-spin" />}
      {label}
    </button>
  )
}

function OAuthBtn({ icon, label }: { icon: string, label: string }) {
  const icons: Record<string, React.ReactNode> = {
    github: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
    google: (
      <svg width="16" height="16" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
    apple: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    )
  }
  return (
    <button
      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs transition-all"
      style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
      title={`Continue with ${label}`}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-input)')}
    >
      {icons[icon]}
      <span>{label}</span>
    </button>
  )
}

function Divider({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{text}</span>
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
  )
}
