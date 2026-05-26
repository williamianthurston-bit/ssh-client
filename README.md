# SSH Client

A Termius-style SSH client for Mac, built with Electron.

## Features

- 🖥️ **SSH Terminal** — full xterm.js terminal, 10k scroll buffer, 256 colours
- 📁 **SFTP Browser** — browse, download, upload files on remote servers
- 🔑 **SSH Key Management** — import keys from file or paste, OS-encrypted storage
- 📂 **Host Groups** — organise servers into colour-coded folders
- ⚡ **Quick Connect** — `user@host:port` in seconds without saving
- 🎨 **Termius aesthetic** — dark purple theme, native Mac traffic lights

## Download (Mac)

1. Go to [Releases](../../releases) on GitHub
2. Download the `.dmg` for your Mac:
   - **Apple Silicon (M1/M2/M3):** `SSH-Client-*-arm64.dmg`
   - **Intel Mac:** `SSH-Client-*-x64.dmg`
3. Open `.dmg` → drag **SSH Client** to `/Applications`
4. First launch: right-click → Open (bypasses Gatekeeper for unsigned apps)

## Development

### Prerequisites
- Node.js 20+
- npm 10+

### Setup
```bash
git clone https://github.com/williamianthurston-bit/ssh-client.git
cd ssh-client
npm install
```

### Run in dev mode
```bash
npm run dev
```
This opens Electron with hot-reload. DevTools are open by default.

### Build
```bash
npm run build          # Compile TypeScript + bundle
npm run dist:mac       # Build .dmg for both architectures
npm run dist:mac:arm64 # Apple Silicon only
npm run dist:mac:x64   # Intel only
```

Output in `dist/`.

### Release
Push a version tag to trigger GitHub Actions:
```bash
git tag v1.0.0
git push --tags
```
The macOS runner builds `.dmg` files and attaches them to the GitHub Release automatically.

## Architecture

```
src/
├── main/           ← Electron main process (Node.js)
│   ├── index.ts    ← App bootstrap + BrowserWindow
│   ├── ipc-handlers.ts  ← IPC channel registrations
│   ├── ssh-manager.ts   ← SSH session pool (ssh2)
│   ├── sftp-manager.ts  ← SFTP operations
│   ├── key-manager.ts   ← Key storage (OS keychain via safeStorage)
│   └── store.ts         ← electron-store schema
├── preload/
│   └── index.ts    ← contextBridge: window.api
└── renderer/       ← React 18 app
    └── src/
        ├── App.tsx
        ├── store/appStore.ts     ← Zustand state
        ├── components/
        │   ├── Sidebar/          ← Host list, groups, search
        │   ├── Terminal/         ← xterm.js + tab bar
        │   ├── SFTP/             ← File browser
        │   └── Modals/           ← Add host, group, key manager
        └── styles/global.css     ← Termius colour system
```

## Tech Stack

| Layer | Library |
|---|---|
| Desktop | Electron 31 |
| Build | electron-vite + Vite 5 |
| Frontend | React 18 + TypeScript |
| Terminal | xterm.js 5 |
| SSH/SFTP | ssh2 |
| State | Zustand |
| Styling | Tailwind CSS 3 |
| Storage | electron-store 8 |
| Packaging | electron-builder |
