import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByTestId('userinput').click();
  await page.getByTestId('userinput').fill('adminuser');
  await page.getByTestId('userinput').press('Tab');
  await page.getByRole('textbox', { name: 'Password Password:' }).fill('Administrator#01');
  await page.getByTestId('loginbtn').click();
  await expect(page.getByRole('heading', { name: 'Administrator Dashboard' })).toBeVisible();
  await expect(page.locator('h1')).toContainText('Administrator Dashboard');
  await page.getByRole('button', { name: 'Access Service' }).first().click();
  await expect(page.getByRole('heading', { name: 'Administrator Account' })).toBeVisible();
  await expect(page.locator('#root')).toContainText('User Management');
  await expect(page.getByRole('button', { name: 'Edit' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Activate' }).first()).toBeVisible();
  await expect(page.locator('#root')).toContainText('Suspend');
  await expect(page.getByRole('heading', { name: 'Account Management', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'View All Users Report' })).toBeVisible();
  await page.getByRole('button', { name: 'Back to Dashboard' }).click();
  await expect(page.locator('h1')).toContainText('Administrator Dashboard');
  await page.getByRole('button', { name: 'Logout' }).click();
});