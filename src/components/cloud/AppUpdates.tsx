import { useEffect, useRef, useState } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { getVersion } from "@tauri-apps/api/app";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export function AppUpdates() {
  const [version, setVersion] = useState("");
  const [update, setUpdate] = useState<Update | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const updateRef = useRef<Update | null>(null);
  const checking = useRef(false);
  const enabled = isTauri() && import.meta.env.VITE_UPDATER_CONFIGURED === "true";

  async function checkUpdate(automatic = false) {
    if (!enabled || checking.current) return;
    checking.current = true;
    setBusy(true);
    if (!automatic) setMessage("Verificando atualizações...");
    try {
      const next = await check({ timeout: 15000 });
      await updateRef.current?.close();
      updateRef.current = next;
      setUpdate(next);
      setMessage(next ? `Versão ${next.version} disponível.` : automatic ? "" : "Seu Hub está atualizado.");
    } catch {
      if (!automatic) setMessage("Não foi possível verificar agora. Confira a conexão e tente novamente.");
    } finally { checking.current = false; setBusy(false); }
  }

  useEffect(() => {
    if (isTauri()) void getVersion().then(setVersion).catch(() => {});
    if (enabled) void checkUpdate(true);
    return () => { void updateRef.current?.close(); };
  }, [enabled]);

  async function install() {
    if (!update || busy) return;
    setBusy(true);
    let downloaded = 0;
    let total = 0;
    setMessage("Baixando atualização...");
    try {
      await update.downloadAndInstall((event) => {
        if (event.event === "Started") total = event.data.contentLength ?? 0;
        if (event.event === "Progress") {
          downloaded += event.data.chunkLength;
          setMessage(total ? `Baixando atualização: ${Math.min(100, Math.round(downloaded / total * 100))}%` : "Baixando atualização...");
        }
        if (event.event === "Finished") setMessage("Instalando atualização. O Hub será reiniciado...");
      });
      await relaunch();
    } catch {
      setMessage("A atualização não foi concluída. Tente novamente; seus dados continuam salvos.");
      setBusy(false);
    }
  }

  return <div className="settings-card"><h3>Atualizações do Hub{version ? ` • ${version}` : ""}</h3>
    <p>{enabled ? "Confira e instale novas versões sem baixar a pasta do projeto. O Hub será fechado durante a instalação." : <>Baixe a versão mais recente para o seu computador em <a href="https://github.com/davidgabrielsb/david-hub/releases/latest" target="_blank" rel="noreferrer">Versões do David Hub</a>. No Mac, use o pacote macOS compatível com seu processador.</>}</p>
    {enabled && <div><button disabled={busy} onClick={() => void checkUpdate()}>Verificar atualizações</button>{update && <button disabled={busy} onClick={() => void install()}>Atualizar e reiniciar</button>}</div>}
    {message && <p role="status">{message}</p>}{update?.body && <p style={{ whiteSpace: "pre-wrap" }}>{update.body}</p>}
  </div>;
}
