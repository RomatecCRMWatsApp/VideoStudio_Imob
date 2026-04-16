import RunwayML from '@runwayml/sdk'

export async function generateVideo(opts: { promptText: string; promptImage?: string; duration?: 5 | 10 }): Promise<string> {
  const client = new RunwayML({ apiKey: process.env.RUNWAY_API_KEY! })
  const task = await client.imageToVideo.create({
    model: 'gen4_turbo',
    ...(opts.promptImage ? { promptImage: opts.promptImage } : {}),
    promptText: opts.promptText,
    duration: opts.duration || 10,
    ratio: '16:9',
  })
  return task.id
}

export async function waitForCompletion(jobId: string, timeoutMs = 300000): Promise<string> {
  const client = new RunwayML({ apiKey: process.env.RUNWAY_API_KEY! })
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const task = await client.tasks.retrieve(jobId)
    if (task.status === 'SUCCEEDED' && (task.output as string[])?.[0]) return (task.output as string[])[0]
    if (task.status === 'FAILED') throw new Error('Runway job failed')
    await new Promise(r => setTimeout(r, 8000))
  }
  throw new Error('Runway timeout')
}

