import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import { v4 as uuid } from 'uuid'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '50mb' }))
app.use('/uploads', express.static('uploads'))

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_, file, cb) => cb(null, ${uuid()}),
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

app.post('/api/upload', upload.single('image'), (req: any, res: any) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' })
  res.json({ url: ${process.env.API_URL || 'http://localhost:3001'}/uploads/ })
})

app.get('/health', (_: any, res: any) => res.json({ status: 'ok', version: '1.0.0' }))

app.listen(PORT, () => console.log(VideoStudio API rodando na porta ))
