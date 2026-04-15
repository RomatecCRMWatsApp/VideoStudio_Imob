import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export interface ProjectInput {
  address?: string; areaM2?: number; houseModel?: string; houseStyle?: string; customInstructions?: string
}

export async function generateScenePrompts(input: ProjectInput) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    system: 'You are a cinematic AI video prompt specialist for Brazilian real estate. Generate optimized prompts for Runway Gen-4.5 and Kling 3.0. Prompts in ENGLISH, max 200 words each. Return ONLY valid JSON.',
    messages: [{ role: 'user', content: Generate 7 scene prompts for real estate construction video. Land: m2, Style: , Model: . Return JSON: {"scenes":[{"order":1,"type":"terrain_delimitation","title":"Delimitacao","prompt":"...","engine":"runway","durationSecs":8},{"order":2,"type":"explosion_clearing","title":"Limpeza","prompt":"...","engine":"kling","durationSecs":8},{"order":3,"type":"foundation","title":"Fundacao","prompt":"...","engine":"runway","durationSecs":10},{"order":4,"type":"structure_rising","title":"Estrutura","prompt":"...","engine":"runway","durationSecs":10},{"order":5,"type":"roofing_finishing","title":"Cobertura","prompt":"...","engine":"kling","durationSecs":10},{"order":6,"type":"house_model_overlay","title":"Modelo","prompt":"...","engine":"runway","durationSecs":8},{"order":7,"type":"final_reveal","title":"Reveal Final","prompt":"...","engine":"veo3","durationSecs":12}]} }],
  })
  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return JSON.parse(text).scenes
}
