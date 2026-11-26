import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder } from 'expo-audio';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, SlideInDown, useAnimatedStyle, useSharedValue, withSpring, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Aurora } from '@/components/aurora';
import { Button } from '@/components/button';
import { Tap } from '@/components/pressable';
import { Accent, Body, Display, Label } from '@/components/text';
import { buildExercises, findLesson, tilesOf, type Exercise, type Word } from '@/content';
import { health, transcribeAudio } from '@/lib/api';
import { similarity } from '@/lib/similarity';
import { useStore } from '@/lib/store';
import { speak, stopSpeaking } from '@/lib/voice-out';
import { color, maxWidth, radius, touch } from '@/theme';

type Verdict = { ok: boolean; answer?: string } | null;

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const found = findLesson(id ?? '');
  const { state, awardXp } = useStore();
  const insets = useSafeAreaInsets();
  // A repeat of a finished lesson gets a fresh shuffle; a first attempt is always the same.
  const [attempt] = useState(() => (found && state.learn.completed.includes(found.lesson.id) ? Date.now() : 0));
  const target = found?.lesson;
  const exercises = useMemo(() => (target ? buildExercises(target, attempt) : []), [target, attempt]);
  const [i, setI] = useState(0);
  const [verdict, setVerdict] = useState<Verdict>(null);
  const [right, setRight] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => () => void stopSpeaking(), []);

  if (!found) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 40, alignItems: 'center' }]}>
        <Aurora />
        <Body>That lesson doesn’t exist.</Body>
        <Button label="Back" onPress={() => router.back()} />
      </View>
    );
  }
  const { course, lesson } = found;
  const ex = exercises[i];
  const say = (t: string, rate = 0.9) => speak(t, course.code, state.gender, { rate });

  const judge = (ok: boolean, answer?: string) => {
    setVerdict({ ok, answer });
    if (ok) setRight((r) => r + 1);
  };
  const next = () => {
    setVerdict(null);
    if (i + 1 >= exercises.length) {
      const xp = 10 + right * 2;
      awardXp(xp, lesson.id);
      setFinished(true);
    } else setI(i + 1);
  };

  if (finished) {
    const xp = 10 + right * 2;
    return (
      <View style={[styles.root, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 24 }]}>
        <Aurora tone="cool" />
        <View style={styles.column}>
          <Animated.View entering={ZoomIn.springify()} style={{ alignItems: 'center' }}>
            <Body size={72}>{lesson.icon}</Body>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(150)}>
            <Display center size={38} style={{ marginTop: 16 }}>
              Lesson complete
            </Display>
            <Body dim center style={{ marginTop: 8 }}>
              {lesson.title} · {right} of {exercises.length} right first time
            </Body>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(300)} style={styles.reward}>
            <Display size={44} tint={color.saffron}>
              +{xp}
            </Display>
            <Label>XP earned</Label>
          </Animated.View>
          <View style={{ flex: 1 }} />
          <Button label="Continue" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <Aurora tone="calm" />
      <View style={[styles.column, { flex: 1 }]}>
        <View style={styles.top}>
          <Tap onPress={() => router.back()} accessibilityLabel="Close lesson" style={styles.closeBtn}>
            <Svg width={22} height={22} viewBox="0 0 24 24">
              <Path d="M6 6l12 12M18 6 6 18" stroke={color.text} strokeWidth={2.2} strokeLinecap="round" />
            </Svg>
          </Tap>
          <Progress value={(i + (verdict ? 1 : 0)) / exercises.length} />
        </View>

        <Animated.View key={i} entering={FadeIn.duration(260)} style={{ flex: 1 }}>
          {ex.kind === 'choose' && <Choose ex={ex} say={say} locked={!!verdict} onJudge={judge} />}
          {ex.kind === 'listen' && <Listen ex={ex} say={say} locked={!!verdict} onJudge={judge} />}
          {ex.kind === 'match' && <Match ex={ex} say={say} onDone={() => judge(true)} />}
          {ex.kind === 'build' && <Build ex={ex} say={say} locked={!!verdict} onJudge={judge} />}
          {ex.kind === 'speak' && <Speak ex={ex} say={say} lang={course.code} locked={!!verdict} onJudge={judge} />}
        </Animated.View>
      </View>

      {verdict ? (
        <Animated.View
          entering={SlideInDown.springify().damping(18)}
          style={[styles.verdict, { paddingBottom: insets.bottom + 18, backgroundColor: verdict.ok ? '#123B2C' : '#3E1820' }]}
          accessibilityLiveRegion="assertive"
        >
          <View style={styles.column}>
            <Display size={24} tint={verdict.ok ? color.success : color.danger}>
              {verdict.ok ? pick(['Nice!', 'Perfect!', 'Spot on!', 'Lovely!']) : 'Not quite'}
            </Display>
            {!verdict.ok && verdict.answer ? (
              <Body style={{ marginTop: 4, marginBottom: 2 }}>
                Answer: <Body bold>{verdict.answer}</Body>
              </Body>
            ) : null}
            <View style={{ marginTop: 14 }}>
              <Button
                label="Continue"
                onPress={next}
                colors={verdict.ok ? [color.success, color.lagoon] : [color.danger, color.coral]}
              />
            </View>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}

function pick<T>(a: T[]) {
  return a[Math.floor(Math.random() * a.length)];
}

function Progress({ value }: { value: number }) {
  const p = useSharedValue(value);
  useEffect(() => {
    p.set(withSpring(value, { damping: 20 }));
  }, [value, p]);
  const style = useAnimatedStyle(() => ({ width: `${Math.max(4, p.value * 100)}%` }));
  return (
    <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}>
      <Animated.View style={[styles.fill, style]} />
    </View>
  );
}

