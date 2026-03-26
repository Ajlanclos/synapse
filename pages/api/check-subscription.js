import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { isSubscriber } from '../../lib/supabase'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.email) {
    return res.status(401).json({ subscribed: false, reason: 'not_logged_in' })
  }

  const subscribed = await isSubscriber(session.user.email)
  return res.status(200).json({ subscribed, email: session.user.email })
}
