import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { lang } from '@/lib/languages';
import { color, radius, touch } from '@/theme';
import { LanguagePicker } from './language-picker';
import { Tap } from './pressable';
import { Body, Label } from './text';

type Props = { mine: string; theirs: string; onChange: (mine: string, theirs: string) => void };

export function LanguageBar({ mine, theirs, onChange }: Props) {
  const [picking, setPicking] = useState<'mine' | 'theirs' | null>(null);
  const turn = useSharedValue(0);
  const swapStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value * 180}deg` }] }));

  return (
    <View style={styles.bar}>
      <Pill label="I speak" code={mine} onPress={() => setPicking('mine')} />
      <Tap
        onPress={() => {
          turn.set(withSpring(turn.value + 1, { damping: 14 }));
          onChange(theirs, mine);
        }}
        accessibilityLabel="Swap languages"
        style={styles.swap}
      >
        <Animated.View style={swapStyle}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path d="M7 7h12l-3-3M17 17H5l3 3" stroke={color.text} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Animated.View>
      </Tap>
      <Pill label="They speak" code={theirs} onPress={() => setPicking('theirs')} align="right" />
      <LanguagePicker
        visible={picking !== null}
        title={picking === 'mine' ? 'I speak' : 'They speak'}
        selected={picking === 'mine' ? mine : theirs}
        exclude={picking === 'mine' ? theirs : mine}
        onPick={(code) => (picking === 'mine' ? onChange(code, theirs) : onChange(mine, code))}
        onClose={() => setPicking(null)}
      />
    </View>
  );
}

function Pill({ label, code, onPress, align }: { label: string; code: string; onPress: () => void; align?: 'right' }) {
  const l = lang(code);
  return (
    <Tap
      onPress={onPress}
      accessibilityLabel={`${label}: ${l.name}. Change language`}
      style={[styles.pill, align === 'right' && { alignItems: 'flex-end' }]}
    >
      <Label>{label}</Label>
      <View style={styles.pillRow}>
        <Body size={20}>{l.flag}</Body>
        <Body bold size={17} numberOfLines={1} style={{ flexShrink: 1 }}>
          {l.name}
        </Body>
      </View>
    </Tap>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 6,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(21,21,42,0.75)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.lineStrong,
  },
  pill: { flex: 1, minHeight: 60, justifyContent: 'center', paddingHorizontal: 14, borderRadius: radius.lg, gap: 2 },
  pillRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  swap: {
    width: touch,
    height: touch,
    borderRadius: touch / 2,
    backgroundColor: color.surfaceHi,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.lineStrong,
  },
});
