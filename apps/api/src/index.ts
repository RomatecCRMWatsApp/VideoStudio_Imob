process.stdout.write("[STARTUP] process started\n")

import "dotenv/config"
import express from "express"
import cors from "cors"
import multer from "multer"
import path from "path"
import { v4 as uuid } from "uuid"

const app = express()
const PORT = parseInt(process.env.PORT || "3001", 10)

app.use(cors({ origin: "*" }))
app.use(express.json({ limit: "50mb" }))
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")))

const storage = multer.diskStorage({
  destination: path.join(process.cwd(), "uploads"),
  filename: (req, file, cb) => cb(null, uuid() + path.extname(file.originalname)),
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

app.post("/api/upload", upload.single("image"), (req: any, res: any) => {
  if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado" })
  const url = (process.env.API_URL || "") + "/uploads/" + req.file.filename
  res.json({ url })
})

app.get("/health", (req: any, res: any) => res.json({ status: "ok", version: "1.0.0" }))

async function bootstrap() {
  try {
    process.stdout.write("[STARTUP] Loading auth routes...\n")
    const { default: authRoutes } = await import("./routes/auth")
    process.stdout.write("[STARTUP] Loading project routes...\n")
    const { default: projectRoutes } = await import("./routes/projects")
    process.stdout.write("[STARTUP] Loading video routes...\n")
    const { default: videoRoutes } = await import("./routes/videos")
    process.stdout.write("[STARTUP] All routes loaded\n")

    app.use("/api/auth", authRoutes)
    app.use("/api/projects", projectRoutes)
    app.use("/api/videos", videoRoutes)

    app.listen(PORT, "0.0.0.0", () => {
      process.stdout.write("VideoStudio API rodando na porta " + PORT + "\n")
    })
  } catch (err: any) {
    process.stderr.write("[FATAL] Bootstrap error: " + (err?.stack || err?.message || String(err)) + "\n")
    process.exit(1)
  }
}

bootstrap()
