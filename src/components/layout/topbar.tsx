"use client";

import { usePathname } from "next/navigation";
import { AccentPicker } from "./accent-picker";
import { ThemeToggle } from "./theme-toggle";

export function Topbar() {
  const pathname = usePathname();
  const segs = pathname.replace(/^\//, "").split("/").filter(Boolean);

  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span>my&apos;G</span>
        {segs.map((s, i) => (
          <span key={`${s}-${i}`} style={{ display: "inline-flex", alignItems: "center" }}>
            <span className="dot" />
            <span className={i === segs.length - 1 ? "now" : ""}>{decodeURIComponent(s)}</span>
          </span>
        ))}
      </div>
      <div className="actions">
        <ThemeToggle />
        <AccentPicker />
        <span className="live-tag">
          <span className="dot" /> en vivo
        </span>
      </div>
    </header>
  );
}
