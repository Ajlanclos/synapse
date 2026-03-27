import Head from 'next/head'
import { useState } from 'react'
import styles from '../styles/Landing.module.css'

export default function Home() {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/create-checkout', { method: 'POST' })
      const { url } = await res.json()
      window.location.href = url
    } catch (e) {
      alert('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>TEAMTICS — AI Team Comp Optimizer</title>
        <link rel="icon" href="/logo.png" sizes="any" />
        <meta name="description" content="AI-powered team composition optimizer for Valorant, League of Legends, and Overwatch 2. Win more games with data-driven comp analysis." />
      </Head>

      <div className={styles.page}>
        {/* NAV */}
        <nav className={styles.nav}>
          <div className={styles.navLogo}><img src="/logo.png" alt="TEAMTICS" /></div>
          <button className={styles.navCta} onClick={handleSubscribe} disabled={loading}>
            {loading ? 'REDIRECTING...' : 'GET ACCESS — $9.99/mo'}
          </button>
        </nav>

        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroBadge}>// AI-POWERED TACTICAL ANALYSIS //</div>
          <h1 className={styles.heroTitle}>
            STOP LOSING<br />
            <span className={styles.accent}>BAD TEAM COMPS</span>
          </h1>
          <p className={styles.heroSub}>
            TEAMTICS analyzes your game, map, rank, and playstyle — then builds the optimal team composition with full tactical breakdowns. Powered by advanced AI. Built for serious players.
          </p>
          <div className={styles.heroGames}>
            <span className={styles.gameTag}>VALORANT</span>
            <span className={styles.gameTag}>LEAGUE OF LEGENDS</span>
            <span className={styles.gameTag}>OVERWATCH 2</span>
          </div>
          <button className={styles.heroCta} onClick={handleSubscribe} disabled={loading}>
            {loading ? 'LOADING...' : '⚡ START WINNING — $9.99/mo'}
          </button>
          <p className={styles.heroNote}>Cancel anytime. No contracts.</p>
        </section>

        {/* FEATURES */}
        <section className={styles.features}>
          <div className={styles.featureGrid}>
            {[
              { icon: '🎯', title: 'COMP ANALYSIS', desc: 'Get 5 specific agent/champion/hero picks tailored to your map and rank.' },
              { icon: '⚔️', title: 'WIN CONDITIONS', desc: 'Understand exactly how to execute your comp for maximum impact.' },
              { icon: '🔗', title: 'KEY SYNERGIES', desc: 'Discover ability combos and team interactions to dominate teamfights.' },
              { icon: '📋', title: 'DRAFT PRIORITY', desc: 'Know exactly which picks to lock first and why every time.' },
              { icon: '🛡️', title: 'COUNTER PLAY', desc: 'Understand your weaknesses before enemies exploit them.' },
              { icon: '📈', title: 'PHASE STRATEGY', desc: 'Early, mid, and late game plans customized to your composition.' },
            ].map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <div className={styles.featureTitle}>{f.title}</div>
                <div className={styles.featureDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section className={styles.pricing}>
          <div className={styles.sectionLabel}>// PRICING //</div>
          <div className={styles.pricingCard}>
            <div className={styles.pricingBadge}>FULL ACCESS</div>
            <div className={styles.pricingAmount}>$9.99<span>/mo</span></div>
            <ul className={styles.pricingList}>
              <li>✓ Unlimited team comp generations</li>
              <li>✓ All 3 games: Valorant, LoL, OW2</li>
              <li>✓ All maps & rank levels</li>
              <li>✓ Full tactical breakdowns</li>
              <li>✓ New features as added</li>
              <li>✓ Cancel anytime</li>
            </ul>
            <button className={styles.pricingCta} onClick={handleSubscribe} disabled={loading}>
              {loading ? 'REDIRECTING...' : 'GET STARTED NOW'}
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <footer className={styles.footer}>
          <div className={styles.footerLogo}>TEAMTICS</div>
          <p className={styles.footerText}>AI-powered team composition optimizer. Not affiliated with Riot Games, Blizzard Entertainment, or any game publisher.</p>
        </footer>
      </div>
    </>
  )
}