type Say = (t: string, rate?: number) => void;

function Prompt({ kicker, children }: { kicker: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 26, marginBottom: 22 }}>
      <Label>{kicker}</Label>
      <View style={{ marginTop: 8 }}>{children}</View>
    </View>
  );
}

function SpeakerButton({ onPress, size = 92, label }: { onPress: () => void; size?: number; label: string }) {
  return (
    <Tap onPress={onPress} accessibilityLabel={label} style={[styles.speaker, { width: size, height: size, borderRadius: size / 2 }]} haptic="medium">
      <Svg width={size * 0.4} height={size * 0.4} viewBox="0 0 24 24" fill="none">
        <Path d="M4 9v6h4l5 4V5L8 9H4Z" fill={color.ink} />
        <Path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" stroke={color.ink} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    </Tap>
  );
}

function Option({ text, sub, state, onPress, disabled }: { text: string; sub?: string; state: 'idle' | 'picked' | 'right' | 'wrong'; onPress: () => void; disabled?: boolean }) {
  const bg = state === 'right' ? 'rgba(74,222,155,0.18)' : state === 'wrong' ? 'rgba(255,107,107,0.18)' : state === 'picked' ? 'rgba(255,107,91,0.14)' : 'rgba(24,24,46,0.86)';
  const border = state === 'right' ? color.success : state === 'wrong' ? color.danger : state === 'picked' ? color.coral : color.lineStrong;
  return (
    <Tap
      onPress={onPress}
      disabled={disabled}
      depth={0.97}
      accessibilityRole="radio"
      accessibilityState={{ checked: state !== 'idle' }}
      accessibilityLabel={text}
      style={[styles.option, { backgroundColor: bg, borderColor: border }]}
    >
      <Accent size={20}>{text}</Accent>
      {sub ? (
        <Body faint size={13}>
          {sub}
        </Body>
      ) : null}
    </Tap>
  );
}

function Choose({ ex, say, locked, onJudge }: { ex: Extract<Exercise, { kind: 'choose' }>; say: Say; locked: boolean; onJudge: (ok: boolean, a?: string) => void }) {
  const [picked, setPicked] = useState<Word | null>(null);
  return (
    <View style={{ flex: 1 }}>
      <Prompt kicker="Choose the right words">
        <Display size={30}>How do you say “{ex.prompt}”?</Display>
      </Prompt>
      <View style={{ gap: 10 }}>
        {ex.options.map((o) => (
          <Option
            key={o.t}
            text={o.t}
            sub={o.r}
            disabled={locked}
            state={locked && o.t === ex.answer.t ? 'right' : locked && picked?.t === o.t ? 'wrong' : picked?.t === o.t ? 'picked' : 'idle'}
            onPress={() => {
              setPicked(o);
              say(o.t);
            }}
          />
        ))}
      </View>
      <View style={{ flex: 1 }} />
      {!locked ? <Button label="Check" disabled={!picked} onPress={() => onJudge(picked!.t === ex.answer.t, ex.answer.t)} /> : null}
    </View>
  );
}

