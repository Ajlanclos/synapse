import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Head from 'next/head'
import styles from '../styles/Login.module.css'

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { callbackUrl } = router.query

  useEffect(() => {
    if (session) router.push(callbackUrl || '/app')
  }, [session])

  return (
    <>
      <Head><title>SYNAPSE — Sign In</title></Head>
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logo}>SYNAPSE</div>
          <div className={styles.tagline}>// TEAM COMPOSITION OPTIMIZER //</div>
          <div className={styles.divider} />
          <p className={styles.prompt}>Sign in to access your subscription</p>
          <button
            className={styles.googleBtn}
            onClick={() => signIn('google', { callbackUrl: callbackUrl || '/app' })}
            disabled={status === 'loading'}
          >
            <svg width="20" height="20" viewBox="0 0 48 48" style={{ marginRight: 10 }}>
              <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19.1 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.5 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.3C9.7 35.7 16.3 40 24 40v4z"/>
              <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.2 5.2C40.8 35.4 44 30.1 44 24c0-1.3-.1-2.7-.4-3.9z"/>
            </svg>
            Continue with Google
          </button>
          <p className={styles.note}>
            Already subscribed? Sign in with the same Google account you used at checkout.
          </p>
          <a href="/" className={styles.back}>← Back to home</a>
        </div>
      </div>
    </>
  )
}
