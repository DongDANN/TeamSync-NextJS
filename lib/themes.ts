/* ──────────────────────────────────────────────
   Theme system — ported from Odysseus by PewDiePie
   16 preset themes with 5 color slots each
   ────────────────────────────────────────────── */

export type ThemeId =
  | 'ts'
  | 'dark'
  | 'light'
  | 'midnight'
  | 'paper'
  | 'cyberpunk'
  | 'retrowave'
  | 'forest'
  | 'ocean'
  | 'ume'
  | 'copper'
  | 'terminal'
  | 'organs'
  | 'lavender'
  | 'gpt'
  | 'claude'
  | 'cute'

export type ThemeConfig = {
  id: ThemeId
  label: string
  bg: string
  fg: string
  panel: string
  border: string
  accent: string
  pattern?: string
  effectColor?: string
  effectIntensity?: number
  frosted?: boolean
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  ts: {
    id: 'ts',
    label: 'TS',
    bg: '#fafafa',
    fg: '#111111',
    panel: '#ffffff',
    border: '#000000',
    accent: '#000000',
  },
  dark: {
    id: 'dark',
    label: 'Dark',
    bg: '#282c34',
    fg: '#9cdef2',
    panel: '#111111',
    border: '#355a66',
    accent: '#e06c75',
  },
  light: {
    id: 'light',
    label: 'Light',
    bg: '#f0ebe3',
    fg: '#5a5248',
    panel: '#faf6f0',
    border: '#d4cdc2',
    accent: '#c47d5a',
  },
  midnight: {
    id: 'midnight',
    label: 'Midnight',
    bg: '#0d1117',
    fg: '#c9d1d9',
    panel: '#161b22',
    border: '#30363d',
    accent: '#f85149',
    effectColor: '#ffffff',
    effectIntensity: 0.5,
  },
  paper: {
    id: 'paper',
    label: 'Paper',
    bg: '#faf8f5',
    fg: '#3b3836',
    panel: '#ffffff',
    border: '#d5d0c8',
    accent: '#c5ac4a',
  },
  cyberpunk: {
    id: 'cyberpunk',
    label: 'Cyberpunk',
    bg: '#0a0a0f',
    fg: '#0ff0fc',
    panel: '#12101a',
    border: '#9b30ff',
    accent: '#e040fb',
    pattern: 'synapse',
  },
  retrowave: {
    id: 'retrowave',
    label: 'Retrowave',
    bg: '#1a1a2e',
    fg: '#e94560',
    panel: '#16213e',
    border: '#533483',
    accent: '#e94560',
    pattern: 'embers',
  },
  forest: {
    id: 'forest',
    label: 'Forest',
    bg: '#1b2a1b',
    fg: '#a8d5a2',
    panel: '#142414',
    border: '#3d6b3d',
    accent: '#7cb871',
    pattern: 'petals',
  },
  ocean: {
    id: 'ocean',
    label: 'Ocean',
    bg: '#0b1a2c',
    fg: '#64d2ff',
    panel: '#091422',
    border: '#1e5074',
    accent: '#4facfe',
    pattern: 'constellations',
  },
  ume: {
    id: 'ume',
    label: 'Ume',
    bg: '#2b1b2e',
    fg: '#f5c2e7',
    panel: '#1e1420',
    border: '#6c4675',
    accent: '#f5a0c0',
    pattern: 'petals',
    effectColor: '#f5a0c0',
  },
  copper: {
    id: 'copper',
    label: 'Copper',
    bg: '#1c1410',
    fg: '#e8c39e',
    panel: '#140f0a',
    border: '#7a5533',
    accent: '#d4764e',
  },
  terminal: {
    id: 'terminal',
    label: 'Terminal',
    bg: '#000000',
    fg: '#00ff41',
    panel: '#0a0a0a',
    border: '#003b00',
    accent: '#00ff41',
    effectIntensity: 0.8,
  },
  organs: {
    id: 'organs',
    label: 'Organs',
    bg: '#0a0406',
    fg: '#efe1c8',
    panel: '#15080a',
    border: '#3a1519',
    accent: '#c83240',
    effectColor: '#451616',
    effectIntensity: 0.65,
  },
  lavender: {
    id: 'lavender',
    label: 'Lavender',
    bg: '#f3eef8',
    fg: '#3d3551',
    panel: '#faf7ff',
    border: '#cec3de',
    accent: '#9b6dcc',
    frosted: true,
  },
  gpt: {
    id: 'gpt',
    label: 'GPT',
    bg: '#212121',
    fg: '#ececec',
    panel: '#171717',
    border: '#424242',
    accent: '#949494',
  },
  claude: {
    id: 'claude',
    label: 'Claude',
    bg: '#262624',
    fg: '#f5f4f0',
    panel: '#30302e',
    border: '#4a4a47',
    accent: '#c6613f',
  },
  cute: {
    id: 'cute',
    label: 'Cute',
    bg: '#fff0f5',
    fg: '#d4608a',
    panel: '#fff8fa',
    border: '#f0c0d0',
    accent: '#ff6b9d',
    pattern: 'sparkles',
    effectColor: '#ff8cb8',
  },
}

export const THEME_LIST: ThemeConfig[] = Object.values(THEMES)

export const DEFAULT_THEME: ThemeId = 'ts'
