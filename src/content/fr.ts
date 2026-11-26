import type { Course } from './types';

export const french: Course = {
  code: 'fr',
  title: 'French',
  tagline: 'Bonjour to bistro, one bite-sized lesson at a time.',
  survival: [
    { t: 'Bonjour', en: 'Hello' },
    { t: 'Merci beaucoup', en: 'Thank you very much' },
    { t: 'Combien ça coûte ?', en: 'How much is it?' },
    { t: 'Où sont les toilettes ?', en: 'Where is the bathroom?' },
    { t: 'Je ne comprends pas', en: "I don't understand" },
    { t: 'Parlez-vous anglais ?', en: 'Do you speak English?' },
    { t: "L'addition, s'il vous plaît", en: 'The check, please' },
    { t: 'Au secours !', en: 'Help!' },
  ],
  units: [
    {
      id: 'fr-1',
      title: 'First hellos',
      subtitle: 'Greet, introduce yourself, be polite',
      hue: 'iris',
      lessons: [
        {
          id: 'fr-1-1',
          title: 'Greetings',
          icon: '👋',
          words: [
            { t: 'bonjour', en: 'hello' },
            { t: 'au revoir', en: 'goodbye' },
            { t: 'bonsoir', en: 'good evening' },
            { t: 'salut', en: 'hi' },
            { t: 'merci', en: 'thank you' },
            { t: "s'il vous plaît", en: 'please' },
          ],
          sentences: [
            { t: 'Bonjour, merci', en: 'Hello, thank you' },
            { t: 'Merci, au revoir', en: 'Thank you, goodbye' },
          ],
        },
        {
          id: 'fr-1-2',
          title: 'About me',
          icon: '🙂',
          words: [
            { t: 'je', en: 'I' },
            { t: "je m'appelle", en: 'my name is' },
            { t: 'je suis', en: 'I am' },
            { t: 'américain', en: 'American' },
            { t: 'enchanté', en: 'nice to meet you' },
            { t: 'de', en: 'from' },
          ],
          sentences: [
            { t: "Je m'appelle Paul", en: 'My name is Paul' },
            { t: 'Je suis américain', en: 'I am American' },
          ],
        },
        {
          id: 'fr-1-3',
          title: 'Café',
          icon: '🥐',
          words: [
            { t: 'un café', en: 'a coffee' },
            { t: 'un croissant', en: 'a croissant' },
            { t: "de l'eau", en: 'some water' },
            { t: 'je voudrais', en: 'I would like' },
            { t: "l'addition", en: 'the check' },
            { t: 'délicieux', en: 'delicious' },
          ],
          sentences: [
            { t: 'Je voudrais un croissant', en: 'I would like a croissant' },
            { t: "L'addition, s'il vous plaît", en: 'The check, please' },
          ],
        },
      ],
    },
  ],
};
