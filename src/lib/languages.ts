export type Language = {
  code: string; // ISO 639-1
  name: string; // English name
  native: string; // endonym
  flag: string;
  locale: string; // BCP 47, for on-device speech
  /** Non-Latin script, so we show a romanization under the translation. */
  romanize?: boolean;
};

// Every language here is supported by ElevenLabs Scribe (speech-to-text)
// and the eleven_flash_v2_5 / eleven_multilingual_v2 voice models.
export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', native: 'English', flag: '🇺🇸', locale: 'en-US' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸', locale: 'es-ES' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷', locale: 'fr-FR' },
  { code: 'it', name: 'Italian', native: 'Italiano', flag: '🇮🇹', locale: 'it-IT' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪', locale: 'de-DE' },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇧🇷', locale: 'pt-BR' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵', locale: 'ja-JP', romanize: true },
  { code: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷', locale: 'ko-KR', romanize: true },
  { code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳', locale: 'zh-CN', romanize: true },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', locale: 'hi-IN', romanize: true },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦', locale: 'ar-SA', romanize: true },
  { code: 'tr', name: 'Turkish', native: 'Türkçe', flag: '🇹🇷', locale: 'tr-TR' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands', flag: '🇳🇱', locale: 'nl-NL' },
  { code: 'el', name: 'Greek', native: 'Ελληνικά', flag: '🇬🇷', locale: 'el-GR', romanize: true },
  { code: 'pl', name: 'Polish', native: 'Polski', flag: '🇵🇱', locale: 'pl-PL' },
  { code: 'sv', name: 'Swedish', native: 'Svenska', flag: '🇸🇪', locale: 'sv-SE' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳', locale: 'vi-VN' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', flag: '🇮🇩', locale: 'id-ID' },
  { code: 'th', name: 'Thai', native: 'ไทย', flag: '🇹🇭', locale: 'th-TH', romanize: true },
  { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺', locale: 'ru-RU', romanize: true },
];

const byCode = new Map(LANGUAGES.map((l) => [l.code, l]));

export function lang(code: string): Language {
  return byCode.get(code) ?? LANGUAGES[0];
}

export function isLanguageCode(code: unknown): code is string {
  return typeof code === 'string' && byCode.has(code);
}
