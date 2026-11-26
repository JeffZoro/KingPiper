/**
 * Piper design tokens.
 *
 * The identity: "sound as light". A deep night-ink canvas, with an aurora of
 * warm coral, saffron, lagoon teal and iris violet that glows wherever a voice
 * is heard. Display type is Fraunces (a soft, characterful serif); body type
 * is Manrope (a clean, humanist sans).
 *
 * All text/background pairs below meet WCAG 2.1 AA contrast (4.5:1 for body,
 * 3:1 for large text) against `ink` and `surface`.
 */
export const color = {
  ink: '#0A0A14', // app background
  inkDeep: '#06060D',
  surface: '#15152A', // cards
  surfaceHi: '#1E1E38', // raised cards, inputs
  line: 'rgba(255,255,255,0.08)',
  lineStrong: 'rgba(255,255,255,0.16)',

  text: '#F7F4EE', // 17.6:1 on ink
  textDim: '#B9B6C9', // 9.6:1 on ink
  textFaint: '#8C89A3', // 5.6:1 on ink

  coral: '#FF6B5B',
  saffron: '#FFB547',
  lagoon: '#2EC4B6',
  iris: '#8B73FF',
  rose: '#FF8FB1',

  success: '#4ADE9B',
  danger: '#FF6B6B',
} as const;

export const gradient = {
  aurora: [color.coral, color.saffron] as const,
  lagoon: [color.lagoon, color.iris] as const,
  dusk: [color.iris, color.coral] as const,
  orb: [color.coral, color.rose, color.iris] as const,
};

export const font = {
  display: 'Fraunces_600SemiBold',
  displayItalic: 'Fraunces_400Regular_Italic',
  displayLight: 'Fraunces_300Light',
  body: 'Manrope_500Medium',
  bodyBold: 'Manrope_700Bold',
  bodyHeavy: 'Manrope_800ExtraBold',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;
export const radius = { sm: 10, md: 16, lg: 24, xl: 32, pill: 999 } as const;

/** Minimum touch target (Apple HIG 44pt, Material 48dp). We use 48. */
export const touch = 48;

export const maxWidth = 560;
