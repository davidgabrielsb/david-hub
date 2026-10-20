# Banco de dados do David Hub

## Preparação concluída

- Cliente Supabase instalado.
- Estrutura de usuários, espaços compartilhados e módulos criada.
- Regras de segurança por usuário (RLS) incluídas.
- Sincronização em tempo real preparada.
- O modo local continua funcionando enquanto as chaves não forem configuradas.

## Ativação

1. Crie um projeto em https://supabase.com/dashboard.
2. Abra o SQL Editor e execute `supabase/migrations/202609210001_initial_schema.sql`.
3. Em Project Settings > API, copie a URL do projeto e a chave pública (`anon`/`publishable`).
4. Copie `.env.example` para `.env.local` e preencha as duas variáveis.
5. Rode `npm run build` para confirmar a conexão.

Nunca coloque a chave `service_role` no aplicativo. Ela ignora as regras de segurança e deve existir somente em serviços protegidos.
