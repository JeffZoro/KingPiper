import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';

import { color, gradient } from '@/theme';
import { Tap } from './pressable';
import { Body } from './text';

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';


function Ring({ delay, active, level, tint, size }: { delay: number; active: boolean; level: SharedValue<number>; tint: string; size: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    if (active) {
      t.set(0);
      t.set(withDelay(delay, withRepeat(withTiming(1, { duration: 2200, easing: Easing.out(Easing.quad) }), -1, false)));
    } else {
      cancelAnimation(t);
      t.set(withTiming(0, { duration: 300 }));
    }
  }, [active, delay, t]);
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.15, 1], [0, 0.55, 0]),
    transform: [{ scale: 1 + t.value * (0.55 + level.value * 0.5) }],
  }));
  return <Animated.View pointerEvents="none" style={[styles.ring, { borderColor: tint, width: size, height: size, borderRadius: size / 2 }, style]} />;
}

function Bars({ level }: { level: SharedValue<number> }) {
  // Five bars that dance with the microphone level.
  const weights = [0.45, 0.8, 1, 0.75, 0.5];
  return (
    <View style={styles.bars}>
      {weights.map((w, i) => (
        <Bar key={i} weight={w} index={i} level={level} />
      ))}
    </View>
  );
}

function Bar({ weight, index, level }: { weight: number; index: number; level: SharedValue<number> }) {
  const wobble = useSharedValue(0);
  useEffect(() => {
    wobble.set(withDelay(index * 90, withRepeat(withTiming(1, { duration: 420 + index * 40 }), -1, true)));
  }, [index, wobble]);
  const style = useAnimatedStyle(() => ({
    height: 12 + (18 + level.value * 46) * weight * (0.6 + wobble.value * 0.4),
  }));
  return <Animated.View style={[styles.bar, style]} />;
}

function Mic() {
  return (
    <Svg width={44} height={44} viewBox="0 0 24 24" fill="none">
      <Rect x={8.5} y={2.5} width={7} height={12} rx={3.5} fill={color.ink} />
      <Path d="M5 11a7 7 0 0 0 14 0M12 18v3.5M8.5 21.5h7" stroke={color.ink} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

type Props = {
  state: OrbState;
  /** Microphone level, 0 to 1. */
  level: SharedValue<number>;
  onPress: () => void;
  disabled?: boolean;
  size?: number;
};

/**
 * Piper's one big button. Tap to start listening, tap again to translate.
 */
export function Orb({ state, level, onPress, disabled, size = 196 }: Props) {
  const st = makeStyles(size);
  const spin = useSharedValue(0);
  const breathe = useSharedValue(0);
  const press = useSharedValue(0);

  useEffect(() => {
    breathe.set(withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [breathe]);

  useEffect(() => {
    if (state === 'thinking') {
      spin.set(0);
      spin.set(withRepeat(withTiming(1, { duration: 1400, easing: Easing.linear }), -1, false));
    } else {
      cancelAnimation(spin);
      spin.set(withTiming(0, { duration: 200 }));
    }
  }, [state, spin]);

  useEffect(() => {
    press.set(withSpring(state === 'listening' ? 1 : 0, { damping: 12, stiffness: 160 }));
  }, [state, press]);

  const coreStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: 1 + breathe.value * 0.025 + press.value * 0.04 + level.value * 0.08 },
      { rotate: `${spin.value * 360}deg` },
    ],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.18 + breathe.value * 0.1 + level.value * 0.25,
    transform: [{ scale: 1.22 + breathe.value * 0.08 + level.value * 0.25 }],
  }));

  const label =
    state === 'listening' ? 'Listening. Tap when they finish speaking.' : state === 'thinking' ? 'Translating' : state === 'speaking' ? 'Speaking the translation' : 'Tap to listen';
  const colors = state === 'listening' ? gradient.orb : state === 'speaking' ? ([color.lagoon, color.iris] as const) : ([color.coral, color.saffron, color.rose] as const);

  return (
    <View style={st.wrap}>
      <Animated.View pointerEvents="none" style={[st.glow, glowStyle]}>
        <LinearGradient colors={colors} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      </Animated.View>
      <Ring delay={0} active={state === 'listening'} level={level} tint={color.coral} size={size} />
      <Ring delay={730} active={state === 'listening'} level={level} tint={color.rose} size={size} />
      <Ring delay={1460} active={state === 'listening'} level={level} tint={color.iris} size={size} />
      <Tap
        onPress={onPress}
        disabled={disabled}
        depth={0.94}
        haptic="medium"
        accessibilityLabel={state === 'listening' ? 'Stop and translate' : 'Start listening'}
        accessibilityHint={label}
        accessibilityState={{ busy: state === 'thinking', disabled: !!disabled }}
        style={st.hit}
      >
        <Animated.View style={[st.core, coreStyle]}>
          <LinearGradient colors={colors} style={StyleSheet.absoluteFill} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} />
          <View style={st.sheen} />
        </Animated.View>
        <View style={styles.center} pointerEvents="none">
          {state === 'listening' ? <Bars level={level} /> : state === 'thinking' ? <Dots /> : <Mic />}
        </View>
      </Tap>
    </View>
  );
}

function Dots() {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {[0, 1, 2].map((i) => (
        <Dot key={i} i={i} />
      ))}
    </View>
  );
}
function Dot({ i }: { i: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withDelay(i * 160, withRepeat(withTiming(1, { duration: 480 }), -1, true)));
  }, [i, t]);
  const style = useAnimatedStyle(() => ({ opacity: 0.35 + t.value * 0.65, transform: [{ translateY: -t.value * 6 }] }));
  return <Animated.View style={[styles.dot, style]} />;
}

export function OrbCaption({ state }: { state: OrbState }) {
  const text =
    state === 'listening' ? 'Listening… tap to translate' : state === 'thinking' ? 'Translating…' : state === 'speaking' ? 'Speaking…' : 'Tap to listen';
  return (
    <Body bold center dim accessibilityLiveRegion="polite" style={{ marginTop: 4, letterSpacing: 0.3 }}>
      {text}
    </Body>
  );
}

function makeStyles(SIZE: number) {
  return StyleSheet.create({
    wrap: { width: SIZE * 1.5, height: SIZE * 1.5, alignItems: 'center', justifyContent: 'center' },
    glow: { position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2, overflow: 'hidden', opacity: 0.4 },
    hit: { width: SIZE, height: SIZE, borderRadius: SIZE / 2, alignItems: 'center', justifyContent: 'center' },
    core: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: SIZE / 2, overflow: 'hidden' },
    sheen: {
      position: 'absolute',
      top: SIZE * 0.07,
      left: SIZE * 0.15,
      width: SIZE * 0.55,
      height: SIZE * 0.3,
      borderRadius: SIZE,
      backgroundColor: 'rgba(255,255,255,0.22)',
      transform: [{ rotate: '-18deg' }],
    },
  });
}

const styles = StyleSheet.create({
  ring: { position: 'absolute', borderWidth: 2 },
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  bars: { flexDirection: 'row', alignItems: 'center', gap: 7, height: 80 },
  bar: { width: 8, borderRadius: 4, backgroundColor: color.ink },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: color.ink },
});
