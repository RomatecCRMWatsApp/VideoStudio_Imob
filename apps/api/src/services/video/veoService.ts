import axios from 'axios'

const BASE = 'https://generativelanguage.googleapis.com/v1beta'

export async function generateVideo(opts: { promptText: string; durationSecs?: 8 | 16; generateAudio?: boolean }): Promise<string> {
  const res = await axios.post(
    `${BASE}/models/veo-3.1-fast-generate-preview:predictLongRunning?key=${process.env.VEO_API_KEY}`,
    { instances: [{ prompt: opts.promptText }], parameters: { aspectRatio: '16:9', durationSeconds: opts.durationSecs || 8, generateAudio: opts.generateAudio ?? true } }
  )
  return res.data.name
}

export async function waitForCompletion(operationName: string, timeoutMs = 600000): Promise<string> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const res = await axios.get(`${BASE}/${operationName}?key=${process.env.VEO_API_KEY}`)
    const d = res.data
    if (d.done && d.response?.predictions?.[0]?.video?.uri) return d.response.predictions[0].video.uri
    if (d.error) throw new Error(`Veo failed: ${d.error.message}`)
    await new Promise(r => setTimeout(r, 15000))
  }
  throw new Error('Veo timeout')
}
