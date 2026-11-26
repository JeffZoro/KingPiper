import { isLanguageCode } from '@/lib/languages';
import { synthesize } from '@/server/eleven';
import { handle, HttpError, MAX_TEXT, rateLimit } from '@/server/http';

export const POST = handle(async (req) => {
  rateLimit(req, 60);
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  const language = body?.lang;
  const gender = body?.gender === 'male' ? 'male' : 'female';

  if (!text) throw new HttpError(400, 'empty', 'Nothing to say.');
  if (text.length > MAX_TEXT) throw new HttpError(413, 'too_long', 'That is too long to speak at once.');
  if (!isLanguageCode(language)) throw new HttpError(400, 'bad_language', 'Unknown language.');

  const audio = await synthesize(text, language, gender);
  return new Response(audio, {
    headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
  });
});
