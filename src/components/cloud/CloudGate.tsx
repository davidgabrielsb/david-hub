import { useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { isCloudConfigured, supabase } from "../../lib/supabase/client";
import { storeAdapters } from "../../lib/supabase/storeAdapters";
import { loadWorkspaceDocument, saveWorkspaceDocument, subscribeToWorkspace } from "../../lib/supabase/workspaceData";
import { AuthPage } from "./AuthPage";

export function CloudGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isCloudConfigured);
  const [syncState, setSyncState] = useState<"preparing" | "online" | "offline">("preparing");
  const [compactIndicator, setCompactIndicator] = useState(false);

  useEffect(() => {
    if (syncState !== "online") { setCompactIndicator(false); return; }
    const timer = window.setTimeout(() => setCompactIndicator(true), 3000);
    return () => window.clearTimeout(timer);
  }, [syncState]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => { setSession(next); setLoading(false); });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !session) return;
    let disposed = false;
    let applyingRemote = false;
    let channel: ReturnType<typeof subscribeToWorkspace> | undefined;
    const timers = new Map<string, number>();
    const versions = new Map<string, number>();
    const unsubscribers: Array<() => void> = [];

    async function start() {
      try {
        const { data: membership, error: membershipError } = await supabase!
          .from("workspace_members").select("workspace_id").eq("user_id", session!.user.id).limit(1).maybeSingle();
        if (membershipError) throw membershipError;
        let workspaceId = membership?.workspace_id as string | undefined;
        if (!workspaceId) {
          const { data, error } = await supabase!.from("workspaces")
            .insert({ name: "Nosso David Hub", owner_id: session!.user.id }).select("id").single();
          if (error) throw error;
          workspaceId = data.id;
        }
        if (!workspaceId) throw new Error("Não foi possível preparar o espaço compartilhado.");
        const activeWorkspaceId = workspaceId;

        for (const item of storeAdapters) {
          const remote = await loadWorkspaceDocument<Record<string, unknown>>(activeWorkspaceId, item.module);
          if (remote) {
            applyingRemote = true; item.apply(remote.payload); applyingRemote = false;
            versions.set(item.module, remote.version);
          } else {
            const version = Date.now();
            await saveWorkspaceDocument(activeWorkspaceId, item.module, item.read(), version);
            versions.set(item.module, version);
          }
          unsubscribers.push(item.subscribe(() => {
            if (applyingRemote || disposed) return;
            setSyncState("preparing");
            const previous = timers.get(item.module);
            if (previous) window.clearTimeout(previous);
            timers.set(item.module, window.setTimeout(async () => {
              try {
                const version = Date.now();
                await saveWorkspaceDocument(activeWorkspaceId, item.module, item.read(), version);
                versions.set(item.module, version); setSyncState("online");
              } catch { setSyncState("offline"); }
            }, 500));
          }));
        }

        channel = subscribeToWorkspace(activeWorkspaceId, (document) => {
          if ((versions.get(document.module) ?? 0) >= document.version) return;
          const item = storeAdapters.find((candidate) => candidate.module === document.module);
          if (!item) return;
          applyingRemote = true; item.apply(document.payload as Record<string, unknown>); applyingRemote = false;
          versions.set(document.module, document.version);
        });
        if (!disposed) setSyncState("online");
      } catch (error) {
        console.error("Falha ao iniciar sincronização", error);
        if (!disposed) setSyncState("offline");
      }
    }
    start();
    return () => {
      disposed = true; channel?.unsubscribe(); unsubscribers.forEach((unsubscribe) => unsubscribe());
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [session]);

  if (!isCloudConfigured) return children;
  if (loading) return <main className="cloud-loading">Preparando o David Hub...</main>;
  if (!session) return <AuthPage />;
  const syncLabel = syncState === "online" ? "Sincronizado" : syncState === "offline" ? "Sem conexão" : "Sincronizando";
  return <><button type="button" className={`sync-indicator ${syncState} ${compactIndicator ? "compact" : ""}`} aria-label={syncLabel} title={syncLabel} onClick={() => setCompactIndicator((current) => !current)}><span className="sync-dot" /><span className="sync-label">{syncLabel}</span></button>{children}</>;
}
