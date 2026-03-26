import Head from 'next/head'
import { useState } from 'react'
import styles from '../styles/App.module.css'

const ROLES = {
  valorant: ['Duelist', 'Initiator', 'Controller', 'Sentinel', 'IGL'],
  lol: ['Top', 'Jungle', 'Mid', 'Bot / ADC', 'Support'],
  overwatch: ['Tank', 'DPS', 'Support', 'Flex', 'Main Healer']
}

const ROLE_COLORS = {
  Duelist: '#ff4655', Initiator: '#00c8ff', Controller: '#9b59b6',
  Sentinel: '#f39c12', IGL: '#2ecc71',
  Top: '#e74c3c', Jungle: '#27ae60', Mid: '#3498db',
  'Bot / ADC': '#f39c12', Support: '#9b59b6',
  Tank: '#3498db', DPS: '#e74c3c',
  Flex: '#f39c12', 'Main Healer': '#1abc9c'
}

function HeroCard({ hero, index }) {
  const [imgError, setImgError] = useState(false)
  const roleColor = ROLE_COLORS[hero.role] || '#00f5ff'

  return (
    <div className={styles.heroCard} style={{ animationDelay: `${index * 0.08}s` }}>
      <div className={styles.heroPortrait}>
        {hero.portrait && !imgError ? (
          <img src={hero.portrait} alt={hero.name} onError={() => setImgError(true)} className={styles.heroImg} />
        ) : (
          <div className={styles.heroImgFallback}>{hero.name.slice(0, 2).toUpperCase()}</div>
        )}
        <div className={styles.heroGlow} style={{ background: `radial-gradient(circle, ${roleColor}44, transparent 70%)` }} />
      </div>
      <div className={styles.heroInfo}>
        <div className={styles.heroName}>{hero.name}</div>
        <div className={styles.heroRole} style={{ color: roleColor, borderColor: roleColor + '55', background: roleColor + '15' }}>
          {hero.role}
        </div>
        <div className={styles.heroReason}>{hero.reason}</div>
      </div>
    </div>
  )
}

function Section({ icon, title, color, children }) {
  return (
    <div className={styles.resultSection}>
      <div className={styles.sectionHeader} style={{ borderBottomColor: color + '33' }}>
        <span className={styles.sectionIcon}>{icon}</span>
        <span className={styles.sectionTitle} style={{ color }}>{title}</span>
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  )
}

function GameplanPhase({ label, color, text }) {
  return (
    <div className={styles.phase}>
      <div className={styles.phaseLabel} style={{ color, borderColor: color + '55', background: color + '11' }}>{label}</div>
      <div className={styles.phaseText}>{text}</div>
    </div>
  )
}

