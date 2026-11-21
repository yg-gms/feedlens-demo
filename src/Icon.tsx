import React from 'react'
const paths: Record<string, React.ReactNode> = {
  science: <><path d="M8 3h8m-6 0v6l-6 9q-1 2 2 2h12q3 0 2-2l-6-9V3M7 15h10"/><path d="M11 17h.01"/></>,
  lifestyle: <><path d="M5 20c0-8 5-13 13-16m1 0c1 10-3 15-11 13C3 9 9 4 19 4Z"/></>,
  entertainment: <><rect x="3" y="8" width="18" height="12" rx="2"/><path d="m3 9-1-5 18-3 1 5-18 3m6-6 3 4m3-5 3 4m-8 6 4 2-4 2Z"/></>,
  dislike: <path d="M10 14v4c0 3 3 3 4 1l3-6V4H7L4 12q-1 2 2 2h4Zm7-10h4v9h-4"/>,
  scan: <><path d="M3 8V4h5m8 0h5v4M3 16v4h5m8 0h5v-4M5 12q7-9 14 0-7 9-14 0Z"/><circle cx="12" cy="12" r="2"/></>,
  feed: <><rect x="4" y="4" width="16" height="16" rx="4"/><path d="m10 8 6 4-6 4Z"/></>,
  reset: <><path d="M3 10a9 9 0 1 1 1 8M3 4v6h6"/></>,
  help: <><circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 5 2c-1 1-2 1-2 3m0 3h.01"/></>,
  heart: <path d="M20 5c-3-2-6-1-8 2-2-3-5-4-8-2-5 4-1 9 8 16 9-7 13-12 8-16Z"/>,
  skip: <><path d="m4 5 12 7-12 7ZM20 5v14"/></>,
  play: <path d="m7 4 13 8-13 8Z"/>, pause: <><path d="M8 5v14m8-14v14" strokeWidth="4"/></>,
  eye: <><path d="M2 12q10-15 20 0-10 15-20 0Z"/><circle cx="12" cy="12" r="3"/></>,
  sliders: <><path d="M3 7h6m5 0h7M3 17h10m5 0h3"/><circle cx="11.5" cy="7" r="2.5"/><circle cx="15.5" cy="17" r="2.5"/></>,
  signal: <><path d="M4 18v-5m5 5V9m5 9V5m5 13v-8"/></>,
  gaming: <><path d="M7 7h10c3 0 4 4 5 9 0 3-2 4-4 2l-3-3H9l-3 3c-2 2-4 1-4-2 1-5 2-9 5-9Z"/><path d="M6 11h4m-2-2v4m8-1h.01m3-2h.01"/></>,
  music: <><path d="M9 17V6l11-2v11M9 9l11-2"/><ellipse cx="6" cy="17.5" rx="3" ry="2.5"/><ellipse cx="17" cy="15.5" rx="3" ry="2.5"/></>,
  sports: <><circle cx="12" cy="12" r="9"/><path d="m5 5 14 14M5 19 19 5M3 10q9 1 11 11M10 3q1 9 11 11"/></>,
  tech: <><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 3v3m6-3v3M9 18v3m6-3v3M3 9h3m-3 6h3m12-6h3m-3 6h3"/></>,
  food: <><path d="M4 3v5q3 5 6 0V3M7 3v18m12 0V3q-6 4-5 10h5"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/></>,
  chevron: <path d="m6 9 6 6 6-6"/>, close: <path d="m6 6 12 12M6 18 18 6"/>,
  queue: <><path d="M3 5h16M3 10h12M3 15h7m5-2 6 4-6 4Z"/></>,
  spark: <path d="m12 2 2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4Z"/>,
  wave: <path d="M2 12h5l3-7 4 14 3-7h5"/>,
}
export function Icon({name, size=20}: {name: string; size?: number}) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}
