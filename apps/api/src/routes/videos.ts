import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '../lib/db'
import { videos, scenes, users } from '../lib/schema'
import { authenticate, AuthRequest } from '../middleware/auth'
import { processVideo } from '../services/pipeline/videoProcessor'

const router = Router()
router.use(authenticate)

router.get('/', async (req: AuthRequest, res: any) => {
  try {
    const list = await db.select().from(videos)
      .where(eq(videos.userId, req.userId!))
      .orderBy(desc(videos.createdAt))
    res.json(list)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req: AuthRequest, res: any) => {
  try {
    const [video] = await db.select().from(videos)
      .where(and(eq(videos.id, req.params.id), eq(videos.userId, req.userId!)))
    if (!video) return res.status(404).json({ error: 'Vídeo não encontrado' })

    const sceneList = await db.select().from(scenes)
      .where(eq(scenes.videoId, req.params.id))
      .orderBy(scenes.order)

    res.json({ ...video, scenes: sceneList })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req: AuthRequest, res: any) => {
  try {
    const { title, projectId, engine, style, sourceImageUrl, address, areaM2, houseModel, houseStyle, customInstructions } = req.body
    if (!title) return res.status(400).json({ error: 'Título obrigatório' })

    const [user] = await db.select().from(users).where(eq(users.id, req.userId!))
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })
    if ((user.credits ?? 0) < 1) return res.status(402).json({ error: 'Créditos insuficientes' })

    const id = uuid()
    await db.insert(videos).values({
      id,
      userId: req.userId!,
      projectId,
      title,
      engine: engine || 'auto',
      style,
      sourceImageUrl,
      status: 'queued',
      progress: 0,
    })

    // Debitar 1 crédito
    await db.update(users).set({ credits: (user.credits ?? 0) - 1 }).where(eq(users.id, req.userId!))

    // Disparar pipeline em background
    processVideo(id).catch(console.error)

    const [created] = await db.select().from(videos).where(eq(videos.id, id))
    res.status(201).json(created)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req: AuthRequest, res: any) => {
  try {
    await db.delete(scenes).where(eq(scenes.videoId, req.params.id))
    await db.delete(videos).where(and(eq(videos.id, req.params.id), eq(videos.userId, req.userId!)))
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// Rota de prompts sem gerar vídeo (preview)
router.post('/preview-prompts', async (req: AuthRequest, res: any) => {
  try {
    const { generateScenePrompts } = await import('../services/ai/promptOrchestrator')
    const prompts = await generateScenePrompts(req.body)
    res.json({ scenes: prompts })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
