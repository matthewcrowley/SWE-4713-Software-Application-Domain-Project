import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByTestId('userinput').click();
  await page.getByTestId('userinput').fill('Manageruser');
  await page.getByTestId('userinput').press('Tab');
  await page.getByRole('textbox', { name: 'Password Password:' }).fill('Manageruser#02');
  await page.getByTestId('loginbtn').click();
  await expect(page.locator('h1')).toContainText('Manager Dashboard');
  await page.getByRole('button', { name: 'Access Service' }).first().click();
  await expect(page.getByRole('cell', { name: 'johndoe' })).toBeVisible();
  await expect(page.locator('#root')).toContainText('Account Management');
  await expect(page.getByRole('button', { name: 'View All Users Report' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Expired Passwords Report' })).toBeVisible();
  await page.getByRole('button', { name: 'Back to Dashboard' }).click();
});