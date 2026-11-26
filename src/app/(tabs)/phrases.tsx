import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Button } from '@/components/button';
import { Tap } from '@/components/pressable';
import { Screen } from '@/components/screen';
import { Accent, Body, Display, Label } from '@/components/text';
import { TurnCard } from '@/components/turn-card';
import { allWords, course as getCourse } from '@/content';
import { useStore } from '@/lib/store';
import { speak } from '@/lib/voice-out';
import { color, radius } from '@/theme';

export default function Phrases() {
  const [tab, setTab] = useState<'saved' | 'deck'>('saved');
  return (
    <Screen tone="cool">
      <Display size={36}>Phrases</Display>
      <View style={styles.segment} accessibilityRole="tablist">
        {(
          [
            ['saved', 'Saved'],
            ['deck', 'Word deck'],
          ] as const
        ).map(([k, label]) => (
          <Tap
            key={k}
            onPress={() => setTab(k)}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === k }}
            style={[styles.segBtn, tab === k && styles.segOn]}
          >
            <Body bold size={14} tint={tab === k ? color.ink : color.textDim}>
              {label}
            </Body>
          </Tap>
        ))}
      </View>
      {tab === 'saved' ? <Saved /> : <Deck />}
    </Screen>
  );
}

function Saved() {
  const { state, toggleSaved } = useStore();
  if (state.saved.length === 0) {
    return (
      <Animated.View entering={FadeIn} style={styles.empty}>
        <Body size={44}>☆</Body>
        <Accent size={22} center style={{ marginTop: 10 }}>
          Nothing saved yet
        </Accent>
        <Body faint center style={{ marginTop: 6 }}>
          Tap the star on any translation to keep it here, ready to replay.
        </Body>
      </Animated.View>
    );
  }
  return (
    <View style={{ gap: 12 }}>
      {state.saved.map((t) => (
        <TurnCard key={t.id} turn={t} saved onReplay={() => speak(t.translation, t.targetLang, state.gender)} onSave={() => toggleSaved(t)} />
      ))}
    </View>
  );
}

function Deck() {
  const { state, update } = useStore();
  const c = getCourse(state.learn.course);
  const learned = new Set(state.learn.completed);
  // Only words from lessons you've done, so the deck is review, not a quiz.
  const words = useMemo(() => {
    const all = allWords(c);
    const fromDone = all.filter((w) => learned.has(w.lessonId));
    return fromDone.length ? fromDone : all.slice(0, 6);
  }, [c, state.learn.completed]); // eslint-disable-line react-hooks/exhaustive-deps
  const queue = words.filter((w) => !state.learn.knownWords.includes(`${c.code}:${w.t}`));
  const [i, setI] = useState(0);
  const card = queue[i % Math.max(queue.length, 1)];

  if (!card) {
    return (
      <View style={styles.empty}>
        <Body size={44}>🎉</Body>
        <Accent size={22} center style={{ marginTop: 10 }}>
          You know every word so far
        </Accent>
        <View style={{ marginTop: 18, alignSelf: 'stretch' }}>
          <Button
            variant="ghost"
            label="Reset deck"
            onPress={() => update({ learn: { ...state.learn, knownWords: state.learn.knownWords.filter((k) => !k.startsWith(`${c.code}:`)) } })}
          />
        </View>
      </View>
    );
  }

  return (
    <View>
      <Label style={{ marginBottom: 12 }}>
        {queue.length} to review · {c.title}
      </Label>
      <FlipCard key={card.t} front={card.t} sub={card.r} back={card.en} onFront={() => speak(card.t, c.code, state.gender, { rate: 0.9 })} />
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
        <View style={{ flex: 1 }}>
          <Button variant="ghost" label="Again" onPress={() => setI(i + 1)} />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            label="Got it"
            onPress={() => update({ learn: { ...state.learn, knownWords: [...state.learn.knownWords, `${c.code}:${card.t}`] } })}
          />
        </View>
      </View>
    </View>
  );
}

function FlipCard({ front, sub, back, onFront }: { front: string; sub?: string; back: string; onFront: () => void }) {
  const flip = useSharedValue(0);
  const [showing, setShowing] = useState<'front' | 'back'>('front');
  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 900 }, { rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` }],
    opacity: flip.value < 0.5 ? 1 : 0,
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 900 }, { rotateY: `${interpolate(flip.value, [0, 1], [180, 360])}deg` }],
    opacity: flip.value >= 0.5 ? 1 : 0,
  }));
  return (
    <Tap
      depth={0.98}
      onPress={() => {
        const toBack = showing === 'front';
        flip.set(withTiming(toBack ? 1 : 0, { duration: 420 }));
        setShowing(toBack ? 'back' : 'front');
        if (!toBack) onFront();
      }}
      accessibilityLabel={showing === 'front' ? `${front}. Tap to see the meaning` : `${back}. Tap to flip back`}
      style={styles.flipWrap}
    >
      <Animated.View style={[styles.face, frontStyle]}>
        <Label>Tap to flip</Label>
        <Accent size={40} center style={{ marginTop: 14 }}>
          {front}
        </Accent>
        {sub ? (
          <Body dim center>
            {sub}
          </Body>
        ) : null}
      </Animated.View>
      <Animated.View style={[styles.face, styles.back, backStyle]}>
        <Label tint="rgba(10,10,20,0.6)">Means</Label>
        <Display size={34} center tint={color.ink} style={{ marginTop: 14 }}>
          {back}
        </Display>
      </Animated.View>
    </Tap>
  );
}

const styles = StyleSheet.create({
  segment: { flexDirection: 'row', padding: 5, gap: 4, borderRadius: radius.pill, backgroundColor: color.surface, marginVertical: 20, alignSelf: 'flex-start' },
  segBtn: { height: 42, paddingHorizontal: 20, borderRadius: radius.pill, justifyContent: 'center' },
  segOn: { backgroundColor: color.text },
  empty: { alignItems: 'center', paddingVertical: 50, paddingHorizontal: 20 },
  flipWrap: { height: 300 },
  face: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(24,24,46,0.92)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.lineStrong,
    backfaceVisibility: 'hidden',
  },
  back: { backgroundColor: color.lagoon },
});
