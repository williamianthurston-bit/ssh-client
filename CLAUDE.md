# SSH Client — Project CLAUDE.md

## What It Is
A Termius-style Mac SSH client built with Electron. Users save SSH hosts, connect via terminal, browse files over SFTP, and manage SSH keys. Distributed as a `.dmg` via GitHub Releases.

## Key Paths
- **Source**: `/home/aifactory/projects/ssh-client/`
- **GitHub**: `williamianthurston-bit/ssh-client`
- **Release flow**: `git tag vX.Y.Z && git push --tags` → GitHub Actions builds `.dmg`

## Architecture
- **Main process** (`src/main/`): ssh-manager, sftp-manager, key-manager, store
- **Preload** (`src/preload/index.ts`): `window.api` — all IPC bridged here
- **Renderer** (`src/renderer/src/`): React + Zustand + Tailwind + xterm.js

## Critical Design Decisions
- **Passwords/keys encrypted with `safeStorage`** (Electron OS keychain wrapper) — never plaintext on disk
- **One ssh2 `Client` per tab**, one SFTP channel per client — don't open second Client for SFTP
- **IPC channels** for SSH data are `ssh:data:<tabId>` and `ssh:closed:<tabId>` — dynamic channel names
- **Preload never uses `require`** — all Node access via `ipcRenderer.invoke`

## Dev Commands
```bash
npm run dev           # Electron + Vite hot-reload
npm run build         # Compile to out/
npm run dist:mac      # Build .dmg (both arches)
```

## No Docker Needed
This is a desktop app. No containers, no nginx, no Cloudflare tunnel.
Deploy = tag + push. GitHub Actions handles the Mac build.

## Testing
```bash
npm run build && ./tests/health.sh
```
