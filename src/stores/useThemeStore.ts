import { create } from "zustand";

export type Theme = "light" | "dark";
const key = "david-hub-theme";

function readTheme(): Theme {
  try { return localStorage.getItem(key) === "dark" ? "dark" : "light"; }
  catch { return "light"; }
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export const useThemeStore = create<{ theme: Theme; setTheme: (theme: Theme) => void }>((set) => ({
  theme: readTheme(),
  setTheme: (theme) => {
    applyTheme(theme);
    try { localStorage.setItem(key, theme); } catch { /* Keep the selection for this session. */ }
    set({ theme });
  },
}));

applyTheme(useThemeStore.getState().theme);

window.addEventListener("storage", (event) => {
  if (event.key === key || event.key === null) {
    const theme = readTheme();
    applyTheme(theme);
    useThemeStore.setState({ theme });
  }
});
