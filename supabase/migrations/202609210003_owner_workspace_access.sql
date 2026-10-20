-- O proprietário precisa conseguir ler o espaço no mesmo comando que o cria.
drop policy if exists "members can read workspace" on public.workspaces;
create policy "owner and members can read workspace"
on public.workspaces for select
to authenticated
using (owner_id = auth.uid() or public.is_workspace_member(id));