function Listen({ ex, say, locked, onJudge }: { ex: Extract<Exercise, { kind: 'listen' }>; say: Say; locked: boolean; onJudge: (ok: boolean, a?: string) => void }) {
  const [picked, setPicked] = useState<Word | null>(null);
  useEffect(() => {
    const t = setTimeout(() => say(ex.answer.t), 400);
    return () => clearTimeout(t);
  }, [ex.answer.t]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <View style={{ flex: 1 }}>
      <Prompt kicker="Listen">
        <Display size={30}>What did you hear?</Display>
      </Prompt>
      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center', marginBottom: 24 }}>
        <SpeakerButton onPress={() => say(ex.answer.t)} label="Play the word again" />
        <Tap onPress={() => say(ex.answer.t, 0.6)} accessibilityLabel="Play slowly" style={styles.slow}>
          <Body bold size={14}>
            🐢 Slower
          </Body>
        </Tap>
      </View>
      <View style={{ gap: 10 }}>
        {ex.options.map((o) => (
          <Option
            key={o.t}
            text={o.en}
            disabled={locked}
            state={locked && o.t === ex.answer.t ? 'right' : locked && picked?.t === o.t ? 'wrong' : picked?.t === o.t ? 'picked' : 'idle'}
            onPress={() => setPicked(o)}
          />
        ))}
      </View>
      <View style={{ flex: 1 }} />
      {!locked ? <Button label="Check" disabled={!picked} onPress={() => onJudge(picked!.t === ex.answer.t, `${ex.answer.t} = ${ex.answer.en}`)} /> : null}
    </View>
  );
}

