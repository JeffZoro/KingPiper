/** Client for Piper's own server routes (src/app/api). */
import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import type { VoiceGender } from './voices';

export type Translation = {
  sourceLang: string;
  targetLang: string;
  original: string;
  translation: string;
  romanization: string | null;
};

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

// In development Expo Router resolves relative URLs against the dev server on
// every platform. For production native builds, set EXPO_PUBLIC_API_URL to
// the deployed server (e.g. an EAS Hosting URL).
const BASE = process.env.EXPO_PUBLIC_API_URL ?? '';

async function call(path: string, init: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, init);
  } catch {
    throw new ApiError('offline', "You're offline. Piper needs a connection to translate.");
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { code: string; message: string } } | null;
    throw new ApiError(body?.error?.code ?? 'http_' + res.status, body?.error?.message ?? 'Something went wrong.');
  }
  return res;
}

export async function health(): Promise<{ translation: boolean; speech: boolean }> {
  try {
    const res = await call('/api/health', { method: 'GET' });
    return await res.json();
  } catch {
    return { translation: false, speech: false };
  }
}

export async function translateText(
  text: string,
  mine: string,
  theirs: string,
  direction: 'auto' | 'to-theirs' | 'to-mine' = 'auto',
): Promise<Translation> {
  const res = await call('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, mine, theirs, direction }),
  });
  return res.json();
}

async function audioForm(audioUri: string) {
  const form = new FormData();
  if (Platform.OS === 'web') {
    const blob = await (await fetch(audioUri)).blob();
    const ext = blob.type.includes('mp4') ? 'm4a' : blob.type.includes('ogg') ? 'ogg' : 'webm';
    form.append('audio', blob, `speech.${ext}`);
  } else {
    // React Native's FormData accepts a { uri, name, type } file descriptor.
    form.append('audio', { uri: audioUri, name: 'speech.m4a', type: 'audio/m4a' } as unknown as Blob);
  }
  return form;
}

export async function listen(audioUri: string, mine: string, theirs: string): Promise<Translation> {
  const form = await audioForm(audioUri);
  form.append('mine', mine);
  form.append('theirs', theirs);
  const res = await call('/api/listen', { method: 'POST', body: form });
  return res.json();
}

/** Fetches spoken audio and returns a URI the audio player can open. */
export async function speakUri(text: string, lang: string, gender: VoiceGender): Promise<string> {
  const res = await call('/api/speak', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, lang, gender }),
  });
  const bytes = await res.arrayBuffer();
  if (Platform.OS === 'web') {
    return URL.createObjectURL(new Blob([bytes], { type: 'audio/mpeg' }));
  }
  // A short-lived cache file; the OS may clear it at any time.
  const file = new File(Paths.cache, `piper-voice-${Date.now()}.mp3`);
  await file.write(bytes);
  return file.uri;
}

export async function transcribeAudio(audioUri: string): Promise<{ text: string; language: string | null }> {
  const res = await call('/api/transcribe', { method: 'POST', body: await audioForm(audioUri) });
  return res.json();
}
