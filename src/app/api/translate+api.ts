import { isLanguageCode } from '@/lib/languages';
import { translate, type Direction } from '@/server/claude';
import { handle, HttpError, json, MAX_TEXT, rateLimit } from '@/server/http';

const DIRECTIONS: Direction[] = ['auto', 'to-theirs', 'to-mine'];

export const POST = handle(async (req) => {
  rateLimit(req);
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  const { mine, theirs } = body ?? {};
  const direction = (DIRECTIONS as unknown[]).includes(body?.direction) ? (body!.direction as Direction) : 'auto';

  if (!text) throw new HttpError(400, 'empty', 'Type or say something to translate.');
  if (text.length > MAX_TEXT) throw new HttpError(413, 'too_long', 'That is a lot at once. Try a shorter phrase.');
  if (!isLanguageCode(mine) || !isLanguageCode(theirs)) {
    throw new HttpError(400, 'bad_language', 'Pick two languages first.');
  }

  return json(await translate({ text, mine, theirs, direction }));
});
