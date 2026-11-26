import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { color, font, radius } from '@/theme';
import { Tap } from './pressable';
import { Body } from './text';

const ICONS: Record<string, (c: string) => React.ReactNode> = {
  index: (c) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3a3.5 3.5 0 0 0-3.5 3.5v5a3.5 3.5 0 0 0 7 0v-5A3.5 3.5 0 0 0 12 3Z" fill={c} />
      <Path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" stroke={c} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  ),
  learn: (c) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M12 4 2.5 9 12 14l9.5-5L12 4Z" fill={c} />
      <Path d="M6 11.5V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.5" stroke={c} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  ),
  phrases: (c) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4-7 4V4.5a1 1 0 0 1 1-1Z" fill={c} />
    </Svg>
  ),
  you: (c) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 20.5c.8-3.6 4-5.5 8-5.5s7.2 1.9 8 5.5" stroke={c} strokeWidth={2} strokeLinecap="round" fill="none" />
    </Svg>
  ),
};

/** A floating glass pill instead of a stock tab bar. */
export function TabBar({ state, descriptors, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.outer, { paddingBottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      <View style={styles.bar} accessibilityRole="tablist">
        {Platform.OS === 'ios' ? <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} /> : null}
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const { options } = descriptors[route.key];
          const label = (options.title ?? route.name) as string;
          const tint = focused ? color.ink : color.textDim;
          return (
            <Tap
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              onPress={() => {
                if (!focused) navigateToTab(route.key);
              }}
              style={[styles.item, focused && styles.itemActive]}
            >
              {ICONS[route.name]?.(tint)}
              {focused ? <Body style={styles.label}>{label}</Body> : null}
            </Tap>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  bar: {
    flexDirection: 'row',
    gap: 4,
    padding: 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'ios' ? 'rgba(21,21,42,0.6)' : 'rgba(21,21,42,0.96)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.lineStrong,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 52, minWidth: 56, paddingHorizontal: 16, borderRadius: radius.pill, justifyContent: 'center' },
  itemActive: { backgroundColor: color.text },
  label: { fontFamily: font.bodyHeavy, fontSize: 14, color: color.ink },
});
