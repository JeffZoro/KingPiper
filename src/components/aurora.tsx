import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { color } from '@/theme';

/**
 * The signature backdrop: soft pools of coloured light on night ink. Pure SVG,
 * so it costs nothing to render and scales to any screen.
 */
export function Aurora({ tone = 'warm' }: { tone?: 'warm' | 'cool' | 'calm' }) {
  const [a, b, c] =
    tone === 'cool'
      ? [color.lagoon, color.iris, color.coral]
      : tone === 'calm'
        ? [color.iris, color.lagoon, color.rose]
        : [color.coral, color.iris, color.saffron];
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: color.ink }]} />
      <Svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <RadialGradient id="g1" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={a} stopOpacity="0.42" />
            <Stop offset="1" stopColor={a} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="g2" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={b} stopOpacity="0.38" />
            <Stop offset="1" stopColor={b} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="g3" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={c} stopOpacity="0.22" />
            <Stop offset="1" stopColor={c} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Ellipse cx="40" cy="70" rx="300" ry="240" fill="url(#g1)" />
        <Ellipse cx="400" cy="380" rx="280" ry="300" fill="url(#g2)" />
        <Ellipse cx="80" cy="760" rx="320" ry="220" fill="url(#g3)" />
      </Svg>
    </View>
  );
}
