# SYNAPSE — Launch Guide
## Your 3-step path to a live, paid web app

---

## STEP 1: Get Your 3 Free Accounts (15 min)

### A) Anthropic API Key
1. Go to console.anthropic.com
2. Sign up / log in
3. Go to "API Keys" → Create new key
4. Copy it — you'll need it in Step 3
5. Add $5 in credits (Settings → Billing) — this powers ~500+ generations

### B) Stripe Account
1. Go to stripe.com → Sign up
2. Go to Products → Create a product:
   - Name: "SYNAPSE Monthly Access"
   - Price: $9.99 / month / recurring
3. Copy the **Price ID** (looks like: price_1ABC...)
4. Go to Developers → API Keys → Copy your **Secret key** and **Publishable key**

### C) Vercel Account
1. Go to vercel.com → Sign up with GitHub
2. (You'll need a free GitHub account too if you don't have one)

---

## STEP 2: Put the Code on GitHub (5 min)

1. Go to github.com → New Repository
2. Name it: `synapse-optimizer`
3. Set to **Private**
4. Upload all files from the `synapse/` folder
5. Click "Commit changes"

---

## STEP 3: Deploy on Vercel (5 min)

1. Go to vercel.com → "Add New Project"
2. Import your GitHub repo `synapse-optimizer`
3. Under **Environment Variables**, add these:

```
ANTHROPIC_API_KEY       = (your key from Step 1A)
STRIPE_SECRET_KEY       = (sk_live_... from Step 1B)
STRIPE_PUBLISHABLE_KEY  = (pk_live_... from Step 1B)
STRIPE_PRICE_ID         = (price_... from Step 1B)
NEXT_PUBLIC_URL         = https://your-app.vercel.app
STRIPE_WEBHOOK_SECRET   = (see below)
```

4. Click **Deploy**
5. Once deployed, copy your live URL (e.g. `https://synapse-optimizer.vercel.app`)

---

## STEP 4: Set Up Stripe Webhook (5 min)

1. In Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://your-app.vercel.app/api/webhook`
4. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** → paste into Vercel as `STRIPE_WEBHOOK_SECRET`
6. Redeploy on Vercel (it picks up the new env var)

---

## STEP 5: Update NEXT_PUBLIC_URL

1. In Vercel → Project Settings → Environment Variables
2. Update `NEXT_PUBLIC_URL` to your actual live URL
3. Redeploy

---

## YOU'RE LIVE! 🎉

Your app is now at: `https://your-app.vercel.app`

**Share it:**
- r/Valorant, r/leagueoflegends, r/Competitiveoverwatch
- Discord servers for each game
- TikTok/YouTube short showing it in action

---

## Revenue Projection

| Subscribers | Monthly Revenue |
|-------------|----------------|
| 10          | $99.90          |
| 50          | $499.50         |
| 100         | $999.00         |
| 500         | $4,995.00       |

Stripe takes 2.9% + $0.30 per transaction.

---

## Questions?
Come back to Claude with any issues — paste the error message and we'll fix it together.
