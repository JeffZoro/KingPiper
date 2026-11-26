/** ElevenLabs speech-to-text and voices. Server-only. */
import { DEFAULT_VOICES, type VoiceGender } from '@/lib/voices';
import { HttpError } from './http';

const BASE = process.env.ELEVENLABS_BASE_URL || 'https://api.elevenlabs.io/v1';
const STT_MODEL = process.env.ELEVENLABS_STT_MODEL || 'scribe_v1';
const TTS_MODEL = process.env.ELEVENLABS_TTS_MODEL || 'eleven_flash_v2_5';

function key() {
  const k = process.env.ELEVENLABS_API_KEY;
  if (!k) {
    throw new HttpError(503, 'not_configured', 'Voice is not set up yet. Add ELEVENLABS_API_KEY to .env.');
  }
  return k;
}

export function speechConfigured() {
  return Boolean(process.env.ELEVENLABS_API_KEY);
}

// ISO 639-3 (what Scribe returns) to the ISO 639-1 codes Piper uses.
const ISO3: Record<string, string> = {
  eng: 'en', spa: 'es', fra: 'fr', ita: 'it', deu: 'de', por: 'pt', jpn: 'ja', kor: 'ko',
  cmn: 'zh', zho: 'zh', yue: 'zh', hin: 'hi', ara: 'ar', tur: 'tr', nld: 'nl', ell: 'el',
  pol: 'pl', swe: 'sv', vie: 'vi', ind: 'id', tha: 'th', rus: 'ru',
};

export async function transcribe(audio: Blob, filename: string) {
  const form = new FormData();
  form.append('model_id', STT_MODEL);
  form.append('file', audio, filename);
  form.append('tag_audio_events', 'false');

  // enable_logging=false asks ElevenLabs not to retain the audio (zero-retention
  // mode; honoured on plans that support it).
  const res = await fetch(`${BASE}/speech-to-text?enable_logging=false`, {
    method: 'POST',
    headers: { 'xi-api-key': key() },
    body: form,
  });
  if (!res.ok) {
    throw new HttpError(502, 'stt_failed', "Piper couldn't hear that clearly. Try again a little closer.");
  }
  const data = (await res.json()) as { text?: string; language_code?: string };
  const code = data.language_code?.toLowerCase() ?? null;
  return {
    text: (data.text ?? '').trim(),
    language: code ? (ISO3[code] ?? code.slice(0, 2)) : null,
  };
}

export async function synthesize(text: string, language: string, gender: VoiceGender) {
  const voiceId =
    (gender === 'male' ? process.env.ELEVENLABS_VOICE_MALE : process.env.ELEVENLABS_VOICE_FEMALE) ||
    DEFAULT_VOICES[gender].id;

  const res = await fetch(
    `${BASE}/text-to-speech/${voiceId}?output_format=mp3_44100_64&enable_logging=false`,
    {
      method: 'POST',
      headers: { 'xi-api-key': key(), 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({
        text,
        model_id: TTS_MODEL,
        language_code: language,
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    },
  );
  if (!res.ok) {
    throw new HttpError(502, 'tts_failed', "Piper's voice is unavailable right now.");
  }
  return res.arrayBuffer();
}
