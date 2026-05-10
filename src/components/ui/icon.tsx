/* my'G v2 — icon set (single-stroke SVGs) */

type IconProps = { size?: number };

const base = (size = 14, sw = 2) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: sw,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const Icon = {
  arrow: ({ size }: IconProps = {}) => (
    <svg {...base(size)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  arrowSmall: ({ size = 11 }: IconProps = {}) => (
    <svg {...base(size, 2.5)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  arrowLeft: ({ size }: IconProps = {}) => (
    <svg {...base(size)}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  ),
  arrowUpRight: ({ size = 12 }: IconProps = {}) => (
    <svg {...base(size)}>
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  ),
  plus: ({ size }: IconProps = {}) => (
    <svg {...base(size)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  search: ({ size }: IconProps = {}) => (
    <svg {...base(size)}>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  ),
  check: ({ size }: IconProps = {}) => (
    <svg {...base(size, 2.5)}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  x: ({ size }: IconProps = {}) => (
    <svg {...base(size)}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  send: ({ size }: IconProps = {}) => (
    <svg {...base(size)}>
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  ),
  ext: ({ size = 12 }: IconProps = {}) => (
    <svg {...base(size)}>
      <path d="M15 3h6v6M14 10l7-7M19 14v7H5V5h7" />
    </svg>
  ),
  filter: ({ size }: IconProps = {}) => (
    <svg {...base(size)}>
      <path d="M3 4h18M7 12h10M11 20h2" />
    </svg>
  ),
  logout: ({ size }: IconProps = {}) => (
    <svg {...base(size)}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
  trash: ({ size }: IconProps = {}) => (
    <svg {...base(size)}>
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    </svg>
  ),
  edit: ({ size }: IconProps = {}) => (
    <svg {...base(size)}>
      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  ),
  google: ({ size = 14 }: IconProps = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="currentColor"
        opacity=".7"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        opacity=".5"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        opacity=".85"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  ),
};
