# Como colocar o Bestiário Cultural online gratuitamente

A hospedagem desta versão é **GitHub + Vercel + Supabase**.

- **GitHub:** guarda o código e o histórico do projeto.
- **Vercel:** publica o site e executa a API em Functions.
- **Supabase:** banco PostgreSQL e Storage das imagens.

## 1. Criar o projeto no Supabase

1. Acesse o painel do Supabase.
2. Crie um projeto chamado `bestiario-cultural` (ou outro nome).
3. Abra **SQL Editor**.
4. Crie uma nova consulta.
5. Abra `supabase/schema.sql` deste projeto.
6. Copie todo o arquivo para o SQL Editor.
7. Clique em **Run**.
8. Confira em **Table Editor** se as tabelas foram criadas.
9. Confira em **Storage** se o bucket `cultural-images` existe.

## 2. Copiar as credenciais do Supabase

No Supabase, abra **Settings > API Keys**.

Você precisa de:

- `SUPABASE_URL` — URL do projeto.
- `SUPABASE_SERVICE_ROLE_KEY` — chave secreta do servidor (ou a nova `sb_secret_...`).

A chave secreta **não deve ser colocada no GitHub nem no código do navegador**.

## 3. Preparar o GitHub

1. Crie/abra o repositório do Bestiário Cultural.
2. Extraia o ZIP.
3. Substitua o conteúdo antigo do repositório pelos arquivos desta versão.
4. Não envie `.env`, chaves ou senhas.
5. Faça commit e push para `main`.

Exemplo:

```bash
git add .
git commit -m "Migrar hospedagem para Vercel e Supabase"
git push origin main
```

## 4. Criar o projeto na Vercel

1. Entre na Vercel.
2. Clique em **Add New > Project**.
3. Escolha **Import Git Repository**.
4. Selecione o repositório do Bestiário.
5. Deixe **Root Directory** como `./`.
6. Framework: Vercel deve reconhecer o projeto; se pedir, escolha **Vite**.
7. Build Command: `npm run build`.
8. Output Directory: `dist/public`.
9. Install Command: `npm install`.
10. Clique em **Deploy**.

O arquivo `vercel.json` já deixa essas configurações registradas no repositório.

## 5. Configurar as variáveis da Vercel

Na Vercel, abra:

**Project > Settings > Environment Variables**

Crie estas variáveis para **Production, Preview e Development** quando fizer sentido:

```text
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_SECRETA
ADMIN_LOCAL_USERNAME=admin
ADMIN_LOCAL_PASSWORD=UMA_SENHA_FORTE
JWT_SECRET=UMA_STRING_LONGA_E_ALEATORIA
NODE_ENV=production
```

Não use os exemplos acima como senha real.

## 6. Fazer novo deploy

Depois de salvar as variáveis:

1. Vá em **Deployments**.
2. Abra o último deploy.
3. Clique em **Redeploy** se ele foi criado antes das variáveis.
4. Aguarde o build.
5. Abra o endereço `*.vercel.app`.

## 7. Popular as 30 culturas

A forma mais simples é executar o seed localmente uma vez, usando as mesmas variáveis do Supabase:

```bash
npm install
npm run db:seed
```

Depois confira no Supabase > Table Editor se existem os registros.

O seed é separado do deploy para evitar que cada build da Vercel tente recriar o acervo.

## 8. Testar a API

Abra o site e confira a página inicial.

Depois abra `/admin`.

Entre com `ADMIN_LOCAL_USERNAME` e `ADMIN_LOCAL_PASSWORD`.

Teste:

1. listar culturas;
2. abrir uma cultura;
3. criar uma cultura;
4. editar uma cultura;
5. publicar/despublicar;
6. enviar uma imagem de até **2,5 MB**.

O limite de 2,5 MB no painel deixa margem para a codificação base64 e os metadados JSON dentro do limite de payload das Vercel Functions.

## 9. Fluxo definitivo

Depois de configurado, o fluxo fica:

```text
GitHub
  ↓ push
Vercel
  ├── site Vite
  └── /api/trpc → Vercel Function → Express/tRPC
                         ↓
                      Supabase
                      ├── PostgreSQL
                      └── Storage
```

A cada `git push` para `main`, a Vercel pode criar um novo deploy pelo Git Integration.

## 10. Teste rápido de saúde

Depois do deploy, abra `/api/health`. A resposta esperada é um JSON com `ok: true`. Esse endpoint verifica se a Function Node.js está sendo encaminhada corretamente sem consultar o banco.

## 11. Se aparecer erro 500

Abra **Vercel > Deployments > seu deploy > Functions/Logs**.

Os erros mais comuns são:

- `Supabase não configurado`: variável `SUPABASE_URL` ausente.
- erro de chave: `SUPABASE_SERVICE_ROLE_KEY` incorreta.
- tabela inexistente: `supabase/schema.sql` ainda não foi executado.
- login administrativo falhando: confira `ADMIN_LOCAL_USERNAME`, `ADMIN_LOCAL_PASSWORD` e `JWT_SECRET`.
- erro `413`: arquivo/payload grande demais; use imagem de até 2,5 MB.

## 12. Segurança

Nunca coloque `SUPABASE_SERVICE_ROLE_KEY` em `client/src`, `.env` versionado ou código público. Ela é uma credencial de servidor com privilégios elevados.
