import { french } from './fr';
import { japanese } from './ja';
import { spanish } from './es';
import type { Course, Lesson, Sentence, Word } from './types';

export * from './types';

export const COURSES: Course[] = [spanish, french, japanese];
/** Languages with a course in the works, shown as "coming soon". */
export const COMING_SOON = ['it', 'de', 'pt', 'ko'];

export function course(code: string): Course {
  return COURSES.find((c) => c.code === code) ?? spanish;
}

export function findLesson(id: string): { course: Course; lesson: Lesson } | null {
  for (const c of COURSES) {
    for (const u of c.units) {
      const lesson = u.lessons.find((l) => l.id === id);
      if (lesson) return { course: c, lesson };
    }
  }
  return null;
}

export function allWords(c: Course): (Word & { lessonId: string })[] {
  return c.units.flatMap((u) => u.lessons.flatMap((l) => l.words.map((w) => ({ ...w, lessonId: l.id }))));
}

// ---------------------------------------------------------------------------
// Exercise generation. Each lesson is a small vocabulary set plus a couple of
// sentences; exercises are built from them so content stays easy to author.

export type Exercise =
  | { kind: 'match'; pairs: Word[] }
  | { kind: 'choose'; prompt: string; answer: Word; options: Word[] }
  | { kind: 'listen'; answer: Word; options: Word[] }
  | { kind: 'build'; sentence: Sentence; tiles: string[] }
  | { kind: 'speak'; sentence: Sentence };

function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function optionsFor(answer: Word, pool: Word[], rand: () => number) {
  const others = shuffle(
    pool.filter((w) => w.t !== answer.t),
    rand,
  ).slice(0, 3);
  return shuffle([answer, ...others], rand);
}

/** Split a sentence into word tiles. Japanese lessons pre-space their words. */
export function tilesOf(s: Sentence): string[] {
  return s.t
    .replace(/[¿?¡!.,、。]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export function buildExercises(lesson: Lesson, attempt = 0): Exercise[] {
  const rand = seeded(`${lesson.id}:${attempt}`);
  const words = shuffle(lesson.words, rand);
  const [s1, s2] = lesson.sentences;

  return [
    { kind: 'choose', prompt: words[0].en, answer: words[0], options: optionsFor(words[0], lesson.words, rand) },
    { kind: 'listen', answer: words[1], options: optionsFor(words[1], lesson.words, rand) },
    { kind: 'match', pairs: words.slice(0, 4) },
    { kind: 'choose', prompt: words[2].en, answer: words[2], options: optionsFor(words[2], lesson.words, rand) },
    { kind: 'build', sentence: s1, tiles: shuffle(tilesOf(s1), rand) },
    { kind: 'listen', answer: words[3], options: optionsFor(words[3], lesson.words, rand) },
    { kind: 'speak', sentence: s2 ?? s1 },
  ];
}
