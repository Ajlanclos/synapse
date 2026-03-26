import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import styles from '../styles/Login.module.css'

export default function LoginPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { callbackUrl } = router.query

  const [mode, setMode] = useState('signin') // 'signin' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    if (session) router.push(callbackUrl || '/app')
  }, [session])

  const handleCredentials = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (mode === 'register') {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setLoading(false); return }
      setSuccess('Account created! Signing you in...')
    }

    const result = await signIn('credentials', {
      email, password, redirect: false, callbackUrl: callbackUrl || '/app'
    })

    if (result?.error) {
      setError(mode === 'register' ? 'Account created but sign-in failed. Try signing in.' : 'Invalid email or password.')
      setLoading(false)
    } else {
      router.push(callbackUrl || '/app')
    }
  }

  return (
    <>
      <Head><title>TEAMTICS — Sign In</title></Head>
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logo}>TEAMTICS</div>
          <div className={styles.tagline}>// TEAM COMPOSITION OPTIMIZER //</div>
          <div className={styles.divider} />

          {/* OAUTH BUTTONS */}
          <div className={styles.oauthGroup}>
            <button className={styles.googleBtn} onClick={() => signIn('google', { callbackUrl: callbackUrl || '/app' })}>
              <svg width="18" height="18" viewBox="0 0 48 48" style={{ marginRight: 10, flexShrink: 0 }}>
                <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19.1 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.5 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.3C9.7 35.7 16.3 40 24 40v4z"/>
                <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.2 5.2C40.8 35.4 44 30.1 44 24c0-1.3-.1-2.7-.4-3.9z"/>
              </svg>
              Continue with Google
            </button>

            <button className={styles.discordBtn} onClick={() => signIn('discord', { callbackUrl: callbackUrl || '/app' })}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" style={{ marginRight: 10, flexShrink: 0 }}>
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.05a19.94 19.94 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.995a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Continue with Discord
            </button>
          </div>

          <div className={styles.orDivider}><span>OR</span></div>

          {/* EMAIL/PASSWORD */}
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${mode === 'signin' ? styles.activeTab : ''}`} onClick={() => { setMode('signin'); setError(null) }}>SIGN IN</button>
            <button className={`${styles.tab} ${mode === 'register' ? styles.activeTab : ''}`} onClick={() => { setMode('register'); setError(null) }}>REGISTER</button>
          </div>

          <form onSubmit={handleCredentials} className={styles.form}>
            <div className={styles.formGroup}>
              <label>EMAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className={styles.formGroup}>
              <label>PASSWORD</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === 'register' ? 'Min 8 characters' : '••••••••'} required />
            </div>
            {error && <div className={styles.error}>⚠ {error}</div>}
            {success && <div className={styles.successMsg}>✓ {success}</div>}
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'LOADING...' : mode === 'register' ? 'CREATE ACCOUNT' : 'SIGN IN'}
            </button>
          </form>

          <p className={styles.note}>Already subscribed? Sign in with the same account you used at checkout.</p>
          <a href="/" className={styles.back}>← Back to home</a>
        </div>
      </div>
    </>
  )
}
