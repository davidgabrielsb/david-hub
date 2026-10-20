-- Permissões básicas para usuários logados; as políticas RLS continuam decidindo quais linhas cada pessoa acessa.
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.workspaces to authenticated;
grant select, insert, update, delete on table public.workspace_members to authenticated;
grant select, insert, update, delete on table public.workspace_documents to authenticated;
grant execute on function public.is_workspace_member(uuid) to authenticated;
