import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';

import type { OrbState } from '@/components/orb';
import { course } from '@/content';
import { ApiError, health, listen, translateText, type Translation } from './api';
import { useStore, type Turn } from './store';
import { setPremiumVoice, speak, stopSpeaking } from './voice-out';

const MAX_SECONDS = 30;

export type Problem = { message: string; action?: { label: string; run: () => void } };

/**
 * The whole live-translation loop: record → transcribe → translate → speak.
 */
export function useInterpreter() {
  const { state, addTurn } = useStore();
  const [orb, setOrb] = useState<OrbState>('idle');
  const [problem, setProblem] = useState<Problem | null>(null);
  const [live, setLive] = useState<{ translation: boolean; speech: boolean } | null>(null);
  const [latest, setLatest] = useState<Turn | null>(null);
  const level = useSharedValue(0);
  const demoIndex = useRef(0);

  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, numberOfChannels: 1, isMeteringEnabled: true });
  const rec = useAudioRecorderState(recorder, 80);

  useEffect(() => {
    health().then(setLive);
  }, []);

  useEffect(() => {
    setPremiumVoice(state.premiumVoice && (live?.speech ?? false));
  }, [state.premiumVoice, live]);

  // Turn the mic level (dBFS, about -60 to 0) into a 0..1 value for the orb.
  useEffect(() => {
    if (!rec.isRecording) {
      level.set(withTiming(0, { duration: 250 }));
      return;
    }
    const db = rec.metering ?? -60;
    level.set(withTiming(Math.max(0, Math.min(1, (db + 55) / 50)), { duration: 90 }));
  }, [rec.metering, rec.isRecording, level]);

  const say = useCallback(
    (t: Translation) => {
      setOrb('speaking');
      speak(t.translation, t.targetLang, state.gender, { rate: state.speechRate, onDone: () => setOrb((o) => (o === 'speaking' ? 'idle' : o)) });
      // Safety net in case the platform never reports the end of playback.
      setTimeout(() => setOrb((o) => (o === 'speaking' ? 'idle' : o)), 15_000);
    },
    [state.gender, state.speechRate],
  );

  const deliver = useCallback(
    (t: Translation) => {
      const turn: Turn = { ...t, id: `${Date.now()}`, at: Date.now(), spoken: t.sourceLang === state.mine ? 'me' : 'them' };
      setLatest(turn);
      addTurn(turn);
      if (state.autoSpeak) say(t);
      else setOrb('idle');
    },
    [addTurn, say, state.autoSpeak, state.mine],
  );

  const fail = useCallback((err: unknown) => {
    setOrb('idle');
    setProblem({ message: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.' });
  }, []);

  /** Without API keys, Piper plays a sample exchange so the experience can be tried. */
  const demo = useCallback(() => {
    const phrases = course(state.theirs).survival;
    const p = phrases[demoIndex.current++ % phrases.length];
    if (!p) {
      setProblem({ message: 'Live translation needs API keys. See the README to switch it on.' });
      setOrb('idle');
      return;
    }
    setOrb('thinking');
    setTimeout(() => {
      deliver({ sourceLang: state.theirs, targetLang: state.mine, original: p.r ? `${p.t} (${p.r})` : p.t, translation: p.en, romanization: null });
    }, 900);
  }, [deliver, state.mine, state.theirs]);

  const start = useCallback(async () => {
    setProblem(null);
    await stopSpeaking();
    const perm = await requestRecordingPermissionsAsync();
    if (!perm.granted) {
      setProblem({
        message: 'Piper needs the microphone to hear the conversation.',
        action: perm.canAskAgain ? undefined : { label: 'Open Settings', run: () => Linking.openSettings() },
      });
      return;
    }
    try {
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record({ forDuration: MAX_SECONDS });
      setOrb('listening');
    } catch {
      setProblem({ message: "Couldn't start the microphone. Is another app using it?" });
    }
  }, [recorder]);

  const finish = useCallback(async () => {
    setOrb('thinking');
    try {
      await recorder.stop();
    } catch {
      // Already stopped (for example, it hit the time limit).
    }
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});
    const uri = recorder.uri;
    if (!live?.translation || !live?.speech) {
      demo();
      return;
    }
    if (!uri) {
      fail(new ApiError('no_audio', "Piper didn't catch that. Try again."));
      return;
    }
    try {
      deliver(await listen(uri, state.mine, state.theirs));
    } catch (e) {
      fail(e);
    }
  }, [deliver, demo, fail, live, recorder, state.mine, state.theirs]);

  // If the 30-second cap ends the recording, translate what we have.
  const wasRecording = useRef(false);
  useEffect(() => {
    if (wasRecording.current && !rec.isRecording && orb === 'listening') finish();
    wasRecording.current = rec.isRecording;
  }, [rec.isRecording, orb, finish]);

  const tap = useCallback(() => {
    if (orb === 'listening') finish();
    else if (orb === 'speaking') {
      stopSpeaking();
      setOrb('idle');
    } else if (orb === 'idle') start();
  }, [orb, finish, start]);

  const typed = useCallback(
    async (text: string) => {
      setProblem(null);
      if (!live?.translation) {
        setProblem({ message: 'Typing needs live translation. Add API keys to switch it on (see the README).' });
        return;
      }
      setOrb('thinking');
      try {
        deliver(await translateText(text, state.mine, state.theirs, 'to-theirs'));
      } catch (e) {
        fail(e);
      }
    },
    [deliver, fail, live, state.mine, state.theirs],
  );

  return { orb, level, tap, typed, say, problem, clearProblem: () => setProblem(null), live, latest, seconds: Math.floor(rec.durationMillis / 1000) };
}
