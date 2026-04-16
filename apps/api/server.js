// Servidor debug puro Node.js - sem TypeScript, sem dependências externas
const http = require('http')
const PORT = parseInt(process.env.PORT || '3001', 10)

process.stdout.write('[DEBUG] Node ' + process.version + '\n')
process.stdout.write('[DEBUG] PORT=' + PORT + '\n')
process.stdout.write('[DEBUG] CWD=' + process.cwd() + '\n')

const server = http.createServer((req, res) => {
  process.stdout.write('[DEBUG] ' + req.method + ' ' + req.url + '\n')
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ status: 'ok', version: '1.0.0' }))
})

server.listen(PORT, '0.0.0.0', () => {
  process.stdout.write('[DEBUG] Listening on 0.0.0.0:' + PORT + '\n')
})

server.on('error', (err) => {
  process.stderr.write('[DEBUG_ERROR] ' + err.message + '\n')
  process.exit(1)
})
