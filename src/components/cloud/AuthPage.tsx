import { useState } from "react";
import { supabase } from "../../lib/supabase/client";

export function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true); setMessage("");
    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { display_name: name.trim() } } });
    setBusy(false);
    if (result.error) { setMessage(result.error.message); return; }
    if (mode === "signup" && !result.data.session) setMessage("Conta criada. Confira seu e-mail para confirmar o acesso.");
  }

  return <main className="auth-page"><section className="auth-card">
    <div className="auth-brand"><span>DH</span><div><h1>David Hub</h1><p>Sua vida organizada e sincronizada.</p></div></div>
    <div className="auth-tabs"><button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Entrar</button><button type="button" className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>Criar conta</button></div>
    <form onSubmit={submit}>
      {mode === "signup" && <label>Seu nome<input value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" /></label>}
      <label>E-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
      <label>Senha<input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
      <button className="auth-submit" disabled={busy}>{busy ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar minha conta"}</button>
    </form>
    {message && <p className="auth-message" role="status">{message}</p>}
  </section></main>;
}
