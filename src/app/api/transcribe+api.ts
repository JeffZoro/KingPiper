import { transcribe } from '@/server/eleven';
import { handle, HttpError, json, MAX_AUDIO_BYTES, rateLimit } from '@/server/http';

/** Speech-to-text only, for pronunciation practice in lessons. */
export const POST = handle(async (req) => {
  rateLimit(req);
  const form = (await req.formData().catch(() => null)) as unknown as { get(name: string): unknown } | null;
  const audio = form?.get('audio');
  if (!(audio instanceof Blob) || audio.size === 0) throw new HttpError(400, 'no_audio', 'No audio was received.');
  if (audio.size > MAX_AUDIO_BYTES) throw new HttpError(413, 'too_long', 'That recording is too long.');
  const name = (audio as { name?: string }).name || 'speech.m4a';
  return json(await transcribe(audio, name));
});
