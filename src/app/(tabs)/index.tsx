import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { LanguageBar } from '@/components/language-bar';
import { Orb, OrbCaption } from '@/components/orb';
import { Tap } from '@/components/pressable';
import { Screen } from '@/components/screen';
import { Accent, Body, Label } from '@/components/text';
import { TurnCard } from '@/components/turn-card';
import { VoicePicker } from '@/components/voice-picker';
import { lang } from '@/lib/languages';
import { useStore } from '@/lib/store';
import { useInterpreter } from '@/lib/use-interpreter';
import { color, font, radius, touch } from '@/theme';

export default function Translate() {
  const { state, update, toggleSaved } = useStore();
  const it = useInterpreter();
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState('');
  const earlier = state.history.filter((t) => t.id !== it.latest?.id).slice(0, 6);
  const isSaved = (id: string) => state.saved.some((s) => s.id === id);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    setTyping(false);
    it.typed(text);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen tone={it.orb === 'speaking' ? 'cool' : 'warm'}>
        <View style={styles.header}>
          <Accent size={30} tint={color.text}>
            piper
          </Accent>
          <StatusPill live={it.live} />
        </View>

        <LanguageBar mine={state.mine} theirs={state.theirs} onChange={(mine, theirs) => update({ mine, theirs })} />

        {it.latest ? (
          <View style={{ marginTop: 14 }}>
            <TurnCard big turn={it.latest} saved={isSaved(it.latest.id)} onReplay={() => it.say(it.latest!)} onSave={() => toggleSaved(it.latest!)} />
          </View>
        ) : null}


        <View style={styles.stage}>
          <Orb size={it.latest ? 150 : 196} state={it.orb} level={it.level} onPress={it.tap} />
          <OrbCaption state={it.orb} />
          {it.orb === 'listening' ? (
            <Body faint size={13} center style={{ marginTop: 4 }} accessibilityLabel="Microphone is on">
              ● Mic on · {it.seconds}s · either language works
            </Body>
          ) : (
            <Body faint size={13} center style={{ marginTop: 4 }}>
              Speak {lang(state.mine).name} or {lang(state.theirs).name}. Piper works out which.
            </Body>
          )}
        </View>

        <View style={styles.tools}>
          <Tap onPress={() => setTyping((v) => !v)} accessibilityLabel="Type instead" style={styles.tool}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d="M4 7h16M4 12h16M4 17h10" stroke={color.text} strokeWidth={2} strokeLinecap="round" />
            </Svg>
            <Body bold size={14}>
              Type
            </Body>
          </Tap>
          <VoicePicker compact value={state.gender} onChange={(gender) => update({ gender })} />
        </View>

        {typing ? (
          <Animated.View entering={FadeInUp} style={styles.typeRow}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={`Type in ${lang(state.mine).name}…`}
              placeholderTextColor={color.textFaint}
              style={styles.input}
              autoFocus
              onSubmitEditing={send}
              returnKeyType="send"
              maxLength={1000}
              accessibilityLabel={`Type a phrase in ${lang(state.mine).name} to translate`}
            />
            <Tap onPress={send} accessibilityLabel="Translate typed text" style={styles.send}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M5 12h14M13 6l6 6-6 6" stroke={color.ink} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Tap>
          </Animated.View>
        ) : null}

        {it.problem ? (
          <Animated.View entering={FadeIn} style={styles.problem} accessibilityRole="alert">
            <Body tint={color.text} style={{ flex: 1 }}>
              {it.problem.message}
            </Body>
            {it.problem.action ? (
              <Tap onPress={it.problem.action.run} style={styles.problemBtn}>
                <Body bold tint={color.ink} size={14}>
                  {it.problem.action.label}
                </Body>
              </Tap>
            ) : (
              <Tap onPress={it.clearProblem} accessibilityLabel="Dismiss" style={styles.close}>
                <Body bold>✕</Body>
              </Tap>
            )}
          </Animated.View>
        ) : null}

        {earlier.length > 0 ? (
          <View style={{ marginTop: 26, gap: 12 }}>
            <Label>Earlier</Label>
            {earlier.map((t) => (
              <TurnCard key={t.id} turn={t} saved={isSaved(t.id)} onReplay={() => it.say(t)} onSave={() => toggleSaved(t)} />
            ))}
          </View>
        ) : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}

function StatusPill({ live }: { live: { translation: boolean; speech: boolean } | null }) {
  const on = live?.translation && live?.speech;
  return (
    <View style={styles.status} accessibilityLabel={on ? 'Live translation on' : 'Demo mode'}>
      <View style={[styles.statusDot, { backgroundColor: live === null ? color.textFaint : on ? color.success : color.saffron }]} />
      <Body bold size={12.5} dim>
        {live === null ? 'Connecting' : on ? 'Live' : 'Demo'}
      </Body>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(21,21,42,0.75)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.lineStrong,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  stage: { alignItems: 'center', marginTop: 4 },
  tools: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 18, flexWrap: 'wrap' },
  tool: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: touch,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: color.surfaceHi,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.lineStrong,
  },
  typeRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  input: {
    flex: 1,
    minHeight: touch + 4,
    borderRadius: radius.pill,
    paddingHorizontal: 20,
    backgroundColor: color.surfaceHi,
    color: color.text,
    fontFamily: font.body,
    fontSize: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.lineStrong,
  },
  send: { width: touch + 4, height: touch + 4, borderRadius: (touch + 4) / 2, backgroundColor: color.coral, alignItems: 'center', justifyContent: 'center' },
  problem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    padding: 14,
    paddingLeft: 18,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,107,107,0.16)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,107,107,0.5)',
  },
  problemBtn: { paddingHorizontal: 14, height: 40, justifyContent: 'center', borderRadius: radius.pill, backgroundColor: color.text },
  close: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});
