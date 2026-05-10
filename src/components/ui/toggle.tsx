"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      data-cursor={checked ? "desactivar" : "activar"}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: 16,
        background: "var(--color-surface-2)",
        borderRadius: "var(--radius-md)",
        textAlign: "left",
        cursor: "none",
      }}
    >
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600 }}>
          {label}
        </div>
        {description && (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--color-text-muted)",
              marginTop: 4,
            }}
          >
            {description}
          </div>
        )}
      </div>
      <div
        style={{
          position: "relative",
          width: 40,
          height: 22,
          borderRadius: 11,
          background: checked ? "var(--color-accent)" : "var(--color-surface-3)",
          transition: "background 120ms",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 20 : 2,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: checked ? "var(--color-text-inverse)" : "var(--color-text-secondary)",
            transition: "left 120ms",
          }}
        />
      </div>
    </button>
  );
}
