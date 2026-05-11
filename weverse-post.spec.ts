import { test, chromium } from '@playwright/test';
import * as fs from 'fs';

const ID = '@gmail.com';
const PW = 'kim12341234!';
const STATE_FILE = 'auth.json';
const COUNTER_FILE = 'counter.json';

function getAndIncrementN(): number {
  const data = fs.existsSync(COUNTER_FILE)
    ? JSON.parse(fs.readFileSync(COUNTER_FILE, 'utf-8'))
    : { n: 0 };
  const n = data.n;
  fs.writeFileSync(COUNTER_FILE, JSON.stringify({ n: n + 1 }));
  return n;
}

test.use({ locale: 'ko-KR' });
test.setTimeout(120000);

test('위버스 커뮤니티 가입 및 포스트 작성', async ({ }) => {
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
  await page.pause(); // 현재 페이지 상태 확인
  await page.getByRole('link').filter({ hasText: /^$/ }).waitFor({ state: 'visible', timeout: 10000 });
  await page.getByRole('link').filter({ hasText: /^$/ }).click();
  await page.waitForLoadState('domcontentloaded');

  // --- 포스트 작성 ---

  // 포스트 글남기기 클릭
  await page.getByText(/팬들과 이야기를 나눠보세요/).click();

  // 글쓰기 클릭
  await page.getByLabel('false').click();

  // 글 입력
  await page.getByLabel('false').fill('안녕하세요');

  // 이미지 업로드 버튼 클릭
  await page.locator('.wev-editor-footer-view-_-attachment_button > .icon-_-icon > svg').first().click();

  // 이미지 파일 선택
  await page.getByLabel('attach photo', { exact: true }).setInputFiles('PC.png');

  // 이미지 확인
  await page.getByText('확인').click();

  // 포스트 등록
  await page.locator('button').filter({ hasText: '등록' }).click();
  await page.waitForTimeout(2000);

  // --- 포스트 수정 ---

  // 더보기 버튼 클릭
  await page.getByRole('button', { name: 'more' }).nth(1).click();

  // 수정하기 클릭
  await page.getByRole('button', { name: '수정하기 수정하기', exact: true }).click();

  // 이미지 삭제
  await page.locator('button').filter({ hasText: 'delete image' }).click();

  // 글 수정
  await page.getByLabel('false').fill('안녕히계세요');

  // 동영상 업로드 버튼 클릭
  await page.locator('label:nth-child(2) > .icon-_-icon > svg').click();

  // 동영상 파일 선택
  await page.getByLabel('attach video', { exact: true }).setInputFiles('바다.mp4');

  // 동영상 확인
  await page.getByText('확인').click();

  // 포스트 등록
  await page.locator('button').filter({ hasText: '등록' }).click();
  await page.waitForTimeout(2000);

  await browser.close();
});
