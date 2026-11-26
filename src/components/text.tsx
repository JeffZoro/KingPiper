import { Text, type TextProps } from 'react-native';

import { color, font } from '@/theme';

type Props = TextProps & { dim?: boolean; faint?: boolean; center?: boolean; tint?: string };

function base({ dim, faint, center, tint }: Props) {
  return {
    color: tint ?? (faint ? color.textFaint : dim ? color.textDim : color.text),
    textAlign: center ? ('center' as const) : undefined,
  };
}

/** Big serif headline. */
export function Display({ style, ...p }: Props & { size?: number }) {
  const size = p.size ?? 34;
  return (
    <Text
      accessibilityRole="header"
      maxFontSizeMultiplier={1.4}
      {...p}
      style={[base(p), { fontFamily: font.display, fontSize: size, lineHeight: size * 1.12, letterSpacing: -0.5 }, style]}
    />
  );
}

/** Serif italic accent, used for the wordmark and spoken phrases. */
export function Accent({ style, ...p }: Props & { size?: number }) {
  const size = p.size ?? 22;
  return (
    <Text
      maxFontSizeMultiplier={1.5}
      {...p}
      style={[base(p), { fontFamily: font.displayItalic, fontSize: size, lineHeight: size * 1.25 }, style]}
    />
  );
}

export function Body({ style, ...p }: Props & { size?: number; bold?: boolean }) {
  const size = p.size ?? 16;
  return (
    <Text
      maxFontSizeMultiplier={1.6}
      {...p}
      style={[base(p), { fontFamily: p.bold ? font.bodyBold : font.body, fontSize: size, lineHeight: size * 1.45 }, style]}
    />
  );
}

/** Small uppercase label. */
export function Label({ style, ...p }: Props) {
  return (
    <Text
      maxFontSizeMultiplier={1.4}
      {...p}
      style={[
        base({ faint: true, ...p }),
        { fontFamily: font.bodyHeavy, fontSize: 11.5, letterSpacing: 1.4, textTransform: 'uppercase' },
        style,
      ]}
    />
  );
}
