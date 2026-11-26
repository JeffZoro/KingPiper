/**
 * Contact details shown in the Privacy Policy and Terms.
 * TODO before release: replace with the real company name, address and inbox.
 */
export const COMPANY = 'Piper';
export const CONTACT_EMAIL = 'privacy@piper.app';
export const EFFECTIVE_DATE = 'November 26, 2026';

export type Section = { h: string; p: string[] };

export const PRIVACY: Section[] = [
  {
    h: 'The short version',
    p: [
      'Piper has no accounts, no ads and no tracking. Your conversation history, saved phrases and learning progress stay on your phone.',
      'When you tap the listen button, Piper records a short clip, sends it to be transcribed and translated, and then discards it. We never store your recordings, and we never sell or share your personal information.',
    ],
  },
  {
    h: 'What we process, and why',
    p: [
      'Audio you record: sent over an encrypted connection to our speech provider (ElevenLabs) to turn speech into text. It is processed in memory to answer your request and is not stored by Piper. We ask the provider not to retain it.',
      'Text to translate: the transcript or the words you type are sent to our translation provider (Anthropic) to produce the translation, and to ElevenLabs to produce the spoken voice.',
      'We do not use your voice to identify you. Piper does not create voiceprints or any other biometric identifier.',
      'Technical data: our server sees your IP address for the length of a request, only to deliver the response and to block abuse through rate limits. It is not logged with your content.',
    ],
  },
  {
    h: 'What stays on your device',
    p: [
      'Your language choices, voice preference, recent translations (up to 50), saved phrases, lessons completed and streak are stored only on your device. You can turn off history, and you can erase all of it at any time in You → Erase my data.',
    ],
  },
  {
    h: 'Recording other people',
    p: [
      'Several US states, including California, Florida, Illinois, Maryland, Massachusetts, Montana, New Hampshire, Pennsylvania and Washington, require the consent of everyone in a private conversation before it is recorded. Please tell the people you are talking with that you are using Piper to translate, and only record with their agreement. Piper shows a red "Listening" state whenever the microphone is on.',
    ],
  },
  {
    h: 'Children',
    p: [
      'Piper is not directed to children under 13, and we do not knowingly collect personal information from them. If you are under 13, please do not use Piper. If you believe a child has used Piper, contact us and we will help.',
    ],
  },
  {
    h: 'Your privacy rights',
    p: [
      'Depending on where you live (for example California, Colorado, Connecticut, Virginia, Texas, Oregon and other states with consumer privacy laws), you may have the right to know what personal information we process, to delete it, to correct it, and to opt out of its sale, sharing for targeted advertising, or profiling.',
      'Piper does not sell or share personal information, does not do targeted advertising and does not profile you. Because we keep no account and no server copy of your content, the fastest way to delete everything is You → Erase my data. You can also email us, and we will not treat you differently for exercising any right.',
    ],
  },
  {
    h: 'Service providers',
    p: [
      'ElevenLabs (speech-to-text and voices) and Anthropic (translation) process content on our behalf under contracts that limit its use to providing the service. Neither is permitted to sell it.',
    ],
  },
  {
    h: 'Security and changes',
    p: [
      'All traffic is encrypted in transit. If we change this policy we will update the date below and ask you to agree again in the app before you continue.',
    ],
  },
  { h: 'Contact', p: [`Questions or requests: ${CONTACT_EMAIL}.`] },
];

export const TERMS: Section[] = [
  {
    h: 'Using Piper',
    p: [
      'Piper helps you understand and be understood when travelling, and helps you learn languages. You must be at least 13 to use it, and if you are under 18 you should use it with a parent or guardian’s permission.',
    ],
  },
  {
    h: 'Translations can be wrong',
    p: [
      'Machine translation and speech recognition make mistakes. Do not rely on Piper for medical, legal, financial or safety-critical decisions, or for anything where a mistranslation could cause harm. In an emergency in the United States, call 911. Abroad, call the local emergency number (112 works across the EU).',
    ],
  },
  {
    h: 'Your responsibilities',
    p: [
      'Only record people who have agreed to it, and follow the recording-consent laws where you are. Do not use Piper to harass anyone, to break the law, or to try to overload or reverse engineer the service.',
    ],
  },
  {
    h: 'Your content',
    p: [
      'You own what you say and type. You give us permission to process it only to provide the translation and voice back to you.',
    ],
  },
  {
    h: 'No warranty',
    p: [
      'Piper is provided “as is” without warranties of any kind, to the extent the law allows. To the extent the law allows, we are not liable for indirect or consequential losses arising from your use of Piper.',
    ],
  },
  {
    h: 'Changes and contact',
    p: [`We may update these terms and will ask you to agree again in the app. Contact: ${CONTACT_EMAIL}.`],
  },
];
