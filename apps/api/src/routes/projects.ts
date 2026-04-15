import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { eq, and } from 'drizzle-orm'
import { db } from '../lib/db'
import { projects } from '../lib/schema'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

router.get('/', async (req: AuthRequest, res: any) => {
  try {
    const list = await db.select().from(projects).where(eq(projects.userId, req.userId!))
    res.json(list)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req: AuthRequest, res: any) => {
  try {
    const { name, address, areaM2, houseModel, houseStyle } = req.body
    if (!name) return res.status(400).json({ error: 'Nome do projeto obrigatório' })
    const id = uuid()
    await db.insert(projects).values({ id, userId: req.userId!, name, address, areaM2, houseModel, houseStyle })
    const [created] = await db.select().from(projects).where(eq(projects.id, id))
    res.status(201).json(created)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req: AuthRequest, res: any) => {
  try {
    const [project] = await db.select().from(projects)
      .where(and(eq(projects.id, req.params.id), eq(projects.userId, req.userId!)))
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado' })
    res.json(project)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req: AuthRequest, res: any) => {
  try {
    const { name, address, areaM2, houseModel, houseStyle } = req.body
    await db.update(projects).set({ name, address, areaM2, houseModel, houseStyle })
      .where(and(eq(projects.id, req.params.id), eq(projects.userId, req.userId!)))
    const [updated] = await db.select().from(projects).where(eq(projects.id, req.params.id))
    res.json(updated)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req: AuthRequest, res: any) => {
  try {
    await db.delete(projects).where(and(eq(projects.id, req.params.id), eq(projects.userId, req.userId!)))
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
