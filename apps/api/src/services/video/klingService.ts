import axios from 'axios'

const BASE = 'https://api.piapi.ai/api/v1'
const headers = () => ({ 'X-API-Key': process.env.PIAPI_API_KEY!, 'Content-Type': 'application/json' })

export async function generateVideo(opts: { promptText: string; promptImage?: string; duration?: 5 | 10 }): Promise<string> {
  const res = await axios.post(`${BASE}/task`, {
    model: 'kling-v1.6-pro',
    task_type: opts.promptImage ? 'image_to_video' : 'text_to_video',
    input: {
      prompt: opts.promptText,
      negative_prompt: 'low quality, blurry, distorted',
      cfg_scale: 0.5,
      duration: opts.duration || 10,
      aspect_ratio: '16:9',
      ...(opts.promptImage ? { image_url: opts.promptImage } : {}),
    },
  }, { headers: headers() })
  const taskId = res.data.data?.task_id
  if (!taskId) throw new Error('Kling: task_id ausente. Resposta: ' + JSON.stringify(res.data))
  return taskId
}

export async function waitForCompletion(taskId: string, timeoutMs = 300000): Promise<string> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const res = await axios.get(`${BASE}/task/${taskId}`, { headers: headers() })
    const d = res.data.data
    if (d.status === 'completed' && d.output?.works?.[0]?.resource?.resource) return d.output.works[0].resource.resource
    if (d.status === 'failed') throw new Error('Kling job failed')
    await new Promise(r => setTimeout(r, 10000))
  }
  throw new Error('Kling timeout')
}


