import type { Course } from './types';

export const spanish: Course = {
  code: 'es',
  title: 'Spanish',
  tagline: 'From hola to ordering tapas like a local.',
  survival: [
    { t: 'Hola, buenos días', en: 'Hello, good morning' },
    { t: 'Gracias', en: 'Thank you' },
    { t: '¿Cuánto cuesta?', en: 'How much is it?' },
    { t: '¿Dónde está el baño?', en: 'Where is the bathroom?' },
    { t: 'No entiendo', en: "I don't understand" },
    { t: '¿Habla inglés?', en: 'Do you speak English?' },
    { t: 'La cuenta, por favor', en: 'The check, please' },
    { t: '¡Ayuda!', en: 'Help!' },
  ],
  units: [
    {
      id: 'es-1',
      title: 'First hellos',
      subtitle: 'Greet, introduce yourself, be polite',
      hue: 'coral',
      lessons: [
        {
          id: 'es-1-1',
          title: 'Greetings',
          icon: '👋',
          words: [
            { t: 'hola', en: 'hello' },
            { t: 'adiós', en: 'goodbye' },
            { t: 'buenos días', en: 'good morning' },
            { t: 'buenas noches', en: 'good night' },
            { t: 'gracias', en: 'thank you' },
            { t: 'por favor', en: 'please' },
          ],
          sentences: [
            { t: 'Hola, buenos días', en: 'Hello, good morning' },
            { t: 'Gracias, adiós', en: 'Thank you, goodbye' },
          ],
        },
        {
          id: 'es-1-2',
          title: 'About me',
          icon: '🙂',
          words: [
            { t: 'yo', en: 'I' },
            { t: 'me llamo', en: 'my name is' },
            { t: 'soy', en: 'I am' },
            { t: 'de', en: 'from' },
            { t: 'mucho gusto', en: 'nice to meet you' },
            { t: 'Estados Unidos', en: 'United States' },
          ],
          sentences: [
            { t: 'Me llamo Ana', en: 'My name is Ana' },
            { t: 'Soy de Estados Unidos', en: 'I am from the United States' },
          ],
        },
        {
          id: 'es-1-3',
          title: 'Being polite',
          icon: '🌷',
          words: [
            { t: 'perdón', en: 'excuse me' },
            { t: 'lo siento', en: "I'm sorry" },
            { t: 'de nada', en: "you're welcome" },
            { t: 'sí', en: 'yes' },
            { t: 'no', en: 'no' },
            { t: 'vale', en: 'okay' },
          ],
          sentences: [
            { t: 'Perdón, lo siento', en: "Excuse me, I'm sorry" },
            { t: 'Sí, por favor', en: 'Yes, please' },
          ],
        },
      ],
    },
    {
      id: 'es-2',
      title: 'At the café',
      subtitle: 'Order, pay and ask for the check',
      hue: 'saffron',
      lessons: [
        {
          id: 'es-2-1',
          title: 'Ordering',
          icon: '☕',
          words: [
            { t: 'un café', en: 'a coffee' },
            { t: 'agua', en: 'water' },
            { t: 'quiero', en: 'I want' },
            { t: 'quisiera', en: 'I would like' },
            { t: 'con leche', en: 'with milk' },
            { t: 'sin azúcar', en: 'without sugar' },
          ],
          sentences: [
            { t: 'Quisiera un café con leche', en: 'I would like a coffee with milk' },
            { t: 'Agua sin gas, por favor', en: 'Still water, please' },
          ],
        },
        {
          id: 'es-2-2',
          title: 'Food',
          icon: '🥘',
          words: [
            { t: 'el pan', en: 'the bread' },
            { t: 'la paella', en: 'the paella' },
            { t: 'el queso', en: 'the cheese' },
            { t: 'la fruta', en: 'the fruit' },
            { t: 'delicioso', en: 'delicious' },
            { t: 'vegetariano', en: 'vegetarian' },
          ],
          sentences: [
            { t: 'Soy vegetariano', en: 'I am vegetarian' },
            { t: 'La paella está deliciosa', en: 'The paella is delicious' },
          ],
        },
        {
          id: 'es-2-3',
          title: 'Paying',
          icon: '💳',
          words: [
            { t: 'la cuenta', en: 'the check' },
            { t: '¿cuánto cuesta?', en: 'how much is it?' },
            { t: 'tarjeta', en: 'card' },
            { t: 'efectivo', en: 'cash' },
            { t: 'euros', en: 'euros' },
            { t: 'la propina', en: 'the tip' },
          ],
          sentences: [
            { t: 'La cuenta, por favor', en: 'The check, please' },
            { t: '¿Puedo pagar con tarjeta?', en: 'Can I pay by card?' },
          ],
        },
      ],
    },
    {
      id: 'es-3',
      title: 'Getting around',
      subtitle: 'Directions, transport and places',
      hue: 'lagoon',
      lessons: [
        {
          id: 'es-3-1',
          title: 'Directions',
          icon: '🧭',
          words: [
            { t: '¿dónde está?', en: 'where is?' },
            { t: 'a la izquierda', en: 'on the left' },
            { t: 'a la derecha', en: 'on the right' },
            { t: 'todo recto', en: 'straight ahead' },
            { t: 'cerca', en: 'near' },
            { t: 'lejos', en: 'far' },
          ],
          sentences: [
            { t: '¿Dónde está el museo?', en: 'Where is the museum?' },
            { t: 'Está a la izquierda', en: 'It is on the left' },
          ],
        },
        {
          id: 'es-3-2',
          title: 'Transport',
          icon: '🚆',
          words: [
            { t: 'el tren', en: 'the train' },
            { t: 'el autobús', en: 'the bus' },
            { t: 'el taxi', en: 'the taxi' },
            { t: 'un billete', en: 'a ticket' },
            { t: 'la estación', en: 'the station' },
            { t: 'el aeropuerto', en: 'the airport' },
          ],
          sentences: [
            { t: 'Un billete para Madrid', en: 'A ticket to Madrid' },
            { t: 'Al aeropuerto, por favor', en: 'To the airport, please' },
          ],
        },
        {
          id: 'es-3-3',
          title: 'The hotel',
          icon: '🏨',
          words: [
            { t: 'una habitación', en: 'a room' },
            { t: 'la reserva', en: 'the reservation' },
            { t: 'la llave', en: 'the key' },
            { t: 'el desayuno', en: 'breakfast' },
            { t: 'una noche', en: 'one night' },
            { t: 'el wifi', en: 'the wifi' },
          ],
          sentences: [
            { t: 'Tengo una reserva', en: 'I have a reservation' },
            { t: '¿Cuál es la contraseña del wifi?', en: 'What is the wifi password?' },
          ],
        },
      ],
    },
  ],
};
