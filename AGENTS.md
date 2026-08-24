# Instruções para agentes de IA (Grok / Cursor / etc.)

Antes de escrever código neste repositório:

1. Ler **`docs/DEVELOPMENT.md`** (processo obrigatório)
2. Ler **`docs/ARCHITECTURE.md`**
3. Se for pagamento: **`docs/STRIPE.md`**
4. Registrar mudança em **`docs/CHANGELOG.md`**
5. Usar **`src/lib/logger.ts`** em toda rota API (info + error)
6. Nunca logar secrets / client_secret / cartão

## Erro clássico já cometido (não repetir)

Subscription `items.price_data` **não** aceita `product_data`.
Criar Product → `product: product.id`.

## Padrão de commit

- Código + docs no mesmo PR/push quando possível
- Comentário de cabeçalho em arquivos de API novos
