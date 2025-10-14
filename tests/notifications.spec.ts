// tests/notifications.spec.ts
import { test, expect } from '@playwright/test';

test('Notification Center renders and shows list', async ({ page }) => {
  // Mock: navigate to /notifications; in real app, ensure server returns items
  await page.goto('http://localhost:3000/notifications');
  // Basic smoke test text
  await expect(page.getByText('Upozornění')).toBeVisible();
});
