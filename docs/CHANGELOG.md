# Changelog Luxa

## 2026-08-24 (responsividade)

### Mobile + desktop adaptativo
- `globals.css`: `overflow-x: hidden`, `max-width: 100vw`, `100dvh`, safe-area, `.luxa-sheet`, imagens max-width 100%
- `layout.tsx`: `viewport` device-width + `viewportFit: cover`
- `AppShell`: bottom tab bar no mobile, sidebar no desktop, `min-w-0`, drawer
- `CreatorProfile` / Home / Subscribe / Payment modal: truncate, flex-wrap, sticky CTA acima da nav, modal com scroll interno

## 2026-08-24

### Docs + logging padrão
- `docs/DEVELOPMENT.md`, `ARCHITECTURE.md`, `CHANGELOG`
- `src/lib/logger.ts` + APIs Stripe logadas

### Stripe inline (Payment Element)
- Modal + incomplete subscription; `product` id (não `product_data`)

### Auth + DB
- Supabase Analistcs `luxa_*`, login/signup
