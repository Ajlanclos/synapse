import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Riot CDN for Valorant agent portraits
// Format: https://media.valorant-api.com/agents/{uuid}/displayicon.png
// We map common agent names to their UUIDs
const VALORANT_AGENT_UUIDS = {
  'Jett': 'add6443a-41bd-e414-f6ad-e58d267f4e95',
  'Reyna': 'a3bfb853-43b2-7238-a4f1-ad90e9e46bcc',
  'Phoenix': 'eb93336a-449b-9c1b-0a54-a891f7921d69',
  'Raze': 'f94c3b30-42be-e959-889c-5aa313dba261',
  'Yoru': '7f94d92c-4234-0a36-9646-3a87eb8b5c89',
  'Neon': 'bb2a4828-46eb-8cd1-e765-15848195d751',
  'Iso': '0e38b510-41a8-5780-5e8f-568b2a4f2d6c',
  'Sova': '320b2a48-4d9b-a075-30f1-1f93a9b638fa',
  'Breach': '5f8d3a7f-467b-97f3-062c-2189ba624031',
  'Skye': '6f2a04ca-43e0-be17-7f36-b3908627744d',
  'KAY/O': '601dbbe7-43ce-be57-2a40-4abd24953621',
  'Fade': 'dade69b4-4f5a-8528-247b-219e5a1facd6',
  'Gekko': 'e370fa57-4757-3604-3648-499e1f642d3f',
  'Omen': '8e253930-4c05-31dd-1b6c-968525494517',
  'Brimstone': '9f0d8ba9-4140-b941-57d3-a7ad57c6b417',
  'Viper': '707eab51-4836-f488-046a-cda6bf494859',
  'Astra': '41fb69c1-4189-7b37-f117-bcaf1e96f1bf',
  'Harbor': '95b78ed7-4637-86d9-7e41-71ba8c293152',
  'Clove': '1dbf2edd-4729-0984-3115-daa5eed44993',
  'Killjoy': '1e58de9c-4950-5125-93e9-a0aee9f98746',
  'Cypher': '117ed9e3-49f3-6512-3ccf-0cada7e3823b',
  'Sage': '569fdd95-4d10-43ab-ca70-79becc718b46',
  'Chamber': '22697a3d-45bf-8dd7-4fec-84a9e28c69d7',
  'Deadlock': 'cc8b64c8-4b25-4ff9-6e7f-37b4da43d235',
  'Vyse': 'efba5359-4016-a1e5-7626-b1ae6afbfe69',
  'Cypher': '117ed9e3-49f3-6512-3ccf-0cada7e3823b',
}

// League of Legends uses Data Dragon CDN
// Format: https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/{ChampionName}.png
const LOL_VERSION = '14.10.1'

// Overwatch hero portraits from Blizzard's official media
const OW_HERO_PORTRAITS = {
  'Ana': 'ana',
  'Ashe': 'ashe',
  'Baptiste': 'baptiste',
  'Bastion': 'bastion',
  'Brigitte': 'brigitte',
  'Cassidy': 'cassidy',
  'D.Va': 'dva',
  'Doomfist': 'doomfist',
  'Echo': 'echo',
  'Genji': 'genji',
  'Hanzo': 'hanzo',
  'Illari': 'illari',
  'Junker Queen': 'junkerqueen',
  'Junkrat': 'junkrat',
  'Kiriko': 'kiriko',
  'Lifeweaver': 'lifeweaver',
  'Lúcio': 'lucio',
  'Mauga': 'mauga',
  'Mei': 'mei',
  'Mercy': 'mercy',
  'Moira': 'moira',
  'Orisa': 'orisa',
  'Pharah': 'pharah',
  'Ramattra': 'ramattra',
  'Reaper': 'reaper',
  'Reinhardt': 'reinhardt',
  'Roadhog': 'roadhog',
  'Sigma': 'sigma',
  'Sojourn': 'sojourn',
  'Soldier: 76': 'soldier76',
  'Sombra': 'sombra',
  'Symmetra': 'symmetra',
  'Torbjörn': 'torbjorn',
  'Tracer': 'tracer',
  'Venture': 'venture',
  'Widowmaker': 'widowmaker',
  'Winston': 'winston',
  'Wrecking Ball': 'wreckingball',
  'Zarya': 'zarya',
  'Zenyatta': 'zenyatta',
}

function getPortraitUrl(game, name) {
  if (game === 'valorant') {
    const uuid = VALORANT_AGENT_UUIDS[name]
    if (uuid) return `https://media.valorant-api.com/agents/${uuid}/displayicon.png`
    return null
  }
  if (game === 'lol') {
    // Normalize champion name (remove spaces, apostrophes for Data Dragon)
    const normalized = name.replace(/['\s]/g, '').replace(/\./g, '')
    return `https://ddragon.leagueoflegends.com/cdn/${LOL_VERSION}/img/champion/${normalized}.png`
  }
  if (game === 'overwatch') {
    const slug = OW_HERO_PORTRAITS[name]
    if (slug) return `https://d15f34w2p8l1cc.cloudfront.net/overwatch/portraits/${slug}.png`
    return null
  }
  return null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { game, map, rank, notes, roles } = req.body
  if (!game) return res.status(400).json({ error: 'Game is required' })

  const gameNames = { valorant: 'Valorant', lol: 'League of Legends', overwatch: 'Overwatch 2' }
  const gameName = gameNames[game] || game

  const prompt = `You are an expert ${gameName} analyst. Return ONLY a valid JSON object, no markdown, no explanation.

Game: ${gameName}
Map: ${map || 'any map'}
Rank: ${rank || 'mid-level'}
Roles/playstyle: ${roles || 'flexible'}
${notes ? `Context: ${notes}` : ''}

Return this exact JSON structure:
{
  "composition": [
    {
      "name": "exact in-game name",
      "role": "their role in THIS comp",
      "reason": "one sentence why they're picked"
    }
  ],
  "winCondition": "2-3 sentences on the core strategy",
  "synergies": [
    { "title": "Synergy name", "description": "How to execute this combo" },
    { "title": "Synergy name", "description": "How to execute this combo" }
  ],
  "draftPriority": "Which to pick first and why, 2-3 sentences",
  "weaknesses": "Main counters and how to play around them, 2-3 sentences",
  "gameplan": {
    "early": "Early game focus",
    "mid": "Mid game focus",
    "late": "Late game focus"
  }
}

Use exact official ${gameName} character names. Be specific and tactical.`

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }]
    })

    let raw = message.content[0].text.trim()
    raw = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(raw)

    // Attach portrait URLs
    parsed.composition = parsed.composition.map(hero => ({
      ...hero,
      portrait: getPortraitUrl(game, hero.name)
    }))

    return res.status(200).json({ result: parsed })
  } catch (err) {
    console.error('Error:', err)
    return res.status(500).json({ error: 'Failed to generate analysis. Please try again.' })
  }
}
