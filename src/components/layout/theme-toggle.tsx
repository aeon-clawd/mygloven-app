"use client";

import { useEffect, useState } from "react";
import {
  applyTheme,
  readStoredTheme,
  THEME_EVENT,
  THEME_STORAGE_KEY,
  type Theme,
} from "./theme-boot";

export function ThemeToggle() {
  const [active, setActive] = useState<Theme>("dark");

  useEffect(() => {
    setActive(readStoredTheme());

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<Theme>).detail;
      if (detail === "dark" || detail === "paper") setActive(detail);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && (e.newValue === "dark" || e.newValue === "paper")) {
        applyTheme(e.newValue);
        setActive(e.newValue);
      }
    };
    window.addEventListener(THEME_EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(THEME_EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const handleClick = (t: Theme) => {
    applyTheme(t);
    setActive(t);
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: t }));
  };

  return (
    <div className="theme-toggle" role="group" aria-label="Tema">
      <span className="lbl">— Tema</span>
      <button
        type="button"
        className={`theme-btn${active === "dark" ? " active" : ""}`}
        onClick={() => handleClick("dark")}
        data-cursor="oscuro"
        aria-label="Tema oscuro"
        title="Oscuro"
      >
        <span className="theme-dot dark" />
      </button>
      <button
        type="button"
        className={`theme-btn${active === "paper" ? " active" : ""}`}
        onClick={() => handleClick("paper")}
        data-cursor="claro"
        aria-label="Tema claro"
        title="Claro"
      >
        <span className="theme-dot light" />
      </button>
    </div>
  );
}
