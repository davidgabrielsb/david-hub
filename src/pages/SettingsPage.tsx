import { AppUpdates } from "../components/cloud/AppUpdates";
import { useEffect, useRef, useState } from "react";
import { isCloudConfigured, supabase } from "../lib/supabase/client";
const storageKeys = ["david-hub-tasks", "david-hub-inventory", "david-hub-records", "david-hub-events", "david-hub-inbox", "david-hub-habits", "david-hub-bills", "david-hub-routines", "david-hub-sites"];
export function SettingsPage() {
  const inputRef = useRef<HTMLInputElement>(null); const [message, setMessage] = useState(""); const [userEmail, setUserEmail] = useState("");
  useEffect(() => { if (supabase) void supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? "")); }, []);
  function exportData() {
    const data = Object.fromEntries(storageKeys.map((key) => [key, localStorage.getItem(key)]));
    const url = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data }, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = `david-hub-backup-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url); setMessage("Backup criado.");
  }
  async function importData(file?: File) {
    if (!file) return;
    try { const parsed = JSON.parse(await file.text()) as { data?: Record<string, string | null> };
      if (!parsed.data) throw new Error();
      storageKeys.forEach((key) => { const value = parsed.data?.[key]; if (typeof value === "string") localStorage.setItem(key, value); });
      window.location.reload();
    } catch { setMessage("Não foi possível ler esse backup."); }
  }
  return <section><header className="page-header"><div><h2>Dados e backup</h2><p>Proteja seus dados locais e leve uma cópia para outro computador.</p></div></header>
    <AppUpdates />
    <div className="settings-card"><h3>Backup completo</h3><p>O arquivo inclui tarefas, projetos, calendário, estoque, hábitos, contas, sites e caixa de entrada.</p><div><button onClick={exportData}>Baixar backup</button><button onClick={() => inputRef.current?.click()}>Restaurar backup</button><input ref={inputRef} hidden type="file" accept="application/json" onChange={(event) => void importData(event.target.files?.[0])} /></div>{message && <small>{message}</small>}</div>
    <div className="settings-card"><h3>Sincronização</h3>{isCloudConfigured ? <><p><strong>Nuvem conectada.</strong> Tarefas, projetos, calendário, estoque, hábitos, finanças, rotinas, sites e caixa de entrada são sincronizados automaticamente.</p>{userEmail && <small>Conta: {userEmail}</small>}<div><button onClick={() => void supabase?.auth.signOut()}>Sair desta conta</button></div></> : <p>Modo local ativo. Configure as chaves públicas do Supabase para ativar login e sincronização entre Windows e macOS.</p>}</div>
  </section>;
}
