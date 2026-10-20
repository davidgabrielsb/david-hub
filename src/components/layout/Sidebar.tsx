import { NavLink } from "react-router-dom";
const groups = [
  { title: "Hoje", items: [["⌂", "Início", "/"], ["＋", "Caixa de entrada", "/inbox"], ["✓", "Tarefas", "/tasks"], ["▦", "Calendário", "/calendar"]] },
  { title: "Áreas", items: [["▣", "Trabalho", "/work"], ["◇", "Estudos", "/study"], ["○", "Vida pessoal", "/personal"], ["↻", "Hábitos", "/habits"], ["☷", "Rotinas e revisão", "/routines"]] },
  { title: "Gestão", items: [["⌖", "Sites", "/sites"], ["□", "Estoque", "/inventory"], ["$", "Finanças", "/finance"]] },
  { title: "Sistema", items: [["⌕", "Busca", "/search"], ["↓", "Dados e backup", "/settings"]] },
];
export function Sidebar() { return <aside className="sidebar"><div className="sidebar-header"><h1>David Hub</h1><p>Central pessoal</p></div><nav className="sidebar-nav">{groups.map((group) => <div className="sidebar-group" key={group.title}><span className="sidebar-group-title">{group.title}</span>{group.items.map(([icon, label, path]) => <NavLink key={path} to={path} end={path === "/"} className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}><span className="sidebar-icon">{icon}</span>{label}</NavLink>)}</div>)}</nav></aside>; }
