import { test as base } from '@playwright/test';

type MyFixtures = {
  startUrl: string;
};

export const test = base.extend<MyFixtures>({
  startUrl: async ({ baseURL }, use) => {
    // baseURL이 있으면 쓰고, 없으면 기본값 지정
    await use(baseURL ?? 'https://playwright.dev/');
  },
});

export { expect } from '@playwright/test';