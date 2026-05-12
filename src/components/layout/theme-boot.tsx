"use client";

import { useEffect } from "react";

export type Theme = "dark" | "paper";

export const THEME_DEFAULT: Theme = "dark";
export const THEME_STORAGE_KEY = "myg-theme";
export const THEME_EVENT = "myg:theme-change";

export function applyTheme(t: Theme) {
  document.documentElement.setAttribute("data-theme", t);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, t);
  } catch {
    /* ignore */
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", t === "dark" ? "#0a0a0a" : "#fafafa");
}

export function readStoredTheme(): Theme {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  return stored === "paper" || stored === "dark" ? stored : THEME_DEFAULT;
}

export function ThemeBoot() {
  useEffect(() => {
    applyTheme(readStoredTheme());
  }, []);
  return null;
}
