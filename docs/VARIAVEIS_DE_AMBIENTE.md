# Variáveis de ambiente

| Variável | Obrigatória | Uso |
|---|---:|---|
| `SUPABASE_URL` | Sim | URL do projeto Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim | Chave privada usada somente no servidor para banco e Storage. Nunca coloque em `VITE_*`. |
| `ADMIN_LOCAL_USERNAME` | Sim | Usuário do painel administrativo. |
| `ADMIN_LOCAL_PASSWORD` | Sim | Senha do painel administrativo. |
| `JWT_SECRET` | Sim | Assinatura da sessão administrativa local. |
| `NODE_ENV` | Não | `development` ou `production`. |
| `PORT` | Não | Porta usada apenas no desenvolvimento/local; a Vercel gerencia a porta da Function. |

Não commit `env`, `.env.local` ou qualquer chave do Supabase no GitHub.
