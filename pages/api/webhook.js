import Stripe from 'stripe'
import { upsertSubscriber } from '../../lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const config = { api: { bodyParser: false } }

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const rawBody = await getRawBody(req)
  const sig = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object
        // Retrieve full subscription to get period end
        const subscription = await stripe.subscriptions.retrieve(session.subscription)
        await upsertSubscriber({
          email: session.customer_email || session.customer_details?.email,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          status: 'active',
          expiresAt: new Date(subscription.current_period_end * 1000).toISOString()
        })
        console.log('New subscriber:', session.customer_details?.email)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
          const customer = await stripe.customers.retrieve(invoice.customer)
          await upsertSubscriber({
            email: customer.email,
            stripeCustomerId: invoice.customer,
            stripeSubscriptionId: invoice.subscription,
            status: 'active',
            expiresAt: new Date(subscription.current_period_end * 1000).toISOString()
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const customer = await stripe.customers.retrieve(subscription.customer)
        await upsertSubscriber({
          email: customer.email,
          stripeCustomerId: subscription.customer,
          stripeSubscriptionId: subscription.id,
          status: subscription.status,
          expiresAt: new Date(subscription.current_period_end * 1000).toISOString()
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customer = await stripe.customers.retrieve(subscription.customer)
        await upsertSubscriber({
          email: customer.email,
          stripeCustomerId: subscription.customer,
          stripeSubscriptionId: subscription.id,
          status: 'canceled',
          expiresAt: null
        })
        console.log('Subscription canceled:', customer.email)
        break
      }

    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return res.status(500).json({ error: 'Webhook handler failed' })
  }

  res.status(200).json({ received: true })
}
