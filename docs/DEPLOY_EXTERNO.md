# Deploy externo — Vercel + Supabase + GitHub

Esta versão não depende do Manus nem do Render.

## Hospedagem

- Frontend: Vercel, plano gratuito/Hobby.
- API: Vercel Functions (Node.js).
- Banco: Supabase PostgreSQL.
- Imagens: Supabase Storage.
- Versionamento: GitHub.

## Vercel

Build Command:

```bash
npm run build
```

Output Directory:

```text
dist/public
```

Install Command:

```bash
npm install
```

Não é necessário um Start Command na Vercel. A aplicação HTTP é exposta por `api/[...path].ts` como Vercel Function.

O `vercel.json` também contém o fallback da SPA para que rotas do frontend não retornem 404.

## Variáveis

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
ADMIN_LOCAL_USERNAME
ADMIN_LOCAL_PASSWORD
JWT_SECRET
NODE_ENV=production
```

O seed das culturas deve ser executado separadamente:

```bash
npm run db:seed
```

A chave secreta do Supabase fica somente no backend/Vercel Environment Variables.
