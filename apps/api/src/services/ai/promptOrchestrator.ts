import Anthropic from '@anthropic-ai/sdk'

export interface ProjectInput {
  address?: string
  areaM2?: number
  houseModel?: string
  houseStyle?: string
  customInstructions?: string
}

export async function generateScenePrompts(input: ProjectInput) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY!, timeout: 60000, maxRetries: 0 })

  const userContent = `Generate 7 scene prompts for real estate construction video. Land: ${input.areaM2 ?? '?'}m2, Style: ${input.houseStyle ?? 'modern'}, Model: ${input.houseModel ?? 'standard'}. ${input.customInstructions ?? ''}

Return JSON: {"scenes":[{"order":1,"type":"terrain_delimitation","title":"Delimitacao","prompt":"...","engine":"runway","durationSecs":8},{"order":2,"type":"explosion_clearing","title":"Limpeza","prompt":"...","engine":"kling","durationSecs":8},{"order":3,"type":"foundation","title":"Fundacao","prompt":"...","engine":"runway","durationSecs":10},{"order":4,"type":"structure_rising","title":"Estrutura","prompt":"...","engine":"runway","durationSecs":10},{"order":5,"type":"roofing_finishing","title":"Cobertura","prompt":"...","engine":"kling","durationSecs":10},{"order":6,"type":"house_model_overlay","title":"Modelo","prompt":"...","engine":"runway","durationSecs":8},{"order":7,"type":"final_reveal","title":"Reveal Final","prompt":"...","engine":"veo3","durationSecs":12}]}`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    system: 'You are a cinematic AI video prompt specialist for Brazilian real estate. Generate optimized prompts for Runway Gen-4.5 and Kling 3.0. Prompts in ENGLISH, max 200 words each. Return ONLY valid JSON.',
    messages: [
      {
        role: 'user',
        content: userContent.trim()
      }
    ]
  })

  const block = response.content[0]
  if (!block || block.type !== 'text' || !block.text.trim()) {
    throw new Error('Resposta vazia da API Anthropic')
  }

  const cleaned = block.text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
  return JSON.parse(cleaned).scenes
}

