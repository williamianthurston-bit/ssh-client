import React, { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import HostGroup from './HostGroup'
import HostItem from './HostItem'

export default function Sidebar(): React.ReactElement {
  const {
    groups, hosts, account,
    openAddHost, openAddGroup, setShowKeyManager,
    openPalette, setShowSettings,
  } = useAppStore()
  const [search, setSearch] = useState('')

  const ungrouped = hosts.filter(h => !h.groupId)
  const filtered = search
    ? ungrouped.filter(h => matchSearch(h.label, h.host, search))
    : ungrouped

  return (
    <div className="flex flex-col shrink-0 h-full"
         style={{ width: '240px', background: '#0C1A38', borderRight: '1px solid #0F2040' }}>

      {/* Traffic lights space + Termius logo */}
      <div className="titlebar-drag flex items-center px-4"
           style={{ height: '52px', borderBottom: '1px solid #0F2040' }}>
        <div className="titlebar-no-drag ml-[72px] flex items-center gap-2.5">
          {/* Termius bracket logo — blue→green gradient on corner marks */}
          <svg width="18" height="18" viewBox="0 0 64 64" fill="none">
            <path fillRule="evenodd" clipRule="evenodd"
              d="M15 5.5C9.753 5.5 5.5 9.753 5.5 15V22V23.5H8.5V22V15C8.5 11.41 11.41 8.5 15 8.5H22H23.5V5.5H22H15ZM58.5 15C58.5 9.753 54.247 5.5 49 5.5H42H40.5L40.5 8.5H42L49 8.5C52.59 8.5 55.5 11.41 55.5 15V22V23.5H58.5V22V15ZM58.5 49C58.5 54.247 54.247 58.5 49 58.5H42H40.5L40.5 55.5H42H49C52.59 55.5 55.5 52.59 55.5 49L55.5 42V40.5L58.5 40.5V42V49ZM5.5 49C5.5 54.247 9.753 58.5 15 58.5H22H23.5V55.5H22H15C11.41 55.5 8.5 52.59 8.5 49L8.5 42V40.5L5.5 40.5V42V49Z"
              fill="url(#termius-logo-gradient)"/>
            <path fillRule="evenodd" clipRule="evenodd"
              d="M41.256 24.628C41.256 29.227 38.032 33.072 33.721 34.028V35.93L37.07 39.279L33.721 42.628L37.07 45.977L32.047 51L28.698 47.651V33.802C24.813 32.562 22 28.924 22 24.628C22 19.311 26.311 15 31.628 15C36.945 15 41.256 19.311 41.256 24.628ZM34.558 22.954C34.558 24.572 33.246 25.884 31.628 25.884C30.01 25.884 28.698 24.572 28.698 22.954C28.698 21.335 30.01 20.023 31.628 20.023C33.246 20.023 34.558 21.335 34.558 22.954Z"
              fill="url(#termius-logo-gradient2)"/>
            <defs>
              <linearGradient id="termius-logo-gradient" x1="5.5" y1="5" x2="61" y2="8" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2091F6"/>
                <stop offset="1" stopColor="#21B568"/>
              </linearGradient>
              <linearGradient id="termius-logo-gradient2" x1="22" y1="14.5" x2="42" y2="15" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2091F6"/>
                <stop offset="1" stopColor="#21B568"/>
              </linearGradient>
            </defs>
          </svg>
          <span className="text-sm font-semibold" style={{ color: '#F7F9FA', letterSpacing: '-0.01em' }}>
            SSH Client
          </span>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-3 py-2" style={{ borderBottom: '1px solid #0F2040' }}>
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
               width="12" height="12" viewBox="0 0 16 16" fill="none"
               style={{ color: '#4D6EA9' }}>
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search hosts…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="titlebar-no-drag w-full pl-8 pr-3 py-1.5 rounded-md text-xs"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid #1A2F54',
              color: '#F7F9FA',
            }}
          />
          {!search && (
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-1 rounded"
                 style={{ background: '#1A2F54', color: '#5A5E73', fontSize: '10px' }}
                 onClick={openPalette}>⌘J</kbd>
          )}
        </div>
      </div>

      {/* Section label + actions */}
      <div className="titlebar-no-drag flex items-center justify-between px-3 pt-3 pb-1.5">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#4D6EA9', fontSize: '10px' }}>
          All Hosts
        </span>
        <div className="flex gap-0.5">
          <SideBtn title="New Host" onClick={() => openAddHost()}>
            {/* Termius circle-plus icon */}
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path fillRule="evenodd" clipRule="evenodd"
                d="M14.5 8C14.5 11.59 11.59 14.5 8 14.5C4.41 14.5 1.5 11.59 1.5 8C1.5 4.41 4.41 1.5 8 1.5C11.59 1.5 14.5 4.41 14.5 8ZM16 8C16 12.418 12.418 16 8 16C3.582 16 0 12.418 0 8C0 3.582 3.582 0 8 0C12.418 0 16 3.582 16 8ZM8.007 4C8.449 3.996 8.804 4.351 8.8 4.793L8.779 7.221L11.207 7.2C11.649 7.196 12.004 7.551 12 7.993C11.996 8.435 11.635 8.796 11.193 8.8L8.765 8.821L8.744 11.193C8.74 11.635 8.379 11.996 7.937 12C7.495 12.004 7.14 11.649 7.144 11.207L7.165 8.835L4.793 8.856C4.351 8.86 3.996 8.505 4 8.063C4.004 7.621 4.365 7.26 4.807 7.256L7.179 7.235L7.2 4.807C7.204 4.365 7.565 4.004 8.007 4Z"
                fill="currentColor"/>
            </svg>
          </SideBtn>
          <SideBtn title="New Group" onClick={openAddGroup}>
            {/* folder+ icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              <line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
            </svg>
          </SideBtn>
        </div>
      </div>

      {/* Host list */}
      <div className="flex-1 overflow-y-auto">
        {hosts.length === 0 && !search ? (
          <EmptyVault onAddHost={() => openAddHost()} />
        ) : (
          <>
            {groups.map(group => (
              <HostGroup key={group.id} group={group} searchTerm={search} />
            ))}
            {filtered.map(host => (
              <HostItem key={host.id} host={host} indent={0} />
            ))}
          </>
        )}
      </div>

      {/* Bottom nav */}
      <div className="shrink-0" style={{ borderTop: '1px solid #0F2040' }}>
        <NavBtn
          icon={<SettingsIcon />}
          label="Settings"
          onClick={() => setShowSettings(true)}
        />

        {/* Account badge */}
        {account ? (
          <div className="flex items-center gap-2.5 px-3 py-2.5" style={{ borderTop: '1px solid #0F2040' }}>
            {/* Avatar with gradient background */}
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                 style={{ background: 'linear-gradient(135deg, #2091F6, #21B568)', color: 'white' }}>
              {account.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate" style={{ color: '#F7F9FA' }}>{account.email}</div>
              <div className="text-xs" style={{ color: account.synced ? '#21B568' : '#4D6EA9' }}>
                {account.synced ? '● Synced' : '○ Local only'}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderTop: '1px solid #0F2040' }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                 style={{ background: '#1A2F54', color: '#5A5E73' }}>
              W
            </div>
            <span className="text-xs" style={{ color: '#5A5E73' }}>Local only</span>
          </div>
        )}
      </div>
    </div>
  )
}

