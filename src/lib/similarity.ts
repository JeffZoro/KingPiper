/** How close a spoken attempt is to the target phrase, 0..1 (accent- and punctuation-insensitive). */
export function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function similarity(a: string, b: string) {
  const x = normalize(a).replace(/\s/g, '');
  const y = normalize(b).replace(/\s/g, '');
  if (!x.length && !y.length) return 1;
  const d: number[] = Array.from({ length: y.length + 1 }, (_, i) => i);
  for (let i = 1; i <= x.length; i++) {
    let prev = d[0];
    d[0] = i;
    for (let j = 1; j <= y.length; j++) {
      const tmp = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (x[i - 1] === y[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return 1 - d[y.length] / Math.max(x.length, y.length);
}
