import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { color, font, gradient, radius, touch } from '@/theme';
import { Tap } from './pressable';
import { Body } from './text';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'quiet';
  disabled?: boolean;
  busy?: boolean;
  icon?: string;
  accessibilityHint?: string;
  colors?: readonly [string, string, ...string[]];
};

export function Button({ label, onPress, variant = 'primary', disabled, busy, icon, accessibilityHint, colors }: Props) {
  const inactive = disabled || busy;
  return (
    <Tap
      onPress={onPress}
      disabled={inactive}
      haptic="medium"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!busy }}
      style={[
        styles.base,
        (variant !== 'primary' || disabled) && styles.ghost,
        variant === 'quiet' && styles.quiet,
        inactive && { opacity: disabled ? 0.6 : 0.8 },
      ]}
    >
      {variant === 'primary' && !disabled ? (
        <LinearGradient colors={colors ?? gradient.aurora} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      ) : null}
      <View style={styles.row}>
        {busy ? <ActivityIndicator color={variant === 'primary' && !disabled ? color.ink : color.text} /> : null}
        {!busy && icon ? <Body size={18}>{icon}</Body> : null}
        <Body style={[styles.label, { color: variant === 'primary' && !disabled ? color.ink : disabled ? color.textFaint : color.text }]}>{label}</Body>
      </View>
    </Tap>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touch + 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
  },
  ghost: { backgroundColor: color.surfaceHi, borderWidth: StyleSheet.hairlineWidth, borderColor: color.lineStrong },
  quiet: { backgroundColor: 'transparent', borderWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { fontFamily: font.bodyHeavy, fontSize: 16.5, letterSpacing: 0.2 },
});
