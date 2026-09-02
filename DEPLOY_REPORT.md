# Relatório de preparação para Vercel e Supabase

## Resultado da auditoria

O projeto foi preparado para o fluxo **GitHub → Vercel → Supabase**, usando **Node.js 24.x** fixado em `package.json`, `.nvmrc` e `.node-version`, com frontend Vite, API Express/tRPC em Vercel Functions e PostgreSQL/Storage no Supabase. Os marcadores de conflito do Git foram removidos, os imports ausentes foram corrigidos e os caminhos de backend que dependiam de aliases foram convertidos para imports relativos, reduzindo o risco de falhas na compilação da Function.

A Function principal está em `api/[...path].ts`, com `api/index.ts` mantido como entrada compatível. O Express aceita os caminhos `/api/trpc` e `/trpc`, e o endpoint `/api/health` responde com um JSON simples para diagnosticar o encaminhamento da Function. O fallback da SPA permanece configurado no `vercel.json` sem capturar as rotas iniciadas por `/api`.

## Validações executadas

| Verificação | Resultado |
| --- | --- |
| `npm ci --no-audit --no-fund` | Aprovado; pacote fixado para Node.js 24.x |
| `npm run check` | Aprovado |
| `npm run build` | Aprovado |
| `npm test` | Aprovado: 9 arquivos e 25 testes |
| Bundle de `api/index.ts` com esbuild | Aprovado |
| Bundle de `api/[...path].ts` com esbuild | Aprovado |
| Prettier nos arquivos críticos | Aprovado |
| Servidor local em produção | Home, `/admin`, `/api/health`, manifest e tRPC responderam HTTP 200 | 
| Rotas alternativas da API | `/api/trpc` e `/trpc` responderam HTTP 200; cobre o encaminhamento catch-all | 
| Schema Supabase | Tabelas, triggers e políticas preparados para reaplicação idempotente |
| Marcadores de conflito e arquivos `.env` reais | Não encontrados; apenas `.env.example` foi mantido |

A validação local do pipeline é reprodutível, mas o deploy remoto real ainda depende das credenciais do projeto Vercel e das variáveis do Supabase do proprietário. A tentativa de simulação pela CLI da Vercel foi interrompida antes do build remoto porque o token disponível no sandbox foi rejeitado como inválido; nenhuma publicação foi realizada.

## Configuração da Vercel

Use a raiz do repositório como **Root Directory**. O projeto já declara `npm install`, `npm run build` e `dist/public` no `vercel.json`. Não configure Start Command na Vercel: as Functions são descobertas no diretório `api/`.

Depois do redeploy, acesse `/api/health`. Se ele responder HTTP 200, a Function subiu corretamente; se ainda houver HTTP 500, copie o stack trace completo de **Vercel → Functions → Logs**, pois o aviso de Node 20 e uma exceção de runtime são problemas distintos. A resposta esperada é semelhante a:

```json
{"ok":true,"service":"bestiario-cultural-api"}
```

## Variáveis obrigatórias

Cadastre estas variáveis na Vercel para Production, Preview e Development quando aplicável:

| Variável | Uso |
| --- | --- |
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave secreta usada somente pelo backend |
| `ADMIN_LOCAL_USERNAME` | Usuário da área `/admin` |
| `ADMIN_LOCAL_PASSWORD` | Senha da área `/admin` |
| `JWT_SECRET` | Assinatura da sessão administrativa |
| `NODE_ENV` | Use `production` na produção |

Nunca publique `SUPABASE_SERVICE_ROLE_KEY` no GitHub ou no código do navegador. Execute `supabase/schema.sql` no SQL Editor do Supabase antes de usar gravações administrativas. O seed é executado separadamente com `npm run db:seed` e não faz parte do build.

## Limite de upload

O painel aceita imagens JPG, PNG, WEBP ou GIF de até **2,5 MB**. Esse limite considera a codificação base64 e deixa margem para o payload JSON da Function.

## Referências

[1]: https://vercel.com/docs/frameworks/frontend/vite "Vite on Vercel"
[2]: https://vercel.com/docs/functions/runtimes/node-js "Using the Node.js Runtime with Vercel Functions"
