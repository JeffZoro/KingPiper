import type { Course } from './types';

export const japanese: Course = {
  code: 'ja',
  title: 'Japanese',
  tagline: 'Konnichiwa to the konbini, with readings for every word.',
  survival: [
    { t: 'こんにちは', en: 'Hello', r: 'konnichiwa' },
    { t: 'ありがとうございます', en: 'Thank you', r: 'arigatō gozaimasu' },
    { t: 'いくらですか？', en: 'How much is it?', r: 'ikura desu ka?' },
    { t: 'トイレはどこですか？', en: 'Where is the bathroom?', r: 'toire wa doko desu ka?' },
    { t: 'わかりません', en: "I don't understand", r: 'wakarimasen' },
    { t: '英語を話せますか？', en: 'Do you speak English?', r: 'eigo o hanasemasu ka?' },
    { t: 'お会計お願いします', en: 'The check, please', r: 'okaikei onegaishimasu' },
    { t: '助けて！', en: 'Help!', r: 'tasukete!' },
  ],
  units: [
    {
      id: 'ja-1',
      title: 'First hellos',
      subtitle: 'Greetings and polite basics',
      hue: 'coral',
      lessons: [
        {
          id: 'ja-1-1',
          title: 'Greetings',
          icon: '🙇',
          words: [
            { t: 'こんにちは', en: 'hello', r: 'konnichiwa' },
            { t: 'おはよう', en: 'good morning', r: 'ohayō' },
            { t: 'こんばんは', en: 'good evening', r: 'konbanwa' },
            { t: 'さようなら', en: 'goodbye', r: 'sayōnara' },
            { t: 'ありがとう', en: 'thank you', r: 'arigatō' },
            { t: 'すみません', en: 'excuse me', r: 'sumimasen' },
          ],
          sentences: [
            { t: 'こんにちは、ありがとう', en: 'Hello, thank you', r: 'konnichiwa, arigatō' },
            { t: 'すみません、さようなら', en: 'Excuse me, goodbye', r: 'sumimasen, sayōnara' },
          ],
        },
        {
          id: 'ja-1-2',
          title: 'About me',
          icon: '🙂',
          words: [
            { t: 'わたし', en: 'I', r: 'watashi' },
            { t: 'はい', en: 'yes', r: 'hai' },
            { t: 'いいえ', en: 'no', r: 'iie' },
            { t: 'アメリカ人', en: 'American', r: 'amerikajin' },
            { t: 'です', en: 'am / is', r: 'desu' },
            { t: 'よろしく', en: 'nice to meet you', r: 'yoroshiku' },
          ],
          sentences: [
            { t: 'わたし は アメリカ人 です', en: 'I am American', r: 'watashi wa amerikajin desu' },
            { t: 'はい、よろしく', en: 'Yes, nice to meet you', r: 'hai, yoroshiku' },
          ],
        },
        {
          id: 'ja-1-3',
          title: 'Konbini',
          icon: '🍙',
          words: [
            { t: 'おにぎり', en: 'rice ball', r: 'onigiri' },
            { t: 'みず', en: 'water', r: 'mizu' },
            { t: 'おちゃ', en: 'tea', r: 'ocha' },
            { t: 'ください', en: 'please (give me)', r: 'kudasai' },
            { t: 'いくら', en: 'how much', r: 'ikura' },
            { t: 'ふくろ', en: 'bag', r: 'fukuro' },
          ],
          sentences: [
            { t: 'おにぎり を ください', en: 'A rice ball, please', r: 'onigiri o kudasai' },
            { t: 'おちゃ は いくら です か', en: 'How much is the tea?', r: 'ocha wa ikura desu ka' },
          ],
        },
      ],
    },
  ],
};
