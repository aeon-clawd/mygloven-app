interface MarqueeProps {
  items?: string[];
}

const DEFAULT_ITEMS = [
  "my'G — sistema operativo de eventos",
  "v2.0 — industrial brutalist",
  "España · Portugal · Europa",
  "Mover el ratón para ver el cursor custom",
];

export function Marquee({ items = DEFAULT_ITEMS }: MarqueeProps) {
  const doubled = [...items, ...items];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {doubled.map((s, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 32 }}>
            <span>{s}</span>
            <span>★</span>
          </span>
        ))}
      </div>
    </div>
  );
}
