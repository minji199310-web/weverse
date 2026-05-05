import { test, expect} from '@playwright/test';

test ('if user visit home and click "Get Started", h1 "Next.js Docs" is visible and page title contains "Next.js Docs"', async ({ page }) => {
  const startUrl = 'https://nextjs.org/';
  const h1 = 'Next.js Docs';
  const title = /Next.js Docs/;


    await page.goto(startUrl);
    await page.getByRole('link', { name:'Get Started'}).click();

    await expect(page.getByRole('heading',{ name: h1, level:1})).toBeVisible();
    await expect(page).toHaveTitle(title);

});