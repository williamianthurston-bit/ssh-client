import React, { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '../../store/appStore'
import FileTree from './FileTree'

interface Props {
  tabId: string
}

export interface FileEntry {
  filename: string
  longname: string
  attrs: {
    size: number
    mtime: number
    isDirectory: boolean
    isSymbolicLink: boolean
    mode: number
    permissions: string
  }
}

export default function SFTPPanel({ tabId }: Props): React.ReactElement {
  const { setSFTPPath, sessions } = useAppStore()
  const session = sessions.find(s => s.tabId === tabId)
  const currentPath = session?.sftpPath || '/'

  const [entries, setEntries] = useState<FileEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [initialized, setInitialized] = useState(false)
  const [transferMsg, setTransferMsg] = useState('')

  const navigate = useCallback(async (path: string) => {
    setLoading(true)
    setError('')
    try {
      const list = await window.api.sftp.readdir(tabId, path)
      setEntries(list)
      setSFTPPath(tabId, path)
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }, [tabId])

  // Initialize SFTP when panel opens
  useEffect(() => {
    if (initialized) return
    const init = async () => {
      setLoading(true)
      try {
        await window.api.sftp.open(tabId)
        setInitialized(true)
        await navigate(currentPath)
      } catch (err: any) {
        setError('Failed to open SFTP: ' + err.message)
        setLoading(false)
      }
    }
    init()
  }, [tabId])

  const handleDownload = async (remotePath: string) => {
    try {
      setTransferMsg('Downloading…')
      const dest = await window.api.sftp.download(tabId, remotePath)
      setTransferMsg(`Downloaded to ${dest.split('/').pop()}`)
      setTimeout(() => setTransferMsg(''), 3000)
    } catch (err: any) {
      if (err.message !== 'Cancelled') setError(err.message)
    }
  }

  const handleUpload = async () => {
    try {
      setTransferMsg('Uploading…')
      await window.api.sftp.upload(tabId, currentPath)
      await navigate(currentPath)
      setTransferMsg('Upload complete')
      setTimeout(() => setTransferMsg(''), 3000)
    } catch (err: any) {
      if (err.message !== 'Cancelled') setError(err.message)
    }
  }

  const handleDelete = async (remotePath: string, isDir: boolean) => {
    if (!confirm(`Delete ${remotePath}?`)) return
    try {
      await window.api.sftp.delete(tabId, remotePath, isDir)
      await navigate(currentPath)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleMkdir = async () => {
    const name = prompt('New folder name:')
    if (!name) return
    try {
      await window.api.sftp.mkdir(tabId, `${currentPath}/${name}`.replace('//', '/'))
      await navigate(currentPath)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const goUp = () => {
    const parts = currentPath.split('/').filter(Boolean)
    parts.pop()
    navigate('/' + parts.join('/') || '/')
  }

  // Breadcrumb parts
  const breadcrumbs = ['/', ...currentPath.split('/').filter(Boolean)]

  return (
    <div
      className="flex flex-col border-l animate-slide-in"
      style={{
        width: '320px',
        minWidth: '280px',
        background: 'var(--bg-sidebar)',
        borderColor: 'var(--border)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>SFTP</span>
        </div>
        <div className="flex items-center gap-1">
          <ActionBtn title="Upload file" onClick={handleUpload}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
          </ActionBtn>
          <ActionBtn title="New folder" onClick={handleMkdir}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" />
            </svg>
          </ActionBtn>
          <ActionBtn title="Refresh" onClick={() => navigate(currentPath)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </ActionBtn>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-0.5 px-3 py-1.5 border-b overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
        {currentPath !== '/' && (
          <button
            onClick={goUp}
            className="shrink-0 p-1 rounded transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-0.5 text-xs overflow-x-auto">
          {breadcrumbs.map((part, i) => {
            const path = '/' + breadcrumbs.slice(1, i + 1).join('/')
            return (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ color: 'var(--border)' }}>/</span>}
                <button
                  onClick={() => navigate(path === '/' ? '/' : path)}
                  className="shrink-0 px-0.5 py-0.5 rounded transition-colors hover:text-white"
                  style={{ color: i === breadcrumbs.length - 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}
                >
                  {part}
                </button>
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center h-16">
            <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          </div>
        )}
        {error && (
          <div className="p-3 m-2 rounded-lg text-xs" style={{ background: 'rgba(224,93,93,0.1)', color: 'var(--error)', border: '1px solid rgba(224,93,93,0.2)' }}>
            {error}
          </div>
        )}
        {!loading && !error && (
          <FileTree
            entries={entries}
            currentPath={currentPath}
            onNavigate={navigate}
            onDownload={handleDownload}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Transfer status */}
      {transferMsg && (
        <div className="px-3 py-2 border-t text-xs" style={{ borderColor: 'var(--border)', color: 'var(--success)' }}>
          {transferMsg}
        </div>
      )}
    </div>
  )
}

function ActionBtn({ children, title, onClick }: { children: React.ReactNode, title: string, onClick: () => void }): React.ReactElement {
  return (
    <button
      title={title}
      onClick={onClick}
      className="w-6 h-6 rounded flex items-center justify-center transition-colors"
      style={{ color: 'var(--text-muted)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-light)'; e.currentTarget.style.color = 'var(--accent)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
    >
      {children}
    </button>
  )
}
