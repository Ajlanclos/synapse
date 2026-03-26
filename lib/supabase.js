import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// BUG FIX: was failing silently on email casing + expires_at edge cases
// Now also accepts a grace period of 24hrs past expiry for webhook delays
export async function isSubscriber(email) {
  if (!email) return false

  const { data, error } = await supabaseAdmin
    .from('subscribers')
    .select('subscription_status, expires_at')
    .eq('email', email.toLowerCase().trim())
    .single()

  if (error || !data) return false
  if (data.subscription_status !== 'active') return false

  // 24hr grace period to account for webhook delays
  if (data.expires_at) {
    const grace = new Date(data.expires_at)
    grace.setHours(grace.getHours() + 24)
    if (grace < new Date()) return false
  }

  return true
}

export async function upsertSubscriber({ email, stripeCustomerId, stripeSubscriptionId, status, expiresAt = null }) {
  const { error } = await supabaseAdmin
    .from('subscribers')
    .upsert({
      email: email.toLowerCase().trim(),
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      subscription_status: status,
      subscribed_at: status === 'active' ? new Date().toISOString() : undefined,
      expires_at: expiresAt
    }, { onConflict: 'email' })

  if (error) console.error('Supabase upsert error:', error)
  return !error
}

// Saved comps
export async function saveComp({ email, game, map, rank, notes, roles, result, title }) {
  const { data, error } = await supabaseAdmin
    .from('saved_comps')
    .insert({
      email: email.toLowerCase().trim(),
      game, map, rank, notes, roles, result,
      title: title || `${game.toUpperCase()} — ${map || 'Any Map'}`
    })
    .select('id')
    .single()

  if (error) { console.error('Save comp error:', error); return null }
  return data.id
}

export async function getSavedComps(email) {
  const { data, error } = await supabaseAdmin
    .from('saved_comps')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .order('created_at', { ascending: false })

  if (error) { console.error('Get comps error:', error); return [] }
  return data
}

export async function deleteComp(id, email) {
  const { error } = await supabaseAdmin
    .from('saved_comps')
    .delete()
    .eq('id', id)
    .eq('email', email.toLowerCase().trim())

  return !error
}

// Email/password auth
import bcrypt from 'bcryptjs'

export async function createUserCredentials(email, password) {
  const hash = await bcrypt.hash(password, 12)
  const { error } = await supabaseAdmin
    .from('user_credentials')
    .insert({ email: email.toLowerCase().trim(), password_hash: hash })
  return !error
}

export async function verifyUserCredentials(email, password) {
  const { data, error } = await supabaseAdmin
    .from('user_credentials')
    .select('password_hash')
    .eq('email', email.toLowerCase().trim())
    .single()

  if (error || !data) return false
  return bcrypt.compare(password, data.password_hash)
}
