/**
 * Static file server for the SSH Client web preview.
 * Serves out/renderer/ at localhost:8772
 * Accessed publicly at https://ssh-preview.nueramind.com
 */
const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 8772
const ROOT = path.join(__dirname, 'out', 'renderer')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
}

const server = http.createServer((req, res) => {
  // Strip query strings
  let urlPath = req.url.split('?')[0]

  // Map / to index.html, fallback all routes to index.html (SPA)
  let filePath = path.join(ROOT, urlPath)

  // Security: prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return
  }

  // If directory or file not found, serve index.html (SPA routing)
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(ROOT, 'index.html')
  }

  const ext = path.extname(filePath)
  const contentType = MIME[ext] || 'application/octet-stream'

  // Long cache for hashed assets, no-cache for html
  const cacheHeader = ext === '.html'
    ? 'no-cache'
    : 'public, max-age=31536000, immutable'

  try {
    const content = fs.readFileSync(filePath)
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': cacheHeader,
    })
    res.end(content)
  } catch (err) {
    res.writeHead(500); res.end('Server Error')
  }
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[ssh-preview] serving ${ROOT} on http://0.0.0.0:${PORT}`)
})
