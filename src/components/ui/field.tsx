interface FieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
}

export function Field({ label, children, hint }: FieldProps) {
  return (
    <div className="field">
      <label>— {label}</label>
      {children}
      {hint && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--color-text-muted)",
            letterSpacing: "var(--tracking-wide)",
          }}
        >
          {hint}
        </span>
      )}
    </div>
  );
}
