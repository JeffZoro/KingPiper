import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Tap } from '@/components/pressable';
import { Ring } from '@/components/ring';
import { Screen } from '@/components/screen';
import { Accent, Body, Display, Label } from '@/components/text';
import { COMING_SOON, COURSES, course as getCourse, type Lesson, type Unit } from '@/content';
import { lang } from '@/lib/languages';
import { liveStreak, todayXp, useStore } from '@/lib/store';
import { speak } from '@/lib/voice-out';
import { color, radius } from '@/theme';

const HUES = { coral: color.coral, saffron: color.saffron, lagoon: color.lagoon, iris: color.iris };

export default function Learn() {
  const { state, update } = useStore();
  const c = getCourse(state.learn.course);
  const lessons = c.units.flatMap((u) => u.lessons);
  const done = new Set(state.learn.completed);
  const nextIndex = lessons.findIndex((l) => !done.has(l.id));
  const next = nextIndex === -1 ? null : lessons[nextIndex];
  const nextUnit = next ? c.units.find((u) => u.lessons.includes(next)) : undefined;
  const xpToday = todayXp(state);
  const streak = liveStreak(state);

  return (
    <Screen tone="calm">
      <Display size={36}>Learn {c.title}</Display>
      <Body dim style={{ marginTop: 4 }}>
        {c.tagline}
      </Body>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.courses} style={{ marginHorizontal: -20 }}>
        {COURSES.map((co) => {
          const active = co.code === c.code;
          return (
            <Tap
              key={co.code}
              onPress={() => update({ learn: { ...state.learn, course: co.code } })}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              accessibilityLabel={`${co.title} course`}
              style={[styles.chip, active && styles.chipOn]}
            >
              <Body size={18}>{lang(co.code).flag}</Body>
              <Body bold size={14} tint={active ? color.ink : color.text}>
                {co.title}
              </Body>
            </Tap>
          );
        })}
        {COMING_SOON.map((code) => (
          <View key={code} style={[styles.chip, { opacity: 0.5 }]} accessibilityLabel={`${lang(code).name}, coming soon`}>
            <Body size={18}>{lang(code).flag}</Body>
            <Body size={13} faint>
              Soon
            </Body>
          </View>
        ))}
      </ScrollView>

      <View style={styles.stats}>
        <Stat big={`${streak}`} small="day streak" icon="🔥" />
        <Stat big={`${state.learn.xp}`} small="total XP" icon="✦" />
        <View style={styles.goal} accessibilityLabel={`Daily goal: ${xpToday} of ${state.learn.dailyGoal} XP`}>
          <Ring size={58} progress={xpToday / state.learn.dailyGoal}>
            <Body bold size={13}>
              {Math.min(xpToday, state.learn.dailyGoal)}
            </Body>
          </Ring>
          <Body faint size={12} style={{ marginTop: 4 }}>
            daily goal
          </Body>
        </View>
      </View>

      {next ? (
        <Tap onPress={() => router.push(`/lesson/${next.id}`)} accessibilityLabel={`Continue: ${next.title}`} style={styles.hero} depth={0.98}>
          <LinearGradient colors={[HUES[nextUnit!.hue], color.iris]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <View style={{ flex: 1 }}>
            <Label tint="rgba(10,10,20,0.65)">{nextIndex === 0 ? 'Start here' : 'Up next'}</Label>
            <Display size={28} tint={color.ink} style={{ marginTop: 4 }}>
              {next.title}
            </Display>
            <Body tint="rgba(10,10,20,0.75)" size={14}>
              {nextUnit!.title} · {next.words.length} words · about 3 min
            </Body>
          </View>
          <View style={styles.heroIcon}>
            <Body size={34}>{next.icon}</Body>
          </View>
        </Tap>
      ) : (
        <View style={[styles.hero, { backgroundColor: color.surfaceHi }]}>
          <Accent size={24}>You’ve finished every {c.title} lesson. ¡Bravo!</Accent>
        </View>
      )}

      <Label style={{ marginTop: 30, marginBottom: 12 }}>Survival phrases · tap to hear</Label>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }} style={{ marginHorizontal: -20 }}>
        {c.survival.map((p) => (
          <Tap key={p.t} onPress={() => speak(p.t, c.code, state.gender, { rate: 0.9 })} accessibilityLabel={`${p.en}. Say: ${p.t}`} style={styles.phrase}>
            <Accent size={19}>{p.t}</Accent>
            {p.r ? (
              <Body dim size={13}>
                {p.r}
              </Body>
            ) : null}
            <Body faint size={13} style={{ marginTop: 6 }}>
              {p.en}
            </Body>
          </Tap>
        ))}
      </ScrollView>

      {c.units.map((u, ui) => (
        <UnitPath key={u.id} unit={u} index={ui} done={done} nextId={next?.id} />
      ))}
    </Screen>
  );
}

function Stat({ big, small, icon }: { big: string; small: string; icon: string }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${big} ${small}`}>
      <Body size={18}>{icon}</Body>
      <Display size={26}>{big}</Display>
      <Body faint size={12}>
        {small}
      </Body>
    </View>
  );
}

const OFFSETS = [0, 52, 72, 36, -20, -56, -30];

function UnitPath({ unit, index, done, nextId }: { unit: Unit; index: number; done: Set<string>; nextId?: string }) {
  const hue = HUES[unit.hue];
  return (
    <Animated.View entering={FadeInDown.delay(index * 80)} style={{ marginTop: 34 }}>
      <View style={[styles.unitHead, { borderColor: hue }]}>
        <Label tint={hue}>Unit {index + 1}</Label>
        <Display size={24} style={{ marginTop: 2 }}>
          {unit.title}
        </Display>
        <Body faint size={14}>
          {unit.subtitle}
        </Body>
      </View>
      <View style={{ alignItems: 'center', gap: 18, marginTop: 20 }}>
        {unit.lessons.map((l, i) => (
          <Node key={l.id} lesson={l} hue={hue} offset={OFFSETS[(i + index * 3) % OFFSETS.length]} status={done.has(l.id) ? 'done' : l.id === nextId ? 'next' : 'locked'} />
        ))}
      </View>
    </Animated.View>
  );
}

function Node({ lesson, hue, offset, status }: { lesson: Lesson; hue: string; offset: number; status: 'done' | 'next' | 'locked' }) {
  const open = status !== 'locked';
  return (
    <View style={{ transform: [{ translateX: offset }], alignItems: 'center' }}>
      <Tap
        disabled={!open}
        onPress={() => router.push(`/lesson/${lesson.id}`)}
        accessibilityLabel={`${lesson.title}, ${status === 'done' ? 'completed, practise again' : status === 'next' ? 'next lesson' : 'locked'}`}
        accessibilityState={{ disabled: !open }}
        style={[styles.node, status === 'next' && { borderColor: hue, borderWidth: 3 }, !open && { opacity: 0.4 }]}
      >
        {status === 'done' ? <LinearGradient colors={[hue, color.iris]} style={[StyleSheet.absoluteFill, { borderRadius: 40 }]} /> : null}
        <Body size={30}>{open ? lesson.icon : '🔒'}</Body>
      </Tap>
      <Body bold size={13} dim={status !== 'next'} style={{ marginTop: 6 }}>
        {lesson.title}
      </Body>
    </View>
  );
}

const styles = StyleSheet.create({
  courses: { gap: 8, paddingHorizontal: 20, paddingVertical: 18 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: color.surfaceHi,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.lineStrong,
  },
  chipOn: { backgroundColor: color.text },
  stats: { flexDirection: 'row', gap: 10 },
  stat: {
    flex: 1,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(24,24,46,0.86)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.lineStrong,
  },
  goal: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: 'rgba(24,24,46,0.86)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.lineStrong,
  },
  hero: { marginTop: 16, borderRadius: radius.xl, padding: 22, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 130 },
  heroIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.35)', alignItems: 'center', justifyContent: 'center' },
  phrase: {
    width: 200,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(24,24,46,0.86)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.lineStrong,
  },
  unitHead: { borderLeftWidth: 3, paddingLeft: 14 },
  node: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: color.surfaceHi,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.lineStrong,
    overflow: 'hidden',
  },
});
