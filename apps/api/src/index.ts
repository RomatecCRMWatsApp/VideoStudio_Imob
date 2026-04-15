process.stdout.write("[STARTUP] process started\n")

import "dotenv/config"
import express from "express"
import cors from "cors"
import multer from "multer"
import path from "path"
import { v4 as uuid } from "uuid"

const app = express()
const PORT = parseInt(process.env.PORT || "3001", 10)

process.stdout.write(`[STARTUP] PORT configured: ${PORT}\n`)

app.use(cors({ origin: "*" }))
app.use(express.json({ limit: "50mb" }))
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")))

const storage = multer.diskStorage({
  destination: path.join(process.cwd(), "uploads"),
  filename: (req, file, cb) => cb(null, uuid() + path.extname(file.originalname)),
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

// Estado de bootstrap
let bootstrapState = { ready: false, error: null as string | null }

// ============ HEALTH ENDPOINTS (sempre disponíveis) ============
app.get("/health", (req: any, res: any) => {
  res.status(200).json({ status: "ok", version: "1.0.0", ready: bootstrapState.ready })
})

app.get("/status", (req: any, res: any) => {
  res.status(200).json({
    ready: bootstrapState.ready,
    error: bootstrapState.error,
    uptime: process.uptime(),
  })
})

app.get("/", (req: any, res: any) => {
  res.json({ message: "VideoStudio API", ready: bootstrapState.ready })
})

// ============ UPLOAD ENDPOINT ============
app.post("/api/upload", upload.single("image"), (req: any, res: any) => {
  if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado" })
  const url = (process.env.API_URL || "") + "/uploads/" + req.file.filename
  res.json({ url })
})

// ============ BOOTSTRAP FUNCTION (non-blocking) ============
async function loadRoutes() {
  try {
    process.stdout.write("[BOOTSTRAP] Starting route loading...\n")

    process.stdout.write("[BOOTSTRAP] Loading auth routes...\n")
    const { default: authRoutes } = await import("./routes/auth")
    app.use("/api/auth", authRoutes)
    process.stdout.write("[BOOTSTRAP] Auth routes loaded ✓\n")

    process.stdout.write("[BOOTSTRAP] Loading project routes...\n")
    const { default: projectRoutes } = await import("./routes/projects")
    app.use("/api/projects", projectRoutes)
    process.stdout.write("[BOOTSTRAP] Project routes loaded ✓\n")

    process.stdout.write("[BOOTSTRAP] Loading video routes...\n")
    const { default: videoRoutes } = await import("./routes/videos")
    app.use("/api/videos", videoRoutes)
    process.stdout.write("[BOOTSTRAP] Video routes loaded ✓\n")

    bootstrapState.ready = true
    bootstrapState.error = null
    process.stdout.write("[BOOTSTRAP] ✓ All routes ready\n")
  } catch (err: any) {
    const errMsg = err?.stack || err?.message || String(err)
    process.stderr.write(`[BOOTSTRAP_ERROR] ${errMsg}\n`)
    bootstrapState.error = errMsg
    // NÃO faz exit - deixa o servidor rodando mesmo com erro nas rotas
    process.stderr.write("[BOOTSTRAP_ERROR] Server still running for /health checks\n")
  }
}

// ============ START SERVER IMMEDIATELY ============
const server = app.listen(PORT, "0.0.0.0", () => {
  process.stdout.write(`[STARTUP] ✓ VideoStudio API listening on 0.0.0.0:${PORT}\n`)
  process.stdout.write("[STARTUP] /health endpoint available\n")
})

server.on("error", (err: any) => {
  process.stderr.write(`[SERVER_ERROR] ${err?.message || String(err)}\n`)
  process.exit(1)
})

// ============ LOAD ROUTES IN BACKGROUND (non-blocking) ============
loadRoutes().catch((err) => {
  process.stderr.write(`[FATAL] Unhandled error in loadRoutes: ${err?.message || String(err)}\n`)
})
