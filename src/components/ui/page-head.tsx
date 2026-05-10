interface PageHeadProps {
  eyebrow?: string;
  title: string;
  /** Use {ap} placeholder to insert the accent dot/character. */
  ap?: string;
  sub?: string;
  actions?: React.ReactNode;
}

export function PageHead({ eyebrow, title, ap = ".", sub, actions }: PageHeadProps) {
  return (
    <div className="page-head">
      <div className="row-action">
        <div>
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 className="page-title">
            {title}
            <span className="ap">{ap}</span>
          </h1>
          {sub && <p className="page-sub">{sub}</p>}
        </div>
        {actions && <div className="flex-row">{actions}</div>}
      </div>
    </div>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="page-eyebrow">{children}</div>;
}
