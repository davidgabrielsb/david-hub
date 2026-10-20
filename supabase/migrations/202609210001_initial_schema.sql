-- David Hub: usuários, espaços compartilhados e documentos sincronizados.
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type public.workspace_role as enum ('owner', 'member');

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.workspace_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table public.workspace_documents (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  module text not null check (module in ('tasks','records','inventory','finance','habits','routines','events','inbox')),
  payload jsonb not null default '{}'::jsonb,
  version bigint not null default 1,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (workspace_id, module)
);

create index workspace_members_user_idx on public.workspace_members(user_id);
create index workspace_documents_updated_idx on public.workspace_documents(workspace_id, updated_at desc);

create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.workspace_members m where m.workspace_id = target_workspace and m.user_id = auth.uid()) $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  insert into public.profiles(id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''));
  return new;
end $$;

create trigger auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.add_workspace_owner()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  insert into public.workspace_members(workspace_id, user_id, role) values (new.id, new.owner_id, 'owner');
  return new;
end $$;

create trigger workspace_created after insert on public.workspaces
for each row execute procedure public.add_workspace_owner();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
create trigger profiles_updated before update on public.profiles for each row execute procedure public.touch_updated_at();
create trigger workspaces_updated before update on public.workspaces for each row execute procedure public.touch_updated_at();
create trigger documents_updated before update on public.workspace_documents for each row execute procedure public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_documents enable row level security;

create policy "profile owner can read" on public.profiles for select using (id = auth.uid());
create policy "profile owner can update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "owner and members can read workspace" on public.workspaces for select to authenticated using (owner_id = auth.uid() or public.is_workspace_member(id));
create policy "users can create workspace" on public.workspaces for insert with check (owner_id = auth.uid());
create policy "owners can update workspace" on public.workspaces for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owners can delete workspace" on public.workspaces for delete using (owner_id = auth.uid());

create policy "members can view members" on public.workspace_members for select using (public.is_workspace_member(workspace_id));
create policy "owners can add members" on public.workspace_members for insert with check (
  exists(select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid())
);
create policy "owners or self can remove membership" on public.workspace_members for delete using (
  user_id = auth.uid() or exists(select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid())
);

create policy "members can read documents" on public.workspace_documents for select using (public.is_workspace_member(workspace_id));
create policy "members can create documents" on public.workspace_documents for insert with check (public.is_workspace_member(workspace_id) and updated_by = auth.uid());
create policy "members can update documents" on public.workspace_documents for update using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id) and updated_by = auth.uid());
create policy "owners can delete documents" on public.workspace_documents for delete using (
  exists(select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid())
);

alter publication supabase_realtime add table public.workspace_documents;

-- A Data API foi criada sem exposição automática; usuários logados recebem
-- privilégios de tabela, enquanto as políticas RLS limitam as linhas acessíveis.
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.workspaces to authenticated;
grant select, insert, update, delete on table public.workspace_members to authenticated;
grant select, insert, update, delete on table public.workspace_documents to authenticated;
grant execute on function public.is_workspace_member(uuid) to authenticated;
