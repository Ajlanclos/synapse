import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { game, map, rank, notes, roles } = req.body

  if (!game) return res.status(400).json({ error: 'Game is required' })

  const gameNames = {
    valorant: 'Valorant',
    lol: 'League of Legends',
    overwatch: 'Overwatch 2'
  }

  const gameName = gameNames[game] || game

  const prompt = `You are an expert ${gameName} analyst and coach at the highest level. Generate a detailed, tactical team composition recommendation.

Game: ${gameName}
Map/Arena: ${map || 'any map'}
Rank: ${rank || 'mid-level'}
Team roles/playstyles: ${roles || 'flexible'}
${notes ? `Additional context: ${notes}` : ''}

Provide a comprehensive breakdown with these sections:

**RECOMMENDED COMPOSITION**
List 5 specific agents/champions/heroes with their roles and a one-line reason for each pick.

**WIN CONDITION**
The core strategy this comp enables and how to execute it.

**KEY SYNERGIES**
2-3 specific ability combos or team interactions to practice and abuse.

**DRAFT PRIORITY**
Which picks to lock first and why, including flex picks.

**COUNTERS & WEAKNESSES**
What beats this comp and how to adapt or play around those matchups.

**EARLY / MID / LATE GAME PLAN**
Brief phase-by-phase breakdown of what your team should be doing.

Be specific, tactical, and use proper ${gameName} terminology. Keep each section focused and actionable.`

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })

    const result = message.content[0].text
    return res.status(200).json({ result })
  } catch (err) {
    console.error('Anthropic error:', err)
    return res.status(500).json({ error: 'Failed to generate analysis. Please try again.' })
  }
}
