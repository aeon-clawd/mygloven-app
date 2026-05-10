"use client";

import { useEffect } from "react";

export const ACCENTS: Record<
  string,
  { color: string; hover: string; soft: string; label: string }
> = {
  cian: { color: "#33b9fa", hover: "#5cc7fb", soft: "#33b9fa14", label: "Cian" },
  naranja: { color: "#ff4d00", hover: "#ff6a26", soft: "#ff4d0014", label: "Naranja" },
  lima: { color: "#a3e635", hover: "#bef264", soft: "#a3e63514", label: "Lima" },
  rosa: { color: "#ff3da5", hover: "#ff5fb6", soft: "#ff3da514", label: "Rosa" },
  ambar: { color: "#facc15", hover: "#fde047", soft: "#facc1514", label: "Ámbar" },
  lila: { color: "#a78bfa", hover: "#c4b5fd", soft: "#a78bfa14", label: "Lila" },
};

export const ACCENT_DEFAULT = "cian";
export const ACCENT_STORAGE_KEY = "myg-accent";

export function applyAccent(name: string) {
  const a = ACCENTS[name] || ACCENTS[ACCENT_DEFAULT];
  const root = document.documentElement.style;
  root.setProperty("--color-accent", a.color);
  root.setProperty("--color-accent-hover", a.hover);
  root.setProperty("--color-accent-soft", a.soft);
  document.documentElement.setAttribute("data-accent", name);
  try {
    localStorage.setItem(ACCENT_STORAGE_KEY, name);
  } catch {
    /* ignore */
  }
}

export function AccentBoot() {
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(ACCENT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    const name = stored && ACCENTS[stored] ? stored : ACCENT_DEFAULT;
    applyAccent(name);
  }, []);
  return null;
}
