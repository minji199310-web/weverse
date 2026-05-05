import { test, expect } from '@playwright/test' 

test.describe('button click', () => {
    test('open preferences menu', async ({ page }) => {
        const startUrl = 'https://nextjs.org';

        await page.goto(startUrl);

        await test.step('if click nextjs icon, show dropwoin menu', async () => {
            await page.getByRole('button')
        }