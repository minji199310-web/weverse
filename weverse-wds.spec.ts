import { test, expect, chromium } from '@playwright/test';
import * as fs from 'fs';

const ID = 'minji199310@gmail.com';
const PW = 'kim24525374!';
const STATE_FILE = 'auth.json';

test.use({ locale: 'ko-KR' });

test('위버스 로그인 후 WID 출력', async ({ }) => {
  const browser = await chromium.launch({ headless: false });

  // 저장된 로그인 상태가 있으면 재사용, 없으면 새로 로그인
  const context = fs.existsSync(STATE_FILE)
    ? await browser.newContext({ storageState: STATE_FILE, locale: 'ko-KR' })
    : await browser.newContext({ locale: 'ko-KR' });

  const page = await context.newPage();
  let wid = '';

  page.on('response', async (response) => {
    if (response.url().includes('/users/v1.0/users/me')) {
      try {
        const data = await response.json();
        if (data.wid) wid = data.wid;
      } catch {}
    }
  });

  await page.goto('https://weverse.io/');

  // 로그인 상태가 아닐 때만 로그인 진행
  if (!fs.existsSync(STATE_FILE)) {
    await page.getByRole('button', { name: '로그인' }).click();
    await page.getByRole('button', { name: '이메일로 로그인' }).click();
    await page.fill('input[type="text"]', ID);
    await page.fill('input[type="password"]', PW);
    await page.getByRole('button', { name: '로그인' }).click();

    // 인증코드 입력 + 확인 버튼까지 직접 누른 후 Resume 클릭
    await page.pause();

    await page.waitForURL('**/weverse.io/**', { timeout: 60000 });

    // 로그인 상태 저장 (다음 실행부터 인증코드 불필요)
    await context.storageState({ path: STATE_FILE });
    console.log('로그인 상태 저장 완료 — 다음부터 인증코드 없이 실행됩니다.');
  }

  await page.waitForTimeout(3000);

  expect(wid).not.toBe('');

  console.log('\n========================================');
  console.log(`ID  : ${ID}`);
  console.log(`PW  : ${PW}`);
  console.log(`WID : ${wid}`);
  console.log('========================================\n');

  await browser.close();
});