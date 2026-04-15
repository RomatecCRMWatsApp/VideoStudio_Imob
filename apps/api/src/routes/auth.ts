import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import { eq } from 'drizzle-orm'
import { db } from '../lib/db'
import { users } from '../lib/schema'

const router = Router()

router.post('/register', async (req: any, res: any) => {
  try {
    const { name, email, password, company, phone } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'Campos obrigatórios: name, email, password' })

    const existing = await db.select().from(users).where(eq(users.email, email))
    if (existing.length > 0) return res.status(400).json({ error: 'Email já cadastrado' })

    const hash = await bcrypt.hash(password, 10)
    const id = uuid()
    await db.insert(users).values({ id, name, email, password: hash, company, phone, credits: 10 })

    const token = jwt.sign({ userId: id }, process.env.JWT_SECRET!, { expiresIn: '7d' })
    res.status(201).json({ token, user: { id, name, email, company, phone, plan: 'free', credits: 10 } })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/login', async (req: any, res: any) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email e senha obrigatórios' })

    const [user] = await db.select().from(users).where(eq(users.email, email))
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' })

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, plan: user.plan, credits: user.credits, company: user.company } })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/me', async (req: any, res: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ error: 'Token não fornecido' })
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const [user] = await db.select().from(users).where(eq(users.id, payload.userId))
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })
    res.json({ id: user.id, name: user.name, email: user.email, plan: user.plan, credits: user.credits, company: user.company })
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
})

export default router
