import { translationConfigured } from '@/server/claude';
import { speechConfigured } from '@/server/eleven';
import { json } from '@/server/http';

export function GET() {
  return json({ translation: translationConfigured(), speech: speechConfigured() });
}
