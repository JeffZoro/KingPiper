const { chromium, devices } = require('playwright');
// Walks the whole app in a phone-sized browser. Needs the dev server on :8081
// (ideally with scripts/mock-providers.mjs for live mode). Usage:
//   node scripts/e2e-web.cjs [screenshot-dir]
const OUT = process.argv[2] || 'e2e-shots';
require('node:fs').mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ ...devices['iPhone 14 Pro'], permissions: ['microphone'] });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text().slice(0, 300)}`); });
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
  const reqs = [];
  page.on('response', (r) => { if (r.url().includes('/api/')) reqs.push(`${r.request().method()} ${new URL(r.url()).pathname} ${r.status()}`); });
  const shot = async (n) => { await page.waitForTimeout(700); await page.screenshot({ path: `${OUT}/${n}.png` }); console.log('shot', n, page.url()); };
  const click = async (label) => { await page.getByLabel(label, { exact: true }).first().click(); };

  await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await shot('01-welcome');
  await click('Get started');
  await page.getByLabel('Birth year').fill('1990');
  await click('Continue');
  await page.waitForTimeout(600);
  await page.getByLabel(/They speak: Spanish/).click();
  await page.waitForTimeout(500);
  await click('Japanese');
  await page.waitForTimeout(500);
  await click('Continue');
  await page.waitForTimeout(600);
  await click('I will tell people before I record them');
  await click('I agree to the Terms of Use and Privacy Policy');
  await click('Start translating');
  await page.waitForTimeout(2500);
  await shot('02-translate-live');
  await click('Start listening');
  await page.waitForTimeout(2000);
  await click('Stop and translate');
  await page.waitForTimeout(3500);
  await shot('03-live-result');
  await click('Type instead');
  await page.getByLabel(/Type a phrase/).fill('Where is the station?');
  await click('Translate typed text');
  await page.waitForTimeout(3000);
  await shot('04-typed-result');
  await click('Save phrase');

  await click('Learn');
  await page.waitForTimeout(1200);
  await page.getByLabel(/^Continue: /).click();
  await page.waitForTimeout(1200);
  for (let step = 0; step < 12; step++) {
    if (await page.getByText('Lesson complete').count()) break;
    const kicker = (await page.getByText(/^(choose the right words|listen|match the pairs|build the sentence|say it out loud)$/i).first().textContent().catch(() => '')) || '';
    const k = kicker.toLowerCase();
    if (k.includes('match')) {
      await shot(`05-ex-${step}-match`);
      const btns = await page.getByRole('button').all();
      const items = [];
      for (const b of btns) {
        const l = await b.getAttribute('aria-label');
        if (l && l !== 'Close lesson') items.push(b);
      }
      const half = items.length / 2;
      const L = items.slice(0, half), R = items.slice(half);
      for (const l of L) {
        for (const r of R) {
          if (await l.isDisabled()) break;
          await l.click(); await page.waitForTimeout(100);
          if (await r.isDisabled()) continue;
          await r.click(); await page.waitForTimeout(600);
        }
      }
      await page.waitForTimeout(800);
    } else if (k.includes('build')) {
      await shot(`05-ex-${step}-build`);
      const adds = await page.getByLabel(/^Add /).all();
      for (const a of adds) { await a.click(); await page.waitForTimeout(100); }
      await click('Check');
    } else if (k.includes('say it')) {
      await shot(`05-ex-${step}-speak`);
      await click('Tap and speak');
      await page.waitForTimeout(1500);
      await click('Done, check me');
      await page.waitForTimeout(2500);
    } else {
      await shot(`05-ex-${step}-${k.includes('listen') ? 'listen' : 'choose'}`);
      const opts = await page.getByRole('radio').all();
      await opts[0].click();
      await click('Check');
    }
    await page.waitForTimeout(700);
    if (step === 1) await shot('06-verdict');
    if (await page.getByLabel('Continue', { exact: true }).count()) await click('Continue');
    await page.waitForTimeout(900);
  }
  await shot('07-lesson-complete');
  await click('Continue');
  await page.waitForTimeout(1200);
  await shot('08-learn-after');
  await click('Phrases');
  await page.waitForTimeout(1000);
  await shot('09-saved');
  await page.getByRole('tab', { name: 'Word deck' }).click();
  await page.waitForTimeout(800);
  await shot('10-deck');
  await page.getByLabel(/Tap to see the meaning/).click();
  await page.waitForTimeout(900);
  await shot('11-deck-flipped');
  await click('You');
  await page.waitForTimeout(1000);
  await shot('12-you');
  await page.mouse.wheel(0, 1200);
  await shot('13-you-bottom');
  await click('Privacy Policy');
  await page.waitForTimeout(1200);
  await shot('14-privacy');
  await click('Close');
  await page.waitForTimeout(800);
  await click('Erase my data');
  await page.waitForTimeout(400);
  await click('Yes, erase everything');
  await page.waitForTimeout(1500);
  console.log('after erase url', page.url());
  await click('Get started');
  await page.getByLabel('Birth year').fill(String(new Date().getFullYear() - 10));
  await click('Continue');
  await page.waitForTimeout(800);
  await shot('15-under13');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  console.log('under13 persists:', await page.getByText('isn’t available', { exact: false }).count());
  console.log('API:', [...new Set(reqs)].join(' | '));
  console.log('ERRORS:\n' + [...new Set(errors)].join('\n'));
  await browser.close();
})().catch((e) => { console.error('FAILED', e.stack); process.exit(1); });
