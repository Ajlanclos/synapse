import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
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

const GAME_LABELS = { valorant: 'VALORANT', lol: 'LEAGUE OF LEGENDS', overwatch: 'OVERWATCH 2' }
const GAME_COLORS = { valorant: '#ff4655', lol: '#c89b3c', overwatch: '#f47521' }

const GameIcons = {
  valorant: ({ color = '#ff4655', size = 36 }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <polygon points="24,4 44,20 36,44 12,44 4,20" stroke={color} strokeWidth="2.5" fill="none" opacity="0.3"/>
      <polygon points="24,10 38,22 32,40 16,40 10,22" fill={color} opacity="0.15"/>
      <line x1="4" y1="20" x2="24" y2="4" stroke={color} strokeWidth="3" strokeLinecap="round"/>
      <line x1="24" y1="4" x2="44" y2="20" stroke={color} strokeWidth="3" strokeLinecap="round"/>
      <polygon points="24,16 32,26 24,38 16,26" fill={color}/>
      <line x1="14" y1="24" x2="24" y2="16" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  lol: ({ color = '#c89b3c', size = 36 }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="20" stroke={color} strokeWidth="2" fill="none" opacity="0.2"/>
      <circle cx="24" cy="24" r="14" stroke={color} strokeWidth="1.5" fill="none" opacity="0.15"/>
      <line x1="10" y1="10" x2="38" y2="38" stroke={color} strokeWidth="3" strokeLinecap="round"/>
      <line x1="8" y1="16" x2="16" y2="8" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="38" cy="38" r="3" fill={color} opacity="0.7"/>
      <line x1="38" y1="10" x2="10" y2="38" stroke={color} strokeWidth="3" strokeLinecap="round"/>
      <line x1="40" y1="16" x2="32" y2="8" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="10" cy="38" r="3" fill={color} opacity="0.7"/>
      <circle cx="24" cy="24" r="4" fill={color}/>
    </svg>
  ),
  overwatch: ({ color = '#f47521', size = 36 }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="19" stroke={color} strokeWidth="5" fill="none"/>
      <path d="M 24 9 A 15 15 0 0 1 39 24" stroke="#050810" strokeWidth="6" fill="none"/>
      <path d="M 24 39 A 15 15 0 0 1 9 24" stroke="#050810" strokeWidth="6" fill="none"/>
      <circle cx="24" cy="24" r="10" stroke={color} strokeWidth="4" fill="none"/>
      <circle cx="24" cy="6" r="3" fill={color}/>
    </svg>
  )
}

function HeroCard({ hero, index }) {
  const [imgError, setImgError] = useState(false)
  const roleColor = ROLE_COLORS[hero.role] || '#00f5ff'
  return (
    <div className={styles.heroCard} style={{ animationDelay: `${index * 0.08}s` }}>
      <div className={styles.heroPortrait}>
        {hero.portrait && !imgError
          ? <img src={hero.portrait} alt={hero.name} onError={() => setImgError(true)} className={styles.heroImg} />
          : <div className={styles.heroImgFallback}>{hero.name.slice(0, 2).toUpperCase()}</div>}
        <div className={styles.heroGlow} style={{ background: `radial-gradient(circle, ${roleColor}44, transparent 70%)` }} />
      </div>
      <div className={styles.heroInfo}>
        <div className={styles.heroName}>{hero.name}</div>
        <div className={styles.heroRole} style={{ color: roleColor, borderColor: roleColor + '55', background: roleColor + '15' }}>{hero.role}</div>
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
  const { data: session, status } = useSession()
  const router = useRouter()

  const [authChecked, setAuthChecked] = useState(false)
  const [game, setGame] = useState('valorant')
  const [map, setMap] = useState('')
  const [rank, setRank] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedRoles, setSelectedRoles] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [currentInput, setCurrentInput] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState(null)

  // Saved comps
  const [savedComps, setSavedComps] = useState([])
  const [showSaved, setShowSaved] = useState(false)
  const [loadingSaved, setLoadingSaved] = useState(false)

  // Auth gate
  useEffect(() => {
    if (status === 'loading') return
    if (!session) { router.push('/login?callbackUrl=/app'); return }

    fetch('/api/check-subscription')
      .then(r => r.json())
      .then(data => {
        if (!data.subscribed) router.push('/?reason=not_subscribed')
        else setAuthChecked(true)
      })
      .catch(() => router.push('/'))
  }, [session, status])

  const loadSavedComps = async () => {
    setLoadingSaved(true)
    const res = await fetch('/api/saved-comps')
    const data = await res.json()
    setSavedComps(data.comps || [])
    setLoadingSaved(false)
  }

  const toggleSaved = () => {
    if (!showSaved) loadSavedComps()
    setShowSaved(s => !s)
  }

  const saveCurrentComp = async () => {
    if (!result) return
    setSaving(true)
    const res = await fetch('/api/saved-comps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...currentInput, result })
    })
    const data = await res.json()
    if (data.id) setSavedId(data.id)
    setSaving(false)
  }

  const deleteSavedComp = async (id) => {
    await fetch(`/api/saved-comps?id=${id}`, { method: 'DELETE' })
    setSavedComps(prev => prev.filter(c => c.id !== id))
  }

  const loadComp = (comp) => {
    setGame(comp.game)
    setResult(comp.result)
    setCurrentInput({ game: comp.game, map: comp.map, rank: comp.rank, notes: comp.notes, roles: comp.roles })
    setMap(comp.map || '')
    setRank(comp.rank || '')
    setNotes(comp.notes || '')
    setSelectedRoles(new Set(comp.roles ? comp.roles.split(', ') : []))
    setSavedId(comp.id)
    setShowSaved(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleRole = (role) => {
    setSelectedRoles(prev => {
      const next = new Set(prev)
      next.has(role) ? next.delete(role) : next.add(role)
      return next
    })
  }

  const switchGame = (g) => {
    setGame(g); setSelectedRoles(new Set()); setResult(null); setError(null); setSavedId(null)
  }

  const generate = async () => {
    setLoading(true); setError(null); setResult(null); setSavedId(null)
    const input = { game, map, rank, notes, roles: [...selectedRoles].join(', ') || 'flexible' }
    setCurrentInput(input)
    try {
      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate')
      setResult(data.result)
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  if (!authChecked) {
    return (
      <div className={styles.gateScreen}>
        <div className={styles.gateLogo}>TEAMTICS</div>
        <div className={styles.gateLoading}>VERIFYING ACCESS...</div>
        <div className={styles.gateBar} />
      </div>
    )
  }

  return (
    <>
      <Head><title>TEAMTICS — Optimizer</title><link rel="icon" href="/logo.png" sizes="any" /></Head>
      <div className={styles.page}>
        <nav className={styles.nav}>
          <div className={styles.navLogo}><img src="/logo.png" alt="TEAMTICS" /></div>
          
          <div className={styles.userBar}>
              <button className={styles.savedBtn} onClick={toggleSaved}>
                {showSaved ? '✕ CLOSE' : `SAVED COMPS ${savedComps.length > 0 ? `(${savedComps.length})` : ''}`}
              </button>
              <span className={styles.userEmail}>{session?.user?.email}</span>
              <button className={styles.signOutBtn} onClick={() => signOut({ callbackUrl: '/' })}>SIGN OUT</button>
            </div>
        </nav>

        <div className={styles.divider} />

        {/* SAVED COMPS PANEL */}
        {showSaved && (
          <div className={styles.savedPanel}>
            <div className={styles.savedHeader}>
              <span className={styles.sectionLabel}>// SAVED COMPOSITIONS</span>
            </div>
            {loadingSaved && <div className={styles.loadingText}>LOADING...</div>}
            {!loadingSaved && savedComps.length === 0 && (
              <div className={styles.emptyState}>No saved comps yet. Generate a comp and click "Save Comp".</div>
            )}
            <div className={styles.savedGrid}>
              {savedComps.map(comp => (
                <div key={comp.id} className={styles.savedCard}>
                  <div className={styles.savedCardGame} style={{ color: GAME_COLORS[comp.game] || '#00f5ff' }}>
                    {GAME_LABELS[comp.game] || comp.game}
                  </div>
                  <div className={styles.savedCardTitle}>{comp.title}</div>
                  <div className={styles.savedCardMeta}>
                    {comp.rank && <span>{comp.rank}</span>}
                    <span>{new Date(comp.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.savedCardHeroes}>
                    {comp.result?.composition?.slice(0, 5).map(h => (
                      <span key={h.name} className={styles.heroChip}>{h.name}</span>
                    ))}
                  </div>
                  <div className={styles.savedCardActions}>
                    <button className={styles.loadBtn} onClick={() => loadComp(comp)}>LOAD</button>
                    <button className={styles.deleteBtn} onClick={() => deleteSavedComp(comp.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.container}>
          <div className={styles.sectionLabel}>// SELECT GAME</div>
          <div className={styles.gameTabs}>
            {Object.entries(GAME_LABELS).map(([key, label]) => {
              const Icon = GameIcons[key]
              const color = GAME_COLORS[key]
              const isActive = game === key
              return (
                <button
                  key={key}
                  className={`${styles.gameTab} ${isActive ? styles.active : ""}`}
                  onClick={() => switchGame(key)}
                  style={isActive ? { borderColor: color, boxShadow: `0 0 20px ${color}33` } : {}}
                >
                  <span className={styles.gameTabIcon} style={{ opacity: isActive ? 1 : 0.4, transition: "opacity 0.2s" }}>
                    <Icon color={isActive ? color : "#5a6a8a"} size={38} />
                  </span>
                  <span className={styles.gameTabLabel} style={isActive ? { color } : {}}>{label}</span>
                </button>
              )
            })}
          </div>

          <div className={styles.panel}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Map / Arena</label>
                <input type="text" value={map} onChange={e => setMap(e.target.value)}
                  placeholder={game === 'valorant' ? 'e.g. Ascent, Haven...' : game === 'lol' ? "e.g. Summoner's Rift..." : "e.g. King's Row..."} />
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

          {result && (
            <div className={styles.results}>
              <div className={styles.resultsToolbar}>
                <div className={styles.sectionLabel}>// RECOMMENDED COMPOSITION</div>
                <button
                  className={`${styles.saveCompBtn} ${savedId ? styles.savedCompBtn : ''}`}
                  onClick={saveCurrentComp}
                  disabled={saving || !!savedId}
                >
                  {saving ? 'SAVING...' : savedId ? '✓ SAVED' : 'SAVE COMPOSITION'}
                </button>
              </div>

              <div className={styles.heroGrid}>
                {result.composition?.map((hero, i) => <HeroCard key={hero.name} hero={hero} index={i} />)}
              </div>

              <div className={styles.analysisGrid}>
                <Section icon="🎯" title="WIN CONDITION" color="#00f5ff"><p>{result.winCondition}</p></Section>
                <Section icon="📋" title="DRAFT PRIORITY" color="#f39c12"><p>{result.draftPriority}</p></Section>
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
                <Section icon="🛡️" title="COUNTERS & WEAKNESSES" color="#ff2d6b"><p>{result.weaknesses}</p></Section>
                <Section icon="📈" title="GAME PLAN" color="#2ecc71">
                  <div className={styles.gameplan}>
                    <GameplanPhase label="EARLY" color="#f39c12" text={result.gameplan?.early} />
                    <GameplanPhase label="MID" color="#00f5ff" text={result.gameplan?.mid} />
                    <GameplanPhase label="LATE" color="#ff2d6b" text={result.gameplan?.late} />
                  </div>
                </Section>
              </div>
              <div className={styles.scanLine}>
                // ANALYSIS COMPLETE — {GAME_LABELS[game]} // {map ? map.toUpperCase() : 'ANY MAP'} // {new Date().toLocaleTimeString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
