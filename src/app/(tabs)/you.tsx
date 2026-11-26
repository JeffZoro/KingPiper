import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { Button } from '@/components/button';
import { Tap } from '@/components/pressable';
import { Screen } from '@/components/screen';
import { Body, Display, Label } from '@/components/text';
import { VoicePicker } from '@/components/voice-picker';
import { CONTACT_EMAIL } from '@/lib/legal';
import { useStore } from '@/lib/store';
import { speak } from '@/lib/voice-out';
import { color, radius } from '@/theme';

export default function You() {
  const { state, update, eraseAll } = useStore();
  const [confirmErase, setConfirmErase] = useState(false);

  return (
    <Screen tone="calm">
      <Display size={36}>You</Display>
      <Body dim style={{ marginTop: 4 }}>
        Voice, privacy and your data.
      </Body>

      <Label style={styles.section}>Voice</Label>
      <VoicePicker
        value={state.gender}
        onChange={(gender) => {
          update({ gender });
          speak('Hello! This is how I sound.', 'en', gender);
        }}
      />
      <View style={styles.group}>
        <Row title="Speak translations aloud" sub="Piper says each translation as soon as it’s ready.">
          <Toggle value={state.autoSpeak} onChange={(autoSpeak) => update({ autoSpeak })} label="Speak translations aloud" />
        </Row>
        <Row title="Slower speech" sub="Easier to follow, great while learning.">
          <Toggle value={state.speechRate < 1} onChange={(v) => update({ speechRate: v ? 0.8 : 1 })} label="Slower speech" />
        </Row>
        <Row title="Natural voices" sub="Lifelike ElevenLabs voices. Off uses your phone’s built-in voice.">
          <Toggle value={state.premiumVoice} onChange={(premiumVoice) => update({ premiumVoice })} label="Natural voices" />
        </Row>
      </View>

      <Label style={styles.section}>Privacy</Label>
      <View style={styles.group}>
        <Row title="Keep translation history" sub="Your last 50 translations, on this phone only.">
          <Toggle value={state.saveHistory} onChange={(saveHistory) => update(saveHistory ? { saveHistory } : { saveHistory, history: [] })} label="Keep translation history" />
        </Row>
        <LinkRow title="Clear history" sub={`${state.history.length} translations stored`} onPress={() => update({ history: [] })} />
        <LinkRow title="Privacy Policy" onPress={() => router.push('/legal/privacy')} />
        <LinkRow title="Terms of Use" onPress={() => router.push('/legal/terms')} />
        <LinkRow
          title="Your privacy choices"
          sub="Piper never sells or shares your personal information, so there is nothing to opt out of."
          onPress={() => router.push('/legal/privacy')}
        />
      </View>

      <Label style={styles.section}>Your data</Label>
      <View style={[styles.group, { padding: 18 }]}>
        <Body dim size={14}>
          Erase everything Piper keeps on this phone: history, saved phrases, learning progress and settings. This can’t be undone.
        </Body>
        <View style={{ marginTop: 14 }}>
          {confirmErase ? (
            <View style={{ gap: 10 }}>
              <Button
                label="Yes, erase everything"
                colors={[color.danger, color.coral]}
                onPress={async () => {
                  await eraseAll();
                  router.replace('/welcome');
                }}
              />
              <Button variant="ghost" label="Cancel" onPress={() => setConfirmErase(false)} />
            </View>
          ) : (
            <Button variant="ghost" label="Erase my data" onPress={() => setConfirmErase(true)} />
          )}
        </View>
      </View>

      <Body faint size={13} center style={{ marginTop: 28 }}>
        Piper {Constants.expoConfig?.version ?? ''} · {CONTACT_EMAIL}
      </Body>
      <Body faint size={12} center style={{ marginTop: 4 }}>
        Translations can be wrong. In an emergency, call 911 (US) or 112 (EU).
      </Body>
    </Screen>
  );
}

function Row({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Body bold>{title}</Body>
        {sub ? (
          <Body faint size={13}>
            {sub}
          </Body>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function LinkRow({ title, sub, onPress }: { title: string; sub?: string; onPress: () => void }) {
  return (
    <Tap onPress={onPress} depth={0.99} accessibilityRole="link" accessibilityLabel={title} style={styles.row}>
      <View style={{ flex: 1 }}>
        <Body bold>{title}</Body>
        {sub ? (
          <Body faint size={13}>
            {sub}
          </Body>
        ) : null}
      </View>
      <Body faint size={20}>
        ›
      </Body>
    </Tap>
  );
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <Switch
      value={value}
      onValueChange={onChange}
      accessibilityLabel={label}
      trackColor={{ false: color.surfaceHi, true: color.coral }}
      thumbColor={color.text}
      ios_backgroundColor={color.surfaceHi}
    />
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 30, marginBottom: 12 },
  group: {
    marginTop: 10,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(24,24,46,0.86)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.lineStrong,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 64,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.line,
  },
});
