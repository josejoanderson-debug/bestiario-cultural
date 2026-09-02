# Bestiário Cultural

Plataforma digital para preservação e valorização das culturas populares brasileiras, com catálogo editorial, leitor em formato de livro, páginas de aprofundamento, galeria documental e área administrativa.

## Arquitetura independente

- **GitHub:** código-fonte e versionamento.
- **Supabase:** PostgreSQL para o acervo e Storage público para imagens.
- **Vercel:** hospedagem gratuita do frontend Vite e da API via Vercel Functions.
- **Wikimedia Commons:** fonte inicial de fotografias reais com crédito/licença registrados.
- **Sem dependência do Manus:** não existe login OAuth, banco MySQL/TiDB, Cloudinary ou armazenamento `/manus-storage` no fluxo da aplicação.

O cliente não recebe a `SUPABASE_SERVICE_ROLE_KEY`; ela fica somente no servidor. O Supabase recomenda manter chaves de serviço fora do navegador e usar variáveis de ambiente no provedor de hospedagem. O bucket público é usado somente para arquivos que devem ser exibidos publicamente.

## Configuração do Supabase

1. Crie um projeto no Supabase.
2. Abra **SQL Editor**.
3. Execute `supabase/schema.sql`.
4. Em **Project Settings → API**, copie a URL do projeto e a chave `service_role` para o servidor.
5. Não publique a chave `service_role` no GitHub.
6. Rode `npm run db:seed` uma vez para carregar as 30 culturas e sincronizar as páginas de aprofundamento. O script consulta o Wikimedia Commons para localizar fotografias reais quando o capítulo ainda não possui uma imagem externa.

## Desenvolvimento local

```bash
npm install
cp .env.example .env
npm run build
npm start
```

Para desenvolvimento com hot reload:

```bash
npm run dev
```

## Deploy na Vercel

O caminho recomendado é **GitHub → Vercel → Supabase**.

- Build Command: `npm run build`
- Output Directory: `dist/public`
- Install Command: `npm install`
- Start Command: **não configurar**; a API é executada por `api/[...path].ts`.
- Runtime Node.js: **24.x**; essa versão também está fixada em `package.json`, `.nvmrc` e `.node-version`.

Variáveis obrigatórias na Vercel:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_LOCAL_USERNAME`
- `ADMIN_LOCAL_PASSWORD`
- `JWT_SECRET`

Depois de configurar as variáveis, o banco pode ser carregado uma vez com `npm run db:seed` em um ambiente local.

Para o passo a passo completo, consulte `docs/COMO_COLOCAR_ONLINE.md`.

## GitHub

O repositório deve ser conectado diretamente à Vercel. O fluxo recomendado é:

```bash
git add .
git commit -m "migrar Bestiario para Supabase e Vercel"
git push origin main
```

## Área administrativa

A rota `/admin` continua protegida por usuário e senha definidos no servidor. A sessão local é assinada com `JWT_SECRET`. O público não possui permissão de escrita no acervo.

## Acervo

A edição inicial contém 30 manifestações/tradições, incluindo expressões da Paraíba e de todas as grandes regiões do Brasil. Cada capítulo possui texto principal e páginas de aprofundamento sobre contexto histórico, mestres/mestras e grupos, continuidade e salvaguarda, além de créditos das imagens.

### Nota sobre imagens

As fotografias externas são registradas com URL de origem, crédito e licença. Quando o Wikimedia Commons for usado, o usuário deve conferir a licença da obra específica antes de redistribuí-la fora do site. O Bestiário não atribui autoria de uma fotografia a uma instituição sem evidência na fonte.
