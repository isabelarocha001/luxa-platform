# Luxa × Stripe (card-only, EUR, inline)

## Product requirement
- Payments stay **on Luxa** (modal + Payment Element).
- **No** redirect to Stripe Hosted Checkout for the main flow.
- Method: **card only**, currency **EUR**, recurring subscriptions.

## Architecture
1. `POST /api/checkout/create-subscription`
   - Auth required (Supabase session)
   - Creates/reuses Stripe Customer (`metadata.luxa_user_id`)
   - Creates a Stripe **Product**, then Subscription with `items[].price_data.product = prod_id`
   - `payment_behavior: default_incomplete`
   - Returns `clientSecret` for Payment Element
2. `StripePaymentModal` + `@stripe/react-stripe-js` mounts form in a popup
3. `stripe.confirmPayment({ redirect: "if_required" })`
4. Webhook `POST /api/webhooks/stripe` syncs `luxa_subscriptions`

## TypeScript / API rules (DO NOT BREAK)

| API surface | How to pass product |
|-------------|---------------------|
| Checkout Session `line_items.price_data` | `product_data: { name }` OK |
| Subscription `items.price_data` | **Only** `product: "prod_xxx"` — create Product first |

If you put `product_data` on subscription `price_data`, **Next.js build fails**:
`Object literal may only specify known properties, and 'product_data' does not exist in type 'PriceData'`.

## Env (Vercel)
```
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## Webhook events
- `checkout.session.completed` (legacy if any)
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- Prefer also `invoice.paid` later

Endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
