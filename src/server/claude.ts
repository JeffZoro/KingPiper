/** Translation with Claude. Server-only: never import from client code. */
import Anthropic from '@anthropic-ai/sdk';

import { lang } from '@/lib/languages';
import { HttpError } from './http';

const MODEL = process.env.PIPER_TRANSLATION_MODEL || 'claude-opus-5-5';

let client: Anthropic | null = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new HttpError(503, 'not_configured', 'Translation is not set up yet. Add ANTHROPIC_API_KEY to .env.');
  }
  client ??= new Anthropic();
  return client;
}

export function translationConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export type Direction = 'auto' | 'to-theirs' | 'to-mine';

export type TranslationResult = {
  sourceLang: string;
  targetLang: string;
  original: string;
  translation: string;
  /** Latin-script reading of the translation, when the target uses another script. */
  romanization: string | null;
};

const SYSTEM = `You are Piper, a live interpreter for travellers. You hear one short utterance from a face-to-face conversation between two people who speak different languages, and you give the other person what was said, in their language.

How to translate:
- Translate meaning and intent, in the natural spoken register a local would use. Keep it about as long as the original.
- Keep names, numbers, prices, times and addresses exact.
- Never answer, comment on or add to what was said. If it is a question, translate the question.
- If the speech is unclear or partial, translate what is there as faithfully as you can.
- romanization: when the target language does not use the Latin alphabet, give a simple Latin-letter reading of your translation (Hepburn for Japanese, Revised Romanization for Korean, Pinyin with tone marks for Chinese, standard transliteration otherwise). Otherwise null.`;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['source_language', 'translation', 'romanization'],
  properties: {
    source_language: {
      type: 'string',
      description: 'ISO 639-1 code of the language the utterance was spoken in.',
    },
    translation: { type: 'string' },
    romanization: { type: ['string', 'null'] },
  },
} as const;

export async function translate(opts: {
  text: string;
  mine: string;
  theirs: string;
  direction: Direction;
  /** Language the speech-to-text step detected, if any. */
  heardLang?: string | null;
}): Promise<TranslationResult> {
  const { text, mine, theirs, direction, heardLang } = opts;
  const me = lang(mine);
  const them = lang(theirs);

  let instruction: string;
  if (direction === 'to-theirs') {
    instruction = `Translate this from ${me.name} into ${them.name}.`;
  } else if (direction === 'to-mine') {
    instruction = `Translate this from ${them.name} into ${me.name}.`;
  } else {
    instruction =
      `The two people speak ${me.name} (code "${me.code}") and ${them.name} (code "${them.code}"). ` +
      `Work out which of the two the utterance is in, and translate it into the other one.` +
      (heardLang ? ` Speech recognition guessed the language code "${heardLang}".` : '');
  }

  const anthropic = getClient();
  const response = await anthropic.beta.messages.create({
    model: MODEL,
    max_tokens: 2000,
    // Short, latency-sensitive task: low effort keeps the round trip quick.
    output_config: {
      effort: 'low',
      format: { type: 'json_schema', schema: SCHEMA as unknown as Record<string, unknown> },
    },
    // If the primary model declines, the API retries on a fallback model in the same call.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: SYSTEM,
    messages: [{ role: 'user', content: `${instruction}\n\n<utterance>${text}</utterance>` }],
  });

  if (response.stop_reason === 'refusal') {
    throw new HttpError(422, 'declined', "Piper couldn't translate that one. Try saying it another way.");
  }

  const block = response.content.find((b) => b.type === 'text');
  if (!block || block.type !== 'text') {
    throw new HttpError(502, 'bad_response', 'The translation came back empty. Please try again.');
  }

  let parsed: { source_language: string; translation: string; romanization: string | null };
  try {
    parsed = JSON.parse(block.text);
  } catch {
    throw new HttpError(502, 'bad_response', 'The translation came back garbled. Please try again.');
  }

  let sourceLang: string;
  let targetLang: string;
  if (direction === 'to-theirs') {
    [sourceLang, targetLang] = [me.code, them.code];
  } else if (direction === 'to-mine') {
    [sourceLang, targetLang] = [them.code, me.code];
  } else {
    const spokenMine = parsed.source_language?.toLowerCase().startsWith(me.code);
    [sourceLang, targetLang] = spokenMine ? [me.code, them.code] : [them.code, me.code];
  }

  return {
    sourceLang,
    targetLang,
    original: text,
    translation: parsed.translation.trim(),
    romanization: lang(targetLang).romanize ? parsed.romanization?.trim() || null : null,
  };
}
