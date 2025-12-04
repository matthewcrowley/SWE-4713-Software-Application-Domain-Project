import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.getByTestId('userinput').click();
    await page.getByTestId('userinput').fill('kkeller1125');
    await page.getByTestId('userinput').press('Tab');
    await page.getByTestId('passinput').fill('Kkeller1125!');
    await page.getByTestId('loginbtn').click();
    await expect(page.getByText('Invalid username or password')).toBeVisible();
});