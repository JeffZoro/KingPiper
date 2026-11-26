/** Small helpers shared by the API routes. Server-only. */

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      // Translations are personal content: never cache them anywhere.
      'Cache-Control': 'no-store',
    },
  });
}

export function handle(fn: (req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    try {
      return await fn(req);
    } catch (err) {
      if (err instanceof HttpError) {
        return json({ error: { code: err.code, message: err.message } }, err.status);
      }
      // Log the failure type only. Never log transcripts, translations or audio.
      console.error('[piper] unexpected error:', (err as Error)?.name ?? 'Error');
      return json({ error: { code: 'internal', message: 'Something went wrong. Please try again.' } }, 500);
    }
  };
}

/**
 * Minimal per-IP rate limit (in-memory, per server instance). Keeps a leaked
 * build from burning API credits. Swap for a shared store in production.
 */
const hits = new Map<string, { count: number; reset: number }>();
export function rateLimit(req: Request, limit = 40, windowMs = 60_000) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + windowMs });
    return;
  }
  entry.count += 1;
  if (entry.count > limit) {
    throw new HttpError(429, 'rate_limited', 'Too many requests. Take a breath and try again in a minute.');
  }
}

export const MAX_TEXT = 1000;
export const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
