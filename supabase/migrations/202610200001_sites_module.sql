-- Expande os módulos aceitos sem alterar documentos ou permissões existentes.
begin;
alter table public.workspace_documents
  drop constraint workspace_documents_module_check;
alter table public.workspace_documents
  add constraint workspace_documents_module_check
  check (module in ('tasks','records','inventory','finance','habits','routines','events','inbox','sites'));
commit;
