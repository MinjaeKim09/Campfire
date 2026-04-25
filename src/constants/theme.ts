export const campfireTheme = {
  colors: {
    background: '#FFF8F2',
    backgroundDeep: '#1F1428',
    card: '#FFFFFF',
    cardMuted: '#FFF0E2',
    lavender: '#B9A7FF',
    lavenderDeep: '#6B4EFF',
    neonPink: '#FF4FD8',
    hotPink: '#FF2E88',
    emberRed: '#FF4B3E',
    emberOrange: '#FF8A1F',
    emberYellow: '#FFD33D',
    ink: '#19131F',
    mutedInk: '#6F6177',
    black: '#0F0D12',
    border: '#F1DFD0',
  },
  radius: {
    card: 28,
    pill: 999,
  },
  spacing: {
    screen: 20,
  },
} as const;

export const heatScale = [
  {
    label: 'Hot pick',
    color: campfireTheme.colors.emberRed,
    description: 'High activity and strong student buzz.',
  },
  {
    label: 'Warming up',
    color: campfireTheme.colors.emberOrange,
    description: 'A thread or school section is gaining momentum.',
  },
  {
    label: 'Cozy',
    color: campfireTheme.colors.emberYellow,
    description: 'Useful, friendly, and worth saving.',
  },
] as const;
