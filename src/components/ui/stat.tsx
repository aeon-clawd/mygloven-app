interface StatProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaDir?: "up" | "down" | "flat";
  accent?: boolean;
}

export function Stat({ label, value, delta, deltaDir = "up", accent }: StatProps) {
  return (
    <div className="stat">
      <div className="lbl">— {label}</div>
      <div className={`num${accent ? " accent" : ""}`}>{value}</div>
      {delta && (
        <div className={`delta ${deltaDir}`}>
          {deltaDir === "up" ? "↑" : deltaDir === "down" ? "↓" : "—"} {delta}
        </div>
      )}
    </div>
  );
}
