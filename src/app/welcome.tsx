import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, useSharedValue } from 'react-native-reanimated';

import { Button } from '@/components/button';
import { Check } from '@/components/check';
import { LanguageBar } from '@/components/language-bar';
import { Orb } from '@/components/orb';
import { Screen } from '@/components/screen';
import { Accent, Body, Display, Label } from '@/components/text';
import { VoicePicker } from '@/components/voice-picker';
import { POLICY_VERSION, useStore } from '@/lib/store';
import { speak } from '@/lib/voice-out';
import { DEFAULT_VOICES } from '@/lib/voices';
import { color, font, radius, touch } from '@/theme';

type Step = 'hello' | 'age' | 'setup' | 'consent';

export default function Welcome() {
  const { state, update } = useStore();
  const [step, setStep] = useState<Step>('hello');
  const [year, setYear] = useState('');
  const [yearError, setYearError] = useState('');
  const [checks, setChecks] = useState({ terms: false, recording: false });
  const level = useSharedValue(0);

  if (state.ageBlocked) {
    return (
      <Screen tabs={false} scroll={false}>
        <View style={styles.center}>
          <Display center>Sorry, Piper isn’t available yet</Display>
          <Body dim center style={{ marginTop: 14 }}>
            Piper is for people aged 13 and over. Ask a parent or guardian about other ways to learn a language.
          </Body>
        </View>
      </Screen>
    );
  }

  const thisYear = new Date().getFullYear();
  const checkAge = () => {
    const y = Number(year);
    if (!Number.isInteger(y) || y < thisYear - 120 || y > thisYear) {
      setYearError('Please enter a four-digit year.');
      return;
    }
    // Neutral age screen: we don't say what age is required until after the answer.
    // Anyone who could be under 13 in their birth year is treated as under 13.
    if (thisYear - y <= 13) {
      update({ ageBlocked: true });
      return;
    }
    setYearError('');
    setStep('setup');
  };

  const finish = () => {
    update({
      consent: { terms: true, age13: true, recording: true, birthYear: Number(year), version: POLICY_VERSION, at: Date.now() },
    });
    router.replace('/');
  };

  return (
    <Screen tabs={false}>
      {step === 'hello' && (
        <Animated.View key="hello" entering={FadeIn.duration(500)} exiting={FadeOut} style={styles.hero}>
          <Accent size={30} tint={color.coral} style={{ marginBottom: 6 }}>
            piper
          </Accent>
          <View style={{ alignItems: 'center', marginVertical: 8 }}>
            <Orb size={150} state="idle" level={level} onPress={() => setStep('age')} />
          </View>
          <Display center size={40}>
            Speak to anyone,{'\n'}anywhere.
          </Display>
          <Body dim center style={{ marginTop: 14, marginBottom: 30, maxWidth: 360 }}>
            Tap once. Piper listens, translates and says it out loud in a natural voice. Then learn the language as you go.
          </Body>
          <View style={{ alignSelf: 'stretch' }}>
            <Button label="Get started" onPress={() => setStep('age')} />
          </View>
        </Animated.View>
      )}

      {step === 'age' && (
        <Animated.View key="age" entering={FadeInDown.springify().damping(18)} style={styles.step}>
          <StepDots at={0} />
          <Display>What year were you born?</Display>
          <Body dim style={{ marginTop: 10 }}>
            We ask everyone this before they start. Your answer stays on this device.
          </Body>
          <TextInput
            value={year}
            onChangeText={(t) => setYear(t.replace(/\D/g, '').slice(0, 4))}
            keyboardType="number-pad"
            placeholder="YYYY"
            placeholderTextColor={color.textFaint}
            style={styles.year}
            accessibilityLabel="Birth year"
            maxLength={4}
            onSubmitEditing={checkAge}
            returnKeyType="next"
          />
          {yearError ? (
            <Body tint={color.danger} accessibilityLiveRegion="polite">
              {yearError}
            </Body>
          ) : null}
          <View style={{ marginTop: 28 }}>
            <Button label="Continue" onPress={checkAge} disabled={year.length !== 4} />
          </View>
        </Animated.View>
      )}

      {step === 'setup' && (
        <Animated.View key="setup" entering={FadeInDown.springify().damping(18)} style={styles.step}>
          <StepDots at={1} />
          <Display>Where are you headed?</Display>
          <Body dim style={{ marginTop: 10, marginBottom: 22 }}>
            Choose your language and theirs. You can change these any time.
          </Body>
          <LanguageBar mine={state.mine} theirs={state.theirs} onChange={(mine, theirs) => update({ mine, theirs, learn: { ...state.learn, course: theirs } })} />
          <Label style={{ marginTop: 30, marginBottom: 12 }}>Piper’s voice</Label>
          <VoicePicker
            value={state.gender}
            onChange={(gender) => {
              update({ gender });
              speak(gender === 'female' ? `Hi, I'm ${DEFAULT_VOICES.female.name}.` : `Hi, I'm ${DEFAULT_VOICES.male.name}.`, 'en', gender);
            }}
          />
          <Body faint size={13} style={{ marginTop: 10 }}>
            Tap a voice to hear it.
          </Body>
          <View style={{ marginTop: 30 }}>
            <Button label="Continue" onPress={() => setStep('consent')} />
          </View>
        </Animated.View>
      )}

      {step === 'consent' && (
        <Animated.View key="consent" entering={FadeInDown.springify().damping(18)} style={styles.step}>
          <StepDots at={2} />
          <Display>Your privacy, plainly</Display>
          <View style={styles.points}>
            <Point icon="🎙️" title="The mic is only on when you tap" body="You’ll always see the glowing Listening state while Piper hears." />
            <Point icon="🗑️" title="Recordings are never stored" body="Clips are sent to be translated, then thrown away. No accounts, no ads, no selling data." />
            <Point icon="📱" title="Your history stays on your phone" body="Erase it all any time from the You tab." />
          </View>

          <Check
            checked={checks.recording}
            onToggle={() => setChecks((c) => ({ ...c, recording: !c.recording }))}
            label="I will tell people before I record them"
          >
            <Body dim>
              I’ll tell people before I record them. <Body faint size={14}>Some US states require everyone’s consent to record a conversation.</Body>
            </Body>
          </Check>
          <Check
            checked={checks.terms}
            onToggle={() => setChecks((c) => ({ ...c, terms: !c.terms }))}
            label="I agree to the Terms of Use and Privacy Policy"
          >
            <Body dim>
              I agree to the{' '}
              <Body tint={color.saffron} bold onPress={() => router.push('/legal/terms')} accessibilityRole="link">
                Terms of Use
              </Body>{' '}
              and{' '}
              <Body tint={color.saffron} bold onPress={() => router.push('/legal/privacy')} accessibilityRole="link">
                Privacy Policy
              </Body>
              .
            </Body>
          </Check>

          <View style={{ marginTop: 24 }}>
            <Button label="Start translating" onPress={finish} disabled={!checks.terms || !checks.recording} />
          </View>
        </Animated.View>
      )}
    </Screen>
  );
}