function matchSearch(label: string, host: string, q: string) {
  return label.toLowerCase().includes(q.toLowerCase()) || host.toLowerCase().includes(q.toLowerCase())
}

function SideBtn({ children, title, onClick }: { children: React.ReactNode, title: string, onClick: () => void }) {
  return (
    <button title={title} onClick={onClick}
      className="titlebar-no-drag w-6 h-6 rounded flex items-center justify-center"
      style={{ color: '#4D6EA9' }}
      onMouseEnter={e => { e.currentTarget.style.color = '#2091F6' }}
      onMouseLeave={e => { e.currentTarget.style.color = '#4D6EA9' }}
    >{children}</button>
  )
}

function NavBtn({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full titlebar-no-drag flex items-center gap-3 px-3 py-2.5 text-xs"
      style={{ color: '#8D91A5' }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(32,145,246,0.06)'
        e.currentTarget.style.color = '#F7F9FA'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = '#8D91A5'
      }}
    >
      {icon}
      {label}
    </button>
  )
}

function EmptyVault({ onAddHost }: { onAddHost: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 mt-12 px-5">
      {/* Server icon with gradient */}
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
           style={{ background: 'rgba(32,145,246,0.1)', border: '1px solid rgba(32,145,246,0.2)' }}>
        <svg width="22" height="20" viewBox="0 0 21 20" fill="none">
          <path d="M0,1.997C0,0.894,0.902,0,1.995,0H19.005C20.107,0,21,0.896,21,1.997V9H0V1.997ZM15,7c1.105,0,2-0.895,2-2s-0.895-2-2-2-2,0.895-2,2,0.895,2,2,2ZM6,3v3c0,0.556,0.448,1,1,1s1-0.448,1-1V3c0-0.556-0.448-1-1-1S6,2.448,6,3ZM3,3v3c0,0.556,0.448,1,1,1s1-0.448,1-1V3c0-0.556-0.448-1-1-1S3,2.448,3,3ZM9,3v3c0,0.556,0.448,1,1,1s1-0.448,1-1V3c0-0.556-0.448-1-1-1S9,2.448,9,3Z"
            fill="url(#empty-grad)"/>
          <path d="M0,11H21v7.003C21,19.106,20.098,20,19.005,20H1.995C0.893,20,0,19.104,0,18.003V11ZM15,17c1.105,0,2-0.895,2-2s-0.895-2-2-2-2,0.895-2,2,0.895,2,2,2ZM9,14v3c0,0.556,0.448,1,1,1s1-0.448,1-1v-3c0-0.556-0.448-1-1-1S9,13.448,9,14ZM3,14v3c0,0.556,0.448,1,1,1s1-0.448,1-1v-3c0-0.556-0.448-1-1-1S3,13.448,3,14ZM6,14v3c0,0.556,0.448,1,1,1s1-0.448,1-1v-3c0-0.556-0.448-1-1-1S6,13.448,6,14Z"
            fill="url(#empty-grad)"/>
          <defs>
            <linearGradient id="empty-grad" x1="0" y1="0" x2="21" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2091F6"/>
              <stop offset="1" stopColor="#21B568"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <p className="text-xs text-center leading-relaxed" style={{ color: '#5A5E73' }}>
        No hosts yet.<br/>Add your first server to get started.
      </p>
      <button onClick={onAddHost}
        className="text-xs px-4 py-2 rounded-lg font-medium"
        style={{ background: '#2091F6', color: 'white' }}>
        New Host
      </button>
    </div>
  )
}

/* ── Icons ── */
const SettingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)
