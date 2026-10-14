const paths = {
  home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
  leaf: "M20 4C8 2 2 8 5 15s15 5 15-11ZM4 21 15 10",
  farm: "M3 21V10l9-7 9 7v11M1 21h22M9 21v-7h6v7M10 8h4",
  market: "M3 10v11h18V10M2 10l2-7h16l2 7M2 10c0 4 5 4 5 0 0 4 5 4 5 0 0 4 5 4 5 0 0 4 5 4 5 0M9 21v-6h6v6",
  tag: "M3 3h8l10 10-8 8L3 11ZM7 7h.01",
  basket: "M3 9h18l-2 11H5ZM8 9l4-7 4 7M9 13v3m6-3v3",
  orders: "M6 3h12v18l-3-2-3 2-3-2-3 2ZM9 7h6M9 11h6M9 15h3",
  user: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2",
  search: "M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-1.5 4.5L21 21",
  pin: "M19 9c0 6-7 12-7 12S5 15 5 9a7 7 0 1 1 14 0ZM14 9a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  plus: "M12 5v14M5 12h14",
  check: "m5 12 4 4L19 6",
  sun: "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1",
  clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2",
} as const;

export type IconName = keyof typeof paths;
export default function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return <svg className={`hatti-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d={paths[name]} />
  </svg>;
}