function StepDots({ at }: { at: number }) {
  return (
    <View style={styles.dots} accessibilityLabel={`Step ${at + 1} of 3`}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={[styles.dot, i === at && styles.dotOn, i < at && { backgroundColor: color.coral }]} />
      ))}
    </View>
  );
}

function Point({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <View style={styles.point}>
      <View style={styles.pointIcon}>
        <Body size={20}>{icon}</Body>
      </View>
      <View style={{ flex: 1 }}>
        <Body bold>{title}</Body>
        <Body faint size={14}>
          {body}
        </Body>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 8 },
  hero: { alignItems: 'center', paddingTop: 12 },
  step: { paddingTop: 20 },
  year: {
    marginTop: 26,
    marginBottom: 10,
    minHeight: touch + 20,
    borderRadius: radius.lg,
    backgroundColor: color.surfaceHi,
    color: color.text,
    fontFamily: font.display,
    fontSize: 34,
    letterSpacing: 6,
    textAlign: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.lineStrong,
  },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 26 },
  dot: { height: 6, width: 18, borderRadius: 3, backgroundColor: color.lineStrong },
  dotOn: { width: 36, backgroundColor: color.text },
  points: { gap: 16, marginTop: 22, marginBottom: 20 },
  point: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  pointIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: color.surfaceHi,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
