import { Outlet } from "react-router-dom";

import { Sidebar } from "./Sidebar";
import { QuickAdd } from "./QuickAdd";

export function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="app-content">
        <Outlet />
      </main>
      <QuickAdd />
    </div>
  );
}
