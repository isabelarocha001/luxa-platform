# Luxa — regras de desenvolvimento (obrigatório)

Este arquivo é a **fonte da verdade** para quem codar (humano ou IA).
Toda feature nova deve seguir isto. Não “só funciona”: tem que estar **documentado + logado**.

---

## 1. Antes de mexer em qualquer arquivo

1. Ler `docs/ARCHITECTURE.md` (visão geral)
2. Ler o doc específico do domínio (`docs/STRIPE.md`, etc.)
3. Ler o cabeçalho / comentário do próprio arquivo
4. Se for API route: garantir `logger` em entrada, sucesso e erro

---

## 2. Toda mudança de código DEVE incluir

| Entrega | Obrigatório |
|---------|-------------|
| Código | Sim |
| Comentário no arquivo (o que faz / o que NÃO fazer) | Sim |
| Atualizar `docs/` do domínio | Sim |
| Entrada em `docs/CHANGELOG.md` | Sim |
| Logs estruturados (`src/lib/logger.ts`) em rotas API | Sim |
| Testar build TypeScript mentalmente (tipos Stripe, Next) | Sim |

---

## 3. Onde documentar o quê

| Arquivo | Conteúdo |
|---------|----------|
| `docs/ARCHITECTURE.md` | Mapa do sistema, pastas, fluxo usuário |
| `docs/STRIPE.md` | Pagamentos, regras de API Stripe, env |
| `docs/DEVELOPMENT.md` | Este arquivo — processo |
| `docs/CHANGELOG.md` | Histórico curto do que mudou e por quê |
| Cabeçalho do `.ts` / `.tsx` | O que o módulo faz + riscos de quebrar |

---

## 4. Logs (sempre)

Usar **somente** `src/lib/logger.ts`:

```ts
import { logger } from "@/lib/logger";

const log = logger("create-subscription");
log.info("start", { handle, planMonths, userId: user.id });
log.warn("no creator in db", { handle });
log.error("stripe failed", { err: message });
```

### Regras de log
- **Nunca** logar: `client_secret`, número de cartão, CVC, `STRIPE_SECRET_KEY`, service role key
- **Sempre** logar: request id implícito via scope, `userId` (uuid), `handle`, `subscriptionId`, status HTTP, duração se possível
- Em erro: `log.error` + mensagem segura pro client
- Em Vercel: logs aparecem em Runtime Logs

---

## 5. Riscos conhecidos (não repetir)

| Área | Risco | Como evitar |
|------|-------|-------------|
| Stripe Subscription `price_data` | Usar `product_data` → **build TypeScript falha** | Criar Product → `product: id` |
| Stripe Checkout Session | Confundir com Subscription | Ver `docs/STRIPE.md` |
| Auth | Checkout sem login | Retornar 401 `AUTH_REQUIRED` |
| Webhook | Sem `STRIPE_WEBHOOK_SECRET` em prod | Obrigatório na Vercel |
| RLS Supabase | Service role só no server | Nunca expor no client |
| Middleware cookies | `cookiesToSet` sem tipo → build fail | Tipar `CookieToSet[]` |

---

## 6. Checklist antes de push

- [ ] Comentário de cabeçalho no arquivo novo/alterado
- [ ] `docs/CHANGELOG.md` atualizado
- [ ] Doc de domínio atualizado se mudou comportamento
- [ ] Logs em rotas API (info + error)
- [ ] Sem secrets no código
- [ ] Tipos Stripe / Next ok (sem `any` implícito em params públicos)
