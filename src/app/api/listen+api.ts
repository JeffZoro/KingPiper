import { isLanguageCode } from '@/lib/languages';
import { translate } from '@/server/claude';
import { transcribe } from '@/server/eleven';
import { handle, HttpError, json, MAX_AUDIO_BYTES, rateLimit } from '@/server/http';

/**
 * One tap of the big button: audio in, transcript + translation out.
 * Audio is held in memory for the length of this request only. It is never
 * written to disk or logged.
 */
export const POST = handle(async (req) => {
  rateLimit(req);
  const form = (await req.formData().catch(() => null)) as unknown as { get(name: string): unknown } | null;
  if (!form) throw new HttpError(400, 'bad_request', 'No audio was received.');

  const audio = form.get('audio');
  const mine = form.get('mine');
  const theirs = form.get('theirs');
  if (!(audio instanceof Blob) || audio.size === 0) {
    throw new HttpError(400, 'no_audio', 'No audio was received.');
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    throw new HttpError(413, 'too_long', 'That recording is too long. Try shorter bursts.');
  }
  if (!isLanguageCode(mine) || !isLanguageCode(theirs)) {
    throw new HttpError(400, 'bad_language', 'Pick two languages first.');
  }

  const name = (audio as { name?: string }).name || 'speech.m4a';
  const heard = await transcribe(audio, name);
  if (!heard.text) {
    throw new HttpError(422, 'silence', "Piper didn't catch any words. Try again.");
  }

  const result = await translate({ text: heard.text, mine, theirs, direction: 'auto', heardLang: heard.language });
  return json(result);
});
