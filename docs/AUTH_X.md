# Login com X (Twitter)

## Middleware 500 (MIDDLEWARE_INVOCATION_FAILED)

Se a Vercel mostra crash no Routing Middleware:

1. Confirma na Vercel (Production + Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Redeploy depois de gravar as env.
3. O middleware foi endurecido para **não** derrubar o site se o env faltar.

## OAuth no Supabase (importante)

O provider **Twitter** no Supabase usa normalmente as chaves **OAuth 1.0a**:

- API Key (Consumer Key) → Client ID no Supabase
- API Secret Key → Client Secret no Supabase

As credenciais **OAuth 2.0** (Client ID tipo `Q3ZpdXVf…` + Client Secret) do portal X **não** substituem automaticamente o provider clássico do Supabase. Se o outro app já funciona com as chaves antigas, **mantém** as mesmas no Supabase para a Luxa.

## Callback no portal X

```
https://sgolmmhbufosmtigaakx.supabase.co/auth/v1/callback
```

## Redirect no Supabase

```
https://SEU-DOMINIO.vercel.app/auth/callback
```

## Código Luxa

- `XAuthButton` → `signInWithOAuth({ provider: "twitter" })`
- `/auth/callback` troca o `code` pela sessão
