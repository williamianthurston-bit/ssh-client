import { BrowserWindow } from 'electron'
import { Client, ClientChannel } from 'ssh2'
import type { ConnectConfig } from 'ssh2'

interface Session {
  client: Client
  stream: ClientChannel
  tabId: string
}

const sessions = new Map<string, Session>()

export interface ConnectOptions {
  tabId: string
  host: string
  port: number
  username: string
  authType: 'password' | 'key' | 'agent'
  password?: string
  privateKey?: string
  rows?: number
  cols?: number
}

export function connectSSH(opts: ConnectOptions, win: BrowserWindow): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = new Client()

    const config: ConnectConfig = {
      host: opts.host,
      port: opts.port,
      username: opts.username,
      readyTimeout: 20000,
      keepaliveInterval: 10000,
    }

    if (opts.authType === 'password' && opts.password) {
      config.password = opts.password
    } else if (opts.authType === 'key' && opts.privateKey) {
      config.privateKey = opts.privateKey
    } else if (opts.authType === 'agent') {
      config.agent = process.env.SSH_AUTH_SOCK
    }

    client.on('ready', () => {
      client.shell(
        {
          term: 'xterm-256color',
          rows: opts.rows || 24,
          cols: opts.cols || 80
        },
        (err, stream) => {
          if (err) {
            client.end()
            reject(err)
            return
          }

          sessions.set(opts.tabId, { client, stream, tabId: opts.tabId })

          stream.on('data', (data: Buffer) => {
            if (!win.isDestroyed()) {
              win.webContents.send(`ssh:data:${opts.tabId}`, data.toString('utf8'))
            }
          })

          stream.stderr.on('data', (data: Buffer) => {
            if (!win.isDestroyed()) {
              win.webContents.send(`ssh:data:${opts.tabId}`, data.toString('utf8'))
            }
          })

          stream.on('close', () => {
            sessions.delete(opts.tabId)
            if (!win.isDestroyed()) {
              win.webContents.send(`ssh:closed:${opts.tabId}`, 'Connection closed')
            }
          })

          resolve()
        }
      )
    })

    client.on('error', (err) => {
      reject(err)
    })

    client.on('close', () => {
      sessions.delete(opts.tabId)
      if (!win.isDestroyed()) {
        win.webContents.send(`ssh:closed:${opts.tabId}`, 'Connection closed')
      }
    })

    client.connect(config)
  })
}

export function writeSSH(tabId: string, data: string): void {
  const session = sessions.get(tabId)
  if (session) {
    session.stream.write(data)
  }
}

export function resizeSSH(tabId: string, rows: number, cols: number): void {
  const session = sessions.get(tabId)
  if (session && session.stream.setWindow) {
    session.stream.setWindow(rows, cols, rows * 16, cols * 9)
  }
}

export function disconnectSSH(tabId: string): void {
  const session = sessions.get(tabId)
  if (session) {
    session.client.end()
    sessions.delete(tabId)
  }
}

export function getActiveClient(tabId: string): Client | undefined {
  return sessions.get(tabId)?.client
}

export function isConnected(tabId: string): boolean {
  return sessions.has(tabId)
}
