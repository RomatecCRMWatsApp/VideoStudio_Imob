import { eq } from 'drizzle-orm'
import { db } from '../../lib/db'
import { videos, scenes } from '../../lib/schema'
import { generateScenePrompts } from '../ai/promptOrchestrator'
import * as runway from '../video/runwayService'
import * as kling from '../video/klingService'
import * as veo from '../video/veoService'
import { v4 as uuid } from 'uuid'

const activeJobs = new Set<string>()

async function processScene(scene: typeof scenes.$inferSelect): Promise<string> {
  const opts = { promptText: scene.prompt, duration: (scene.durationSecs || 10) as 5 | 10 }
  switch (scene.engine) {
    case 'kling': {
      const jobId = await kling.generateVideo(opts)
      return kling.waitForCompletion(jobId)
    }
    case 'veo3': {
      const opName = await veo.generateVideo({ promptText: scene.prompt, durationSecs: (scene.durationSecs || 8) as 8 | 16 })
      return veo.waitForCompletion(opName)
    }
    default: {
      const jobId = await runway.generateVideo(opts)
      return runway.waitForCompletion(jobId)
    }
  }
}

export async function processVideo(videoId: string) {
  if (activeJobs.has(videoId)) return
  activeJobs.add(videoId)

  try {
    const [video] = await db.select().from(videos).where(eq(videos.id, videoId))
    if (!video) throw new Error('Video não encontrado')

    await db.update(videos).set({ status: 'processing', progress: 5 }).where(eq(videos.id, videoId))

    // 1. Generate prompts via Claude
    const scenePrompts = await generateScenePrompts({
      address: video.title,
      areaM2: undefined,
      houseModel: undefined,
      houseStyle: undefined,
    })

    // 2. Insert scenes
    const sceneRecords = await Promise.all(
      scenePrompts.map(async (s: any) => {
        const id = uuid()
        await db.insert(scenes).values({
          id,
          videoId,
          order: s.order,
          type: s.type,
          prompt: s.prompt,
          engine: s.engine,
          durationSecs: s.durationSecs,
          status: 'pending',
        })
        return { ...s, id }
      })
    )

    await db.update(videos).set({ progress: 15 }).where(eq(videos.id, videoId))

    // 3. Process each scene sequentially (saves API quota)
    const total = sceneRecords.length
    for (let i = 0; i < total; i++) {
      const scene = sceneRecords[i]
      await db.update(scenes).set({ status: 'processing' }).where(eq(scenes.id, scene.id))

      try {
        const [dbScene] = await db.select().from(scenes).where(eq(scenes.id, scene.id))
        const outputUrl = await processScene(dbScene)
        await db.update(scenes).set({ status: 'completed', outputUrl }).where(eq(scenes.id, scene.id))
      } catch (e: any) {
        await db.update(scenes).set({ status: 'failed' }).where(eq(scenes.id, scene.id))
      }

      const progress = Math.round(15 + ((i + 1) / total) * 80)
      await db.update(videos).set({ progress }).where(eq(videos.id, videoId))
    }

    // 4. Mark video complete with first completed scene as output
    const completedScenes = await db.select().from(scenes)
      .where(eq(scenes.videoId, videoId))
    const firstOutput = completedScenes.find(s => s.outputUrl)?.outputUrl ?? null

    await db.update(videos).set({
      status: 'completed',
      progress: 100,
      outputUrl: firstOutput,
    }).where(eq(videos.id, videoId))

  } catch (err: any) {
    await db.update(videos).set({ status: 'failed', errorMsg: err.message }).where(eq(videos.id, videoId))
  } finally {
    activeJobs.delete(videoId)
  }
}
