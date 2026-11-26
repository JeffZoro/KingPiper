import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { lang } from '@/lib/languages';
import type { Turn } from '@/lib/store';
import { color, radius, touch } from '@/theme';
import { Tap } from './pressable';
import { Accent, Body, Label } from './text';

type Props = {
  turn: Turn;
  saved: boolean;
  onReplay: () => void;
  onSave: () => void;
  big?: boolean;
};

export function TurnCard({ turn, saved, onReplay, onSave, big }: Props) {
  const from = lang(turn.sourceLang);
  const to = lang(turn.targetLang);
  const mine = turn.spoken === 'me';
  const accent = mine ? color.coral : color.lagoon;
  return (
    <Animated.View
      entering={FadeInDown.springify().damping(16)}
      style={[styles.card, big && styles.big, { borderLeftColor: accent }]}
      accessible
      accessibilityLabel={`${from.name}: ${turn.original}. ${to.name}: ${turn.translation}`}
    >
      <View style={styles.head}>
        <Label tint={accent}>
          {mine ? 'You said' : 'They said'} · {from.flag} → {to.flag}
        </Label>
      </View>
      <Accent size={big ? 30 : 23} style={{ marginTop: 6 }} selectable>
        {turn.translation}
      </Accent>
      {turn.romanization ? (
        <Body dim size={15} style={{ marginTop: 4 }} selectable>
          {turn.romanization}
        </Body>
      ) : null}
      <Body faint size={14} style={{ marginTop: 10 }} selectable>
        {turn.original}
      </Body>
      <View style={styles.actions}>
        <Tap onPress={onReplay} accessibilityLabel={`Play again in ${to.name}`} style={styles.action}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M4 9v6h4l5 4V5L8 9H4Z" fill={color.text} />
            <Path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" stroke={color.text} strokeWidth={1.8} strokeLinecap="round" />
          </Svg>
        </Tap>
        <Tap
          onPress={onSave}
          accessibilityLabel={saved ? 'Remove from saved phrases' : 'Save phrase'}
          accessibilityState={{ selected: saved }}
          style={styles.action}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill={saved ? color.saffron : 'none'}>
            <Path
              d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"
              stroke={saved ? color.saffron : color.text}
              strokeWidth={1.7}
              strokeLinejoin="round"
            />
          </Svg>
        </Tap>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(24,24,46,0.86)',
    borderRadius: radius.lg,
    padding: 18,
    paddingBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.lineStrong,
    borderLeftWidth: 3,
  },
  big: { padding: 22, paddingBottom: 12 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 4, marginTop: 4 },
  action: { width: touch, height: touch, alignItems: 'center', justifyContent: 'center', borderRadius: touch / 2 },
});
