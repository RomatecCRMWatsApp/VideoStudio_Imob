process.stdout.write("MINIMAL SERVER STARTING\n")

import http from "http"

const PORT = parseInt(process.env.PORT || "3001", 10)

const server = http.createServer((req, res) => {
  process.stdout.write("REQUEST: " + req.url + "\n")
  res.writeHead(200, { "Content-Type": "application/json" })
  res.end(JSON.stringify({ status: "ok", version: "1.0.0", port: PORT }))
})

server.listen(PORT, "0.0.0.0", () => {
  process.stdout.write("MINIMAL SERVER RUNNING ON PORT " + PORT + "\n")
})

server.on("error", (err) => {
  process.stderr.write("SERVER ERROR: " + err.message + "\n")
  process.exit(1)
})
