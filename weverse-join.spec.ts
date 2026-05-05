import { test, chromium } from '@playwright/test';
import * as fs from 'fs';

const ID = 'minji199310@gmail.com';
const PW = 'kim24525374!';
const STATE_FILE = 'auth.json';
const COUNTER_FILE = 'counter.json';

// 실행할 때마다 n이 1씩 증가
function getAndIncrementN(): number {
  const data = fs.existsSync(COUNTER_FILE)
    ? JSON.parse(fs.readFileSync(COUNTER_FILE, 'utf-8'))
    : { n: 0 };
  const n = data.n;
  fs.writeFileSync(COUNTER_FILE, JSON.stringify({ n: n + 1 }));
  return n;
}

test.use({ locale: 'ko-KR' });

test.setTimeout(60000);

test('위버스 커뮤니티 가입', async ({ }) => {
  const browser = await chromium.launch({ headless: false });

  const context = fs.existsSync(STATE_FILE)
    ? await browser.newContext({ storageState: STATE_FILE, locale: 'ko-KR' })
    : await browser.newContext({ locale: 'ko-KR' });

  const page = await context.newPage();

  await page.goto('https://weverse.io/');
  await page.waitForLoadState('networkidle');

  if (!fs.existsSync(STATE_FILE)) {
    await page.getByRole('button', { name: '로그인' }).click();
    await page.getByRole('button', { name: '이메일로 로그인' }).click();
    await page.fill('input[type="text"]', ID);
    await page.fill('input[type="password"]', PW);
    await page.getByRole('button', { name: '로그인' }).click();
    await page.pause();
    await page.waitForURL('**/weverse.io/**', { timeout: 60000 });
    await context.storageState({ path: STATE_FILE });
  }

  const n = getAndIncrementN();
  console.log(`\n현재 nth: ${n}`);

  // Step 1. 커뮤니티 찾기 버튼 클릭
  await page.getByRole('button').filter({ hasText: '커뮤니티 찾기' }).first().click();

  // Step 2. n번째 가입 버튼 클릭
  await page.getByRole('button', { name: '가입' }).nth(n).waitFor({ state: 'visible', timeout: 10000 });
  await page.getByRole('button', { name: '가입' }).nth(n).click();
  console.log(`nth(${n}) 가입 버튼 클릭 완료`);

  // Step 3. 패널 닫기
  await page.getByRole('button').filter({ hasText: '커뮤니티 찾기' }).first().click();

  // Step 4. 가입한 커뮤니티 링크 클릭 (n번째 순서)
  await page.getByRole('link').nth(n).waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForTimeout(1000);
  await page.getByRole('link').nth(n).click();
  await page.waitForLoadState('domcontentloaded');

  // Step 5. 커뮤니티 페이지 진입 후 프로필 아이콘 클릭
  await page.getByRole('link').filter({ hasText: /^$/ }).waitFor({ state: 'visible', timeout: 10000 });
  await page.getByRole('link').filter({ hasText: /^$/ }).click();

  await page.waitForTimeout(2000);
  await browser.close();
});
