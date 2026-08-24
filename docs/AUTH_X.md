# Login com X (Twitter)

App OAuth: **fanyx** (credenciais só em secrets — **nunca** no Git).

## 1. Portal X Developer

Em [developer.x.com](https://developer.x.com) → app **fanyx**:

**Callback URL / Redirect URI** (obrigatório):

```
https://sgolmmhbufosmtigaakx.supabase.co/auth/v1/callback
```

Website URL: URL de produção da Luxa na Vercel.

Permissões: Read (basta para login).

## 2. Supabase Dashboard

**Authentication → Providers → Twitter**

| Campo | Valor |
|--------|--------|
| Enable | ON |
| API Key | Consumer Key do app X |
| API Secret Key | Secret Key do app X |

**Authentication → URL Configuration**

- Site URL: `https://SEU-DOMINIO.vercel.app`
- Redirect URLs: `https://SEU-DOMINIO.vercel.app/auth/callback`

## 3. Fluxo no app

1. Botão **Continue with X** → `signInWithOAuth({ provider: "twitter" })`
2. X autoriza → Supabase callback
3. Redirect → `/auth/callback` → sessão cookie → home

## 4. Segurança

- Consumer Key / Secret / Bearer **não** entram no repositório.
- Se vazaram no chat, **regenerar** no portal X.
- Bearer Token (app-only) não é necessário para OAuth de usuário.

## Código

- `src/components/XAuthButton.tsx`
- `src/app/auth/login/page.tsx` / `signup/page.tsx`
- `src/app/auth/callback/route.ts`
