import { createClient } from '@supabase/supabase-js'

// Server-side client using service role key (full DB access, never expose to browser)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Check if an email has an active subscription
export async function isSubscriber(email) {
  if (!email) return false

  const { data, error } = await supabaseAdmin
    .from('subscribers')
    .select('subscription_status, expires_at')
    .eq('email', email.toLowerCase())
    .single()

  if (error || !data) return false

  if (data.subscription_status !== 'active') return false

  // If expires_at is set, check it hasn't passed
  if (data.expires_at && new Date(data.expires_at) < new Date()) return false

  return true
}

// Upsert a subscriber record (called from Stripe webhook)
export async function upsertSubscriber({
  email,
  stripeCustomerId,
  stripeSubscriptionId,
  status,
  expiresAt = null
}) {
  const { error } = await supabaseAdmin
    .from('subscribers')
    .upsert({
      email: email.toLowerCase(),
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      subscription_status: status,
      subscribed_at: status === 'active' ? new Date().toISOString() : undefined,
      expires_at: expiresAt
    }, { onConflict: 'email' })

  if (error) console.error('Supabase upsert error:', error)
  return !error
}
