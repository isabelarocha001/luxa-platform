# Luxa — arquitetura

Plataforma de conteúdo adulto estilo OnlyFans/Fansly, web-first (Next.js), público EU, pagamento **só cartão** via Stripe inline.

## Stack

| Camada | Tech |
|--------|------|
| Frontend | Next.js 15 App Router, React 19, TypeScript, Tailwind |
| Auth + DB | Supabase (projeto **Analistcs** `sgolmmhbufosmtigaakx`) |
| Pagamentos | Stripe live, Payment Element no modal |
| Host | Vercel |

## Pastas importantes

```
src/app/                  # rotas (pages + API)
  api/checkout/           # criar assinatura incompleta → clientSecret
  api/webhooks/stripe/    # sync luxa_subscriptions
  auth/                   # login / signup / callback
  c/[handle]/             # perfil criadora + subscribe
src/components/           # UI (SubscribeCheckout, StripePaymentModal, …)
src/lib/
  logger.ts               # logs estruturados (usar SEMPRE em API)
  stripe.ts               # client Stripe + regras de price_data
  supabase/               # client / server / middleware
  demo-data.ts            # creators demo até existir DB real
docs/                     # documentação obrigatória
```

## Fluxo de assinatura (atual)

```
Fan logado
  → /c/{handle}/subscribe
  → POST /api/checkout/create-subscription
      (Customer + Product + Subscription incomplete)
  → clientSecret
  → modal StripePaymentModal (Payment Element)
  → confirmPayment
  → /subscribe/success
  → webhook atualiza luxa_subscriptions (se creator existir no DB)
```

## Tabelas Supabase (prefixo luxa_)

- `luxa_profiles` — ligado a `auth.users`
- `luxa_creators` — handle, preço EUR
- `luxa_subscriptions` — fan × creator + ids Stripe
- `luxa_posts` / `luxa_media`
- `luxa_subscription_plans`

## O que NÃO misturar

O projeto Supabase **Analistcs** também tem tabelas de analytics (`profiles`, `payments`, `campaigns`…). **Não** reutilizar essas tabelas para Luxa — sempre `luxa_*`.

## Env Vercel (mínimo)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY          # webhook / admin
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL
```
