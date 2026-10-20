import { supabase } from "./client";

export const workspaceModules = [
  "tasks",
  "records",
  "inventory",
  "finance",
  "habits",
  "routines",
  "events",
  "inbox",
  "sites",
] as const;

export type WorkspaceModule = typeof workspaceModules[number];

export interface CloudDocument<T = unknown> {
  workspace_id: string;
  module: WorkspaceModule;
  payload: T;
  version: number;
  updated_at: string;
  updated_by: string | null;
}

function client() {
  if (!supabase) throw new Error("Supabase ainda não foi configurado.");
  return supabase;
}

export async function loadWorkspaceDocument<T>(workspaceId: string, module: WorkspaceModule) {
  const { data, error } = await client()
    .from("workspace_documents")
    .select("workspace_id,module,payload,version,updated_at,updated_by")
    .eq("workspace_id", workspaceId)
    .eq("module", module)
    .maybeSingle();
  if (error) throw error;
  return data as CloudDocument<T> | null;
}

export async function saveWorkspaceDocument<T>(workspaceId: string, module: WorkspaceModule, payload: T, version: number) {
  const { data: authData, error: authError } = await client().auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error("Faça login antes de sincronizar.");

  const { data, error } = await client()
    .from("workspace_documents")
    .upsert({ workspace_id: workspaceId, module, payload, version, updated_by: authData.user.id }, { onConflict: "workspace_id,module" })
    .select("workspace_id,module,payload,version,updated_at,updated_by")
    .single();
  if (error) throw error;
  return data as CloudDocument<T>;
}

export function subscribeToWorkspace(workspaceId: string, onChange: (document: CloudDocument) => void) {
  return client()
    .channel(`workspace:${workspaceId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "workspace_documents", filter: `workspace_id=eq.${workspaceId}` }, (message) => {
      if (message.new && Object.keys(message.new).length) onChange(message.new as CloudDocument);
    })
    .subscribe();
}
