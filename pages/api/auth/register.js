import { createUserCredentials } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })

  const created = await createUserCredentials(email, password)
  if (!created) return res.status(409).json({ error: 'An account with this email already exists' })

  return res.status(200).json({ success: true })
}
