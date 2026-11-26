/**
 * Speaking a translation aloud. Uses the ElevenLabs voice through Piper's
 * server, and falls back to the phone's own voice if that is unavailable, so
 * the traveller always hears something.
 */
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';

import { speakUri } from './api';
import { lang } from './languages';
import type { VoiceGender } from './voices';

let current: AudioPlayer | null = null;
let premium = true;

export function setPremiumVoice(enabled: boolean) {
  premium = enabled;
}

export async function stopSpeaking() {
  Speech.stop();
  if (current) {
    current.pause();
    current.remove();
    current = null;
  }
}

export async function speak(
  text: string,
  code: string,
  gender: VoiceGender,
  opts: { rate?: number; onDone?: () => void } = {},
) {
  await stopSpeaking();
  await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false }).catch(() => {});

  if (premium) {
    try {
      const uri = await speakUri(text, code, gender);
      const player = createAudioPlayer(uri);
      current = player;
      if (opts.rate && opts.rate !== 1) player.setPlaybackRate(opts.rate);
      player.addListener('playbackStatusUpdate', (s) => {
        if (s.didJustFinish) {
          opts.onDone?.();
          if (current === player) {
            player.remove();
            current = null;
          }
        }
      });
      player.play();
      return;
    } catch {
      // Fall through to the device voice.
    }
  }

  Speech.speak(text, {
    language: lang(code).locale,
    // The device voice can't switch gender reliably, so we shift pitch.
    pitch: gender === 'male' ? 0.85 : 1.1,
    rate: opts.rate ?? 1,
    onDone: opts.onDone,
    onStopped: opts.onDone,
    onError: opts.onDone,
  });
}
