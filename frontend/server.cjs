// Clik — Frontend server para SeNode (runtime Node, sin Dockerfile)
// Sirve el build estático (dist/) con SPA fallback y proxya /api y /uploads
// al backend (BACKEND_URL). En producción: BACKEND_URL=https://<backend>.<dominio>
const http = require('http')
const https = require('https')
const fs = require('fs')
const path = require('path')

const DIST = path.join(__dirname, 'dist')
const PORT = process.env.PORT || 3000
const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json',
}

function proxy(req, res) {
  const backend = new URL(BACKEND_URL)
  const isHttps = backend.protocol === 'https:'
  const mod = isHttps ? https : http
  const options = {
    hostname: backend.hostname,
    port: backend.port || (isHttps ? 443 : 80),
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: backend.host,
    },
  }
  const upstream = mod.request(options, (upRes) => {
    res.writeHead(upRes.statusCode, upRes.headers)
    upRes.pipe(res)
  })
  upstream.on('error', (err) => {
    console.error('[proxy]', err.message)
    res.writeHead(502, { 'Content-Type': 'text/plain' })
    res.end('Bad Gateway')
  })
  req.pipe(upstream)
}

function serveStatic(req, res, urlPath) {
  let filePath = path.join(DIST, urlPath)
  if (urlPath === '/' || urlPath === '') filePath = path.join(DIST, 'index.html')

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html')
      fs.stat(filePath, (err2, stat2) => {
        if (err2 || !stat2.isFile()) return sendIndex(res)
        sendFile(res, filePath)
      })
      return
    }
    if (err || !stat.isFile()) return sendIndex(res) // SPA fallback
    sendFile(res, filePath)
  })
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase()
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
  fs.createReadStream(filePath).pipe(res)
}

function sendIndex(res) {
  sendFile(res, path.join(DIST, 'index.html'))
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
  const isDeployedCard = urlPath.startsWith('/tarjetas-digitales/') && urlPath !== '/tarjetas-digitales/'
  if (urlPath.startsWith('/api/') || urlPath.startsWith('/uploads/') || isDeployedCard) {
    return proxy(req, res)
  }
  return serveStatic(req, res, urlPath)
})

server.listen(PORT, () => {
  console.log(`[clik-frontend] sirviendo ${DIST} en :${PORT} — backend: ${BACKEND_URL}`)
})
