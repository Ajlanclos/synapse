import Head from 'next/head'
import { useState } from 'react'
import styles from '../styles/App.module.css'

const ROLES = {
  valorant: ['Duelist', 'Initiator', 'Controller', 'Sentinel', 'IGL'],
  lol: ['Top', 'Jungle', 'Mid', 'Bot / ADC', 'Support'],
  overwatch: ['Tank', 'DPS', 'Support', 'Flex', 'Main Healer']
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
  }

  const generate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game,
          map,
          rank,
          notes,
          roles: [...selectedRoles].join(', ') || 'flexible'
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate')
      setResult(data.result)
    } catch (e) {
      setError(e.message)
    }

    setLoading(false)
  }

  const formatResult = (text) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  }

  const gameLabels = { valorant: 'VALORANT', lol: 'LEAGUE OF LEGENDS', overwatch: 'OVERWATCH 2' }

  return (
    <>
      <Head>
        <title>SYNAPSE — Optimizer</title>
      </Head>

      <div className={styles.page}>
        <header className={styles.header}>
          <a href="/" className={styles.logo}>SYNAPSE</a>
          <div className={styles.tagline}>// TEAM COMPOSITION OPTIMIZER //</div>
        </header>

        <div className={styles.divider} />

        <div className={styles.container}>
          {/* GAME TABS */}
          <div className={styles.sectionLabel}>// SELECT GAME</div>
          <div className={styles.gameTabs}>
            {Object.entries(gameLabels).map(([key, label]) => (
              <button
                key={key}
                className={`${styles.gameTab} ${game === key ? styles.active : ''}`}
                onClick={() => switchGame(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* INPUT PANEL */}
          <div className={styles.panel}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Map / Arena</label>
                <input
                  type="text"
                  value={map}
                  onChange={e => setMap(e.target.value)}
                  placeholder={game === 'valorant' ? 'e.g. Ascent, Haven, Bind...' : game === 'lol' ? 'e.g. Summoner\'s Rift, ARAM...' : 'e.g. King\'s Row, Lijiang Tower...'}
                />
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
                <label>Preferred Roles / Playstyle</label>
                <div className={styles.roleGrid}>
                  {ROLES[game].map(role => (
                    <button
                      key={role}
                      className={`${styles.roleChip} ${selectedRoles.has(role) ? styles.selected : ''}`}
                      onClick={() => toggleRole(role)}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`${styles.formGroup} ${styles.full}`}>
                <label>Meta Notes / Enemy Picks (optional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Enemy loves poke comps. We have a Jett main who needs space to entry..."
                />
              </div>
            </div>

            {loading && <div className={styles.loadingBar} />}
            {loading && <div className={styles.loadingText}>ANALYZING META // GENERATING SYNERGIES...</div>}
            {error && <div className={styles.errorText}>⚠ {error}</div>}

            <button className={styles.btnGenerate} onClick={generate} disabled={loading}>
              {loading ? 'ANALYZING...' : '⚡ OPTIMIZE TEAM COMP'}
            </button>
          </div>

          {/* OUTPUT */}
          {result && (
            <div className={styles.outputSection}>
              <div className={styles.sectionLabel}>// OPTIMAL COMPOSITION ANALYSIS</div>
              <div className={styles.outputPanel}>
                <div className={styles.outputHeader}>
                  <span className={styles.outputBadge}>SYNAPSE AI</span>
                  <span className={styles.outputBadge}>{gameLabels[game]}</span>
                  {map && <span className={styles.outputBadge}>{map.toUpperCase()}</span>}
                </div>
                <div
                  className={styles.outputContent}
                  dangerouslySetInnerHTML={{ __html: formatResult(result) }}
                />
                <div className={styles.scanLine}>
                  // ANALYSIS COMPLETE — {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
