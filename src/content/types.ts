export type Word = { t: string; en: string; r?: string };
export type Sentence = { t: string; en: string; r?: string };

export type Lesson = {
  id: string;
  title: string;
  icon: string;
  words: Word[];
  sentences: Sentence[];
};

export type Unit = {
  id: string;
  title: string;
  subtitle: string;
  hue: 'coral' | 'saffron' | 'lagoon' | 'iris';
  lessons: Lesson[];
};

export type Course = {
  code: string;
  title: string;
  tagline: string;
  units: Unit[];
  /** Phrases a traveller needs on day one. */
  survival: Sentence[];
};
