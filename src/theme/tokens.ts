/**
 * "Midnight Aurora" design tokens. The MUI theme and the board's CSS both read from here:
 * the values are exposed to plain CSS as custom properties (see `cssVariables` below).
 */
export const tokens = {
  bg: '#05070F',
  bgRaised: '#0A0E1C',
  surface: '#0E1326',
  surfaceHigh: '#151C36',
  line: 'rgba(148, 163, 209, 0.12)',
  lineStrong: 'rgba(148, 163, 209, 0.24)',

  text: '#E8ECF8',
  textMuted: '#98A2C0',
  textDim: '#5F6989',

  primary: '#2EE6D6',
  secondary: '#8B7BFF',
  accent: '#6FA8FF',

  cell: '#0B1021',
  gridLine: '#141A30',
  wall: '#B4C0DD',
  start: '#3DDC97',
  target: '#FF5C8A',
  bomb: '#FFB547',
  weight: '#B69CFF',
  visited: '#113D4F',
  visitedBomb: '#4E1F5E',
  path: '#FFE45C',
} as const;

export const gradients = {
  brand: 'linear-gradient(135deg, #2EE6D6 0%, #6FA8FF 55%, #8B7BFF 100%)',
  brandSoft: 'linear-gradient(135deg, rgba(46,230,214,0.16) 0%, rgba(139,123,255,0.16) 100%)',
} as const;

export const fonts = {
  body: '"Inter Variable", "Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
  display: '"Space Grotesk Variable", "Space Grotesk", "Inter Variable", system-ui, sans-serif',
  mono: '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, "SFMono-Regular", monospace',
} as const;

const svg = (body: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>${body}</svg>`,
  )}")`;

/** Node glyphs, used as CSS masks so they can be tinted with any colour. */
export const nodeIcons = {
  start: svg(`<path d='M6.5 4.2 19.5 12 6.5 19.8 9.4 12z'/>`),
  target: svg(
    `<path fill-rule='evenodd' d='M12 2a10 10 0 1 1 0 20a10 10 0 0 1 0-20zm0 3a7 7 0 1 0 0 14a7 7 0 0 0 0-14zm0 3a4 4 0 1 1 0 8a4 4 0 0 1 0-8z'/>`,
  ),
  bomb: svg(
    `<circle cx='10.5' cy='14' r='7.5'/><path d='M14.6 7.6l2-2 1.8 1.8-2 2z'/><path d='M19.4 1.6l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z'/>`,
  ),
  weight: svg(
    `<path d='M8.5 3h7a3 3 0 0 1 3 3v3.2h-2.2V6.2a1 1 0 0 0-1-1h-6.6a1 1 0 0 0-1 1v3h-2.2V6a3 3 0 0 1 3-3z'/><circle cx='12' cy='14.6' r='6.4'/>`,
  ),
} as const;

/** Custom properties consumed by `board.css`. */
export const cssVariables: Record<string, string> = {
  '--c-bg': tokens.bg,
  '--c-surface': tokens.surface,
  '--c-line': tokens.line,
  '--c-line-strong': tokens.lineStrong,
  '--c-text': tokens.text,
  '--c-muted': tokens.textMuted,
  '--c-primary': tokens.primary,
  '--c-secondary': tokens.secondary,
  '--c-cell': tokens.cell,
  '--c-grid': tokens.gridLine,
  '--c-wall': tokens.wall,
  '--c-start': tokens.start,
  '--c-target': tokens.target,
  '--c-bomb': tokens.bomb,
  '--c-weight': tokens.weight,
  '--c-visited': tokens.visited,
  '--c-visited-bomb': tokens.visitedBomb,
  '--c-path': tokens.path,
  '--font-mono': fonts.mono,
  '--font-display': fonts.display,
  '--icon-start': nodeIcons.start,
  '--icon-target': nodeIcons.target,
  '--icon-bomb': nodeIcons.bomb,
  '--icon-weight': nodeIcons.weight,
};
