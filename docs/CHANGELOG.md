# Changelog Luxa

## 2026-08-24

### Docs + logging padrão
- Criados `docs/DEVELOPMENT.md`, `docs/ARCHITECTURE.md`, este CHANGELOG
- `src/lib/logger.ts` — logger estruturado para APIs
- APIs Stripe passam a logar start / success / error (sem secrets)

### Stripe inline (Payment Element)
- Removido fluxo principal de redirect para Hosted Checkout
- `POST /api/checkout/create-subscription` + modal `StripePaymentModal`
- **Fix build:** subscription `price_data` usa `product: id` (não `product_data`)
- Documentado em `docs/STRIPE.md` e cabeçalhos de código

### Auth + DB
- Supabase projeto Analistcs: tabelas `luxa_*`, trigger de profile no signup
- Login/signup + middleware de sessão

### Build fixes anteriores
- Tipagem `cookiesToSet` no middleware Supabase SSR
