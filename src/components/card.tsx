import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View, type ViewProps } from 'react-native';

import { color, radius } from '@/theme';

/** Frosted glass card. Falls back to a solid tint where blur is costly. */
export function Card({ style, children, strong, ...rest }: ViewProps & { strong?: boolean }) {
  return (
    <View {...rest} style={[styles.card, strong && styles.strong, style]}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.lineStrong,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(21,21,42,0.55)' : 'rgba(24,24,46,0.88)',
    overflow: 'hidden',
    padding: 18,
  },
  strong: { backgroundColor: 'rgba(30,30,56,0.94)' },
});
