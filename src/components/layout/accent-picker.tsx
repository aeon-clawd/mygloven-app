"use client";

import { useEffect, useState } from "react";
import { ACCENTS, ACCENT_DEFAULT, ACCENT_STORAGE_KEY, applyAccent } from "./accent-boot";

export function AccentPicker() {
  const [active, setActive] = useState<string>(ACCENT_DEFAULT);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(ACCENT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setActive(stored && ACCENTS[stored] ? stored : ACCENT_DEFAULT);
  }, []);

  return (
    <div className="accent-picker">
      <span className="lbl">— Acento</span>
      {Object.entries(ACCENTS).map(([name, a]) => (
        <button
          key={name}
          type="button"
          className={`swatch${name === active ? " active" : ""}`}
          style={{ ["--swatch" as string]: a.color } as React.CSSProperties}
          onClick={() => {
            applyAccent(name);
            setActive(name);
          }}
          data-cursor={a.label.toLowerCase()}
          title={a.label}
          aria-label={`Acento ${a.label}`}
        />
      ))}
    </div>
  );
}
