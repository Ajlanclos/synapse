import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { saveComp, getSavedComps, deleteComp } from '../../lib/supabase'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.email) return res.status(401).json({ error: 'Not authenticated' })

  const email = session.user.email

  if (req.method === 'POST') {
    const { game, map, rank, notes, roles, result, title } = req.body
    if (!result) return res.status(400).json({ error: 'Result is required' })
    const id = await saveComp({ email, game, map, rank, notes, roles, result, title })
    if (!id) return res.status(500).json({ error: 'Failed to save' })
    return res.status(200).json({ id })
  }

  if (req.method === 'GET') {
    const comps = await getSavedComps(email)
    return res.status(200).json({ comps })
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'ID required' })
    const ok = await deleteComp(id, email)
    if (!ok) return res.status(500).json({ error: 'Failed to delete' })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