function Match({ ex, say, onDone }: { ex: Extract<Exercise, { kind: 'match' }>; say: Say; onDone: () => void }) {
  const right = useMemo(() => [...ex.pairs].sort((a, b) => a.en.localeCompare(b.en)), [ex.pairs]);
  const [left, setLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [miss, setMiss] = useState<string | null>(null);

  const tryMatch = (w: Word) => {
    if (!left) return;
    if (left === w.t) {
      const m = [...matched, w.t];
      setMatched(m);
      setLeft(null);
      if (m.length === ex.pairs.length) setTimeout(onDone, 300);
    } else {
      setMiss(w.t);
      setTimeout(() => setMiss(null), 500);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Prompt kicker="Match the pairs">
        <Display size={30}>Tap a word, then its meaning</Display>
      </Prompt>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1, gap: 10 }}>
          {ex.pairs.map((w) => {
            const done = matched.includes(w.t);
            return (
              <Tap
                key={w.t}
                disabled={done}
                onPress={() => {
                  setLeft(w.t);
                  say(w.t);
                }}
                accessibilityLabel={w.t}
                accessibilityState={{ selected: left === w.t, disabled: done }}
                style={[styles.tile, left === w.t && { borderColor: color.coral, backgroundColor: 'rgba(255,107,91,0.14)' }, done && styles.tileDone]}
              >
                <Accent size={18}>{w.t}</Accent>
              </Tap>
            );
          })}
        </View>
        <View style={{ flex: 1, gap: 10 }}>
          {right.map((w) => {
            const done = matched.includes(w.t);
            return (
              <Tap
                key={w.en}
                disabled={done || !left}
                onPress={() => tryMatch(w)}
                accessibilityLabel={w.en}
                style={[styles.tile, miss === w.t && { borderColor: color.danger }, done && styles.tileDone]}
              >
                <Body bold>{w.en}</Body>
              </Tap>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function Build({ ex, say, locked, onJudge }: { ex: Extract<Exercise, { kind: 'build' }>; say: Say; locked: boolean; onJudge: (ok: boolean, a?: string) => void }) {
  // Track tiles by index, since a sentence can repeat a word.
  const [chosen, setChosen] = useState<number[]>([]);
  const target = tilesOf(ex.sentence).join(' ');
  const built = chosen.map((k) => ex.tiles[k]).join(' ');
  return (
    <View style={{ flex: 1 }}>
      <Prompt kicker="Build the sentence">
        <Display size={30}>{ex.sentence.en}</Display>
      </Prompt>
      <View style={styles.answer} accessibilityLabel={`Your answer: ${built || 'empty'}`}>
        {chosen.map((k) => (
          <Animated.View key={k} entering={ZoomIn.duration(160)}>
            <Tap disabled={locked} onPress={() => setChosen(chosen.filter((c) => c !== k))} accessibilityLabel={`Remove ${ex.tiles[k]}`} style={styles.word}>
              <Body bold>{ex.tiles[k]}</Body>
            </Tap>
          </Animated.View>
        ))}
      </View>
      <View style={styles.bank}>
        {ex.tiles.map((t, k) => {
          const used = chosen.includes(k);
          return (
            <Tap
              key={k}
              disabled={used || locked}
              onPress={() => {
                setChosen([...chosen, k]);
                say(t);
              }}
              accessibilityLabel={`Add ${t}`}
              style={[styles.word, used && { opacity: 0.2 }]}
            >
              <Body bold>{t}</Body>
            </Tap>
          );
        })}
      </View>
      <View style={{ flex: 1 }} />
      {!locked ? (
        <Button
          label="Check"
          disabled={chosen.length === 0}
          onPress={() => {
            const ok = built.toLowerCase() === target.toLowerCase();
            onJudge(ok, ex.sentence.t);
            say(ex.sentence.t);
          }}
        />
      ) : null}
    </View>
  );
}

function Speak({ ex, say, lang, locked, onJudge }: { ex: Extract<Exercise, { kind: 'speak' }>; say: Say; lang: string; locked: boolean; onJudge: (ok: boolean, a?: string) => void }) {
  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, numberOfChannels: 1 });
  const [live, setLive] = useState(false);
  const [phase, setPhase] = useState<'ready' | 'recording' | 'checking'>('ready');
  const [heard, setHeard] = useState<string | null>(null);

  useEffect(() => {
    health().then((h) => setLive(h.speech));
  }, []);

  const toggle = async () => {
    if (phase === 'recording') {
      setPhase('checking');
      await recorder.stop().catch(() => {});
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});
      try {
        const r = await transcribeAudio(recorder.uri!);
        setHeard(r.text);
        onJudge(similarity(r.text, ex.sentence.t) >= 0.7, ex.sentence.t);
      } catch {
        setHeard(null);
        onJudge(true);
      }
      setPhase('ready');
      return;
    }
    const perm = await requestRecordingPermissionsAsync();
    if (!perm.granted) return;
    await stopSpeaking();
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record({ forDuration: 10 });
    setPhase('recording');
  };

  return (
    <View style={{ flex: 1 }}>
      <Prompt kicker="Say it out loud">
        <Accent size={32}>{ex.sentence.t}</Accent>
        {ex.sentence.r ? (
          <Body dim style={{ marginTop: 4 }}>
            {ex.sentence.r}
          </Body>
        ) : null}
        <Body faint style={{ marginTop: 8 }}>
          {ex.sentence.en}
        </Body>
      </Prompt>
      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
        <SpeakerButton onPress={() => say(ex.sentence.t, 0.85)} size={72} label="Hear it first" />
        <Body dim style={{ flex: 1 }}>
          Hear it, then say it in your own voice.
        </Body>
      </View>
      {heard ? (
        <Body faint style={{ marginTop: 16 }}>
          Piper heard: “{heard}”
        </Body>
      ) : null}
      <View style={{ flex: 1 }} />
      {!locked ? (
        live ? (
          <Button
            label={phase === 'recording' ? 'Done, check me' : phase === 'checking' ? 'Checking…' : 'Tap and speak'}
            icon={phase === 'recording' ? '●' : '🎙️'}
            busy={phase === 'checking'}
            onPress={toggle}
            accessibilityHint={`Records you saying it in ${lang}`}
          />
        ) : (
          <View style={{ gap: 10 }}>
            <Button label="I said it" onPress={() => onJudge(true)} />
            <Button variant="quiet" label="Skip for now" onPress={() => onJudge(true)} />
          </View>
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.ink },
  column: { width: '100%', maxWidth, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 24, flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  closeBtn: { width: touch, height: touch, alignItems: 'center', justifyContent: 'center' },
  track: { flex: 1, height: 12, borderRadius: 6, backgroundColor: color.surfaceHi, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 6, backgroundColor: color.coral },
  option: { minHeight: 60, paddingHorizontal: 18, paddingVertical: 12, borderRadius: radius.lg, borderWidth: 1.5, justifyContent: 'center' },
  speaker: { backgroundColor: color.lagoon, alignItems: 'center', justifyContent: 'center' },
  slow: { height: touch, paddingHorizontal: 18, borderRadius: radius.pill, backgroundColor: color.surfaceHi, justifyContent: 'center' },
  tile: {
    minHeight: 60,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: color.lineStrong,
    backgroundColor: 'rgba(24,24,46,0.86)',
  },
  tileDone: { opacity: 0.25, borderColor: color.success },
  answer: {
    minHeight: 120,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignContent: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderTopWidth: 1.5,
    borderColor: color.line,
  },
  bank: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 24, justifyContent: 'center' },
  word: {
    minHeight: touch,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: color.surfaceHi,
    borderWidth: 1.5,
    borderColor: color.lineStrong,
    borderBottomWidth: 4,
  },
  verdict: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 20, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  reward: { alignSelf: 'center', alignItems: 'center', marginTop: 34, paddingHorizontal: 40, paddingVertical: 20, borderRadius: radius.xl, backgroundColor: 'rgba(255,181,71,0.12)' },
});