export default function AppPage() {
  const [game, setGame] = useState('valorant')
  const [map, setMap] = useState('')
  const [rank, setRank] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedRoles, setSelectedRoles] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const toggleRole = (role) => {
    setSelectedRoles(prev => {
      const next = new Set(prev)
      next.has(role) ? next.delete(role) : next.add(role)
      return next
    })
  }

  const switchGame = (g) => {
    setGame(g)
    setSelectedRoles(new Set())
    setResult(null)
    setError(null)
  }

  const generate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game, map, rank, notes, roles: [...selectedRoles].join(', ') || 'flexible' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate')
      setResult(data.result)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  const gameLabels = { valorant: 'VALORANT', lol: 'LEAGUE OF LEGENDS', overwatch: 'OVERWATCH 2' }

  return (
    <>
      <Head><title>SYNAPSE — Optimizer</title></Head>
      <div className={styles.page}>
        <header className={styles.header}>
          <a href="/" className={styles.logo}>SYNAPSE</a>
          <div className={styles.tagline}>// TEAM COMPOSITION OPTIMIZER //</div>
        </header>
        <div className={styles.divider} />

        <div className={styles.container}>
          <div className={styles.sectionLabel}>// SELECT GAME</div>
          <div className={styles.gameTabs}>
            {Object.entries(gameLabels).map(([key, label]) => (
              <button key={key} className={`${styles.gameTab} ${game === key ? styles.active : ''}`} onClick={() => switchGame(key)}>
                {label}
              </button>
            ))}
          </div>

          <div className={styles.panel}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Map / Arena</label>
                <input type="text" value={map} onChange={e => setMap(e.target.value)}
                  placeholder={game === 'valorant' ? 'e.g. Ascent, Haven...' : game === 'lol' ? "e.g. Summoner's Rift..." : 'e.g. King\'s Row...'} />
              </div>
              <div className={styles.formGroup}>
                <label>Rank / Skill Level</label>
                <select value={rank} onChange={e => setRank(e.target.value)}>
                  <option value="">Select rank...</option>
                  <option>Iron / Bronze</option>
                  <option>Silver / Gold</option>
                  <option>Platinum / Diamond</option>
                  <option>Master / Grandmaster</option>
                  <option>Challenger / Radiant / Top 500</option>
                </select>
              </div>
              <div className={`${styles.formGroup} ${styles.full}`}>
                <label>Preferred Roles</label>
                <div className={styles.roleGrid}>
                  {ROLES[game].map(role => (
                    <button key={role} className={`${styles.roleChip} ${selectedRoles.has(role) ? styles.selected : ''}`} onClick={() => toggleRole(role)}>
                      {role}
                    </button>
                  ))}
                </div>
              </div>
              <div className={`${styles.formGroup} ${styles.full}`}>
                <label>Meta Notes / Enemy Picks (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Enemy loves poke comps. We have a Jett main who needs space..." />
              </div>
            </div>

            {loading && <div className={styles.loadingBar} />}
            {loading && <div className={styles.loadingText}>ANALYZING META // BUILDING COMPOSITION...</div>}
            {error && <div className={styles.errorText}>⚠ {error}</div>}

            <button className={styles.btnGenerate} onClick={generate} disabled={loading}>
              {loading ? 'ANALYZING...' : '⚡ OPTIMIZE TEAM COMP'}
            </button>
          </div>

          {/* RESULTS */}
          {result && (
            <div className={styles.results}>
              <div className={styles.sectionLabel}>// RECOMMENDED COMPOSITION</div>
              <div className={styles.heroGrid}>
                {result.composition?.map((hero, i) => <HeroCard key={hero.name} hero={hero} index={i} />)}
              </div>

              <div className={styles.analysisGrid}>
                <Section icon="🎯" title="WIN CONDITION" color="#00f5ff">
                  <p>{result.winCondition}</p>
                </Section>

                <Section icon="📋" title="DRAFT PRIORITY" color="#f39c12">
                  <p>{result.draftPriority}</p>
                </Section>

                <Section icon="🔗" title="KEY SYNERGIES" color="#7b2fff">
                  <div className={styles.synergyGrid}>
                    {result.synergies?.map((s, i) => (
                      <div key={i} className={styles.synergyCard}>
                        <div className={styles.synergyTitle}>{s.title}</div>
                        <div className={styles.synergyDesc}>{s.description}</div>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section icon="🛡️" title="COUNTERS & WEAKNESSES" color="#ff2d6b">
                  <p>{result.weaknesses}</p>
                </Section>

                <Section icon="📈" title="GAME PLAN" color="#2ecc71">
                  <div className={styles.gameplan}>
                    <GameplanPhase label="EARLY" color="#f39c12" text={result.gameplan?.early} />
                    <GameplanPhase label="MID" color="#00f5ff" text={result.gameplan?.mid} />
                    <GameplanPhase label="LATE" color="#ff2d6b" text={result.gameplan?.late} />
                  </div>
                </Section>
              </div>

              <div className={styles.scanLine}>
                // ANALYSIS COMPLETE — {gameLabels[game]} // {map ? map.toUpperCase() : 'ANY MAP'} // {new Date().toLocaleTimeString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
