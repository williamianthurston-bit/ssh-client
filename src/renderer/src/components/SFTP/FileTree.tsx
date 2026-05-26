import React, { useState } from 'react'
import { FileEntry } from './SFTPPanel'

interface Props {
  entries: FileEntry[]
  currentPath: string
  onNavigate: (path: string) => void
  onDownload: (remotePath: string) => void
  onDelete: (remotePath: string, isDir: boolean) => void
}

export default function FileTree({ entries, currentPath, onNavigate, onDownload, onDelete }: Props): React.ReactElement {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; entry: FileEntry } | null>(null)

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-20 text-xs" style={{ color: 'var(--text-muted)' }}>
        Empty directory
      </div>
    )
  }

  const getPath = (filename: string) =>
    (currentPath === '/' ? '/' + filename : currentPath + '/' + filename).replace('//', '/')

  return (
    <>
      <div className="py-1">
        {entries.map(entry => (
          <div
            key={entry.filename}
            className="flex items-center gap-2 px-3 py-1.5 cursor-pointer group/file transition-colors"
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            onDoubleClick={() => {
              if (entry.attrs.isDirectory) {
                onNavigate(getPath(entry.filename))
              } else {
                onDownload(getPath(entry.filename))
              }
            }}
            onContextMenu={e => {
              e.preventDefault()
              setContextMenu({ x: e.clientX, y: e.clientY, entry })
            }}
          >
            {/* Icon */}
            <div className="shrink-0">
              {entry.attrs.isDirectory ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ color: '#F5A623' }}>
                  <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                  <polyline points="13 2 13 9 20 9" />
                </svg>
              )}
            </div>

            {/* Name */}
            <span className="flex-1 text-xs truncate" style={{ color: 'var(--text-primary)' }}>
              {entry.filename}
            </span>

            {/* Size */}
            {!entry.attrs.isDirectory && (
              <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                {formatSize(entry.attrs.size)}
              </span>
            )}

            {/* Quick download */}
            {!entry.attrs.isDirectory && (
              <button
                className="opacity-0 group-hover/file:opacity-100 shrink-0 transition-opacity"
                onClick={e => { e.stopPropagation(); onDownload(getPath(entry.filename)) }}
                title="Download"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
                  <polyline points="8 17 12 21 16 17" /><line x1="12" y1="12" x2="12" y2="21" />
                  <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
          <div
            className="fixed z-50 rounded-lg py-1 animate-fade-in"
            style={{
              left: contextMenu.x, top: contextMenu.y,
              background: 'var(--modal-bg)',
              border: '1px solid var(--border)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              minWidth: '150px'
            }}
          >
            {contextMenu.entry.attrs.isDirectory ? (
              <CtxItem onClick={() => { onNavigate(getPath(contextMenu.entry.filename)); setContextMenu(null) }}>
                Open
              </CtxItem>
            ) : (
              <CtxItem onClick={() => { onDownload(getPath(contextMenu.entry.filename)); setContextMenu(null) }}>
                Download
              </CtxItem>
            )}
            <div className="my-1" style={{ borderTop: '1px solid var(--border)' }} />
            <CtxItem danger onClick={() => { onDelete(getPath(contextMenu.entry.filename), contextMenu.entry.attrs.isDirectory); setContextMenu(null) }}>
              Delete
            </CtxItem>
          </div>
        </>
      )}
    </>
  )
}

function CtxItem({ children, onClick, danger }: { children: React.ReactNode, onClick: () => void, danger?: boolean }) {
  return (
    <button
      className="w-full flex items-center px-3 py-1.5 text-xs transition-colors"
      style={{ color: danger ? 'var(--error)' : 'var(--text-primary)' }}
      onClick={onClick}
      onMouseEnter={e => (e.currentTarget.style.background = danger ? 'rgba(224,93,93,0.12)' : 'var(--accent-light)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {children}
    </button>
  )
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`
}
