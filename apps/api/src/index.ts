import "dotenv/config"
import express from "express"
import cors from "cors"
import multer from "multer"
import path from "path"
import { v4 as uuid } from "uuid"

const app = express()
const PORT = parseInt(process.env.PORT || "3001", 10)

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }))
app.use(express.json({ limit: "50mb" }))
app.use("/uploads", express.static("uploads"))

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => { cb(null, uuid() + path.extname(file.originalname)) },
})

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado" })
  const url = (process.env.API_URL || "http://localhost:3001") + "/uploads/" + req.file.filename
  res.json({ url })
})

app.get("/health", (req, res) => {
  res.json({ status: "ok", version: "1.0.0" })
})

app.listen(PORT, "0.0.0.0", () => {
  console.log("VideoStudio API rodando na porta " + PORT)
})
