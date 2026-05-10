"use client";

interface ChipOption {
  value: string;
  label: string;
}

interface ChipsProps {
  options: ChipOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multiple?: boolean;
}

export function Chips({ options, selected, onChange, multiple = true }: ChipsProps) {
  function toggle(value: string) {
    if (multiple) {
      onChange(
        selected.includes(value)
          ? selected.filter((v) => v !== value)
          : [...selected, value]
      );
    } else {
      onChange(selected.includes(value) ? [] : [value]);
    }
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {options.map((opt) => {
        const isSelected = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            data-cursor="seleccionar"
            className={`pill${isSelected ? " accent" : ""}`}
            style={{
              cursor: "none",
              fontSize: 11,
              padding: "7px 12px",
              letterSpacing: "0.18em",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
