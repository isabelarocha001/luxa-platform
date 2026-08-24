# Painel Admin Luxa

URL: **`/admin`**

## Por que existiam perfis na home?

Os handles `luzcervo` / `sofia-eu` vinham de **`src/lib/demo-data.ts`** — dados estáticos só para prototipar o layout OnlyFans.
**Não** são creators geridos pelo admin. Creators reais ficam em `luxa_creators` (Supabase) e são criados no painel.

## Acesso

1. Conta logada com `luxa_profiles.role = 'admin'`, **ou**
2. Email listado em env `ADMIN_EMAILS` (ex: `voce@email.com,outro@email.com`)

Primeiro acesso: coloque seu email em `ADMIN_EMAILS` na Vercel → login → `/admin`.

## Seções

| Rota | Função |
|------|--------|
| `/admin` | Dashboard (contagens) |
| `/admin/creators` | Criar / ativar / verificar creators |
| `/admin/users` | Lista `luxa_profiles` |
| `/admin/subscriptions` | Assinaturas Stripe sincronizadas |

## APIs

- `POST /api/admin/creators` — cria creator
- `PATCH /api/admin/creators/[id]` — `is_active`, `is_verified`, etc.

Todas exigem admin + logs via `logger`.

## Limite de schema (importante)

`luxa_creators.user_id` é **NOT NULL + UNIQUE** (1 creator por conta auth).
Admin criar vários creators “órfãos” exige migration tornando `user_id` nullable.
Enquanto isso, o 2º insert com o mesmo admin pode retornar 409.

## Env

```
ADMIN_EMAILS=seu@email.com
SUPABASE_SERVICE_ROLE_KEY=...   # recomendado para listagens admin
```
