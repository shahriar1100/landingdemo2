const { test, expect } = require('@playwright/test');

test.use({
  viewport: { width: 390, height: 844 },
  launchOptions: { executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' }
});

test('mobile storefront interactions work', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:4183', { waitUntil: 'networkidle' });

  await expect(page.locator('#productGrid .product')).toHaveCount(4);

  await page.locator('#productGrid .product').first().click({ position: { x: 70, y: 120 } });
  await expect(page.locator('#productModal')).toHaveClass(/open/);
  await expect(page.locator('#productModal')).toHaveCSS('opacity', '1');
  await expect(page.locator('#productModalTitle')).toHaveText('Rosalie Bloom Dress');
  await page.screenshot({ path: 'test-results/product-modal-mobile.png', fullPage: false });
  await page.locator('#modalQtyPlus').click();
  await expect(page.locator('#modalQty')).toHaveText('2');
  await page.locator('#modalAddBtn').click();
  await expect(page.locator('#productModal')).not.toHaveClass(/open/);
  await expect(page.locator('#cartDrawer')).toHaveClass(/open/);
  await expect(page.locator('#cartCount')).toHaveText('2');
  await page.locator('[data-remove]').click();
  await page.locator('[data-close="cart"]').click();

  await page.locator('#menuBtn').click();
  await expect(page.locator('.desktop-nav')).toHaveClass(/mobile/);
  const phoneMenuBox = await page.locator('.desktop-nav').boundingBox();
  expect(phoneMenuBox.y).toBeLessThan(130);
  expect(phoneMenuBox.height).toBeGreaterThan(650);
  await page.screenshot({ path: 'test-results/mobile-menu.png', fullPage: false });
  await page.locator('#menuBtn').click();

  await page.locator('#searchBtn').click();
  await expect(page.locator('#searchOverlay')).toHaveClass(/open/);
  await page.locator('#searchInput').fill('dress');
  await page.locator('#searchGo').click();
  await expect(page.locator('#productGrid .product')).toHaveCount(3);

  await page.locator('[data-filter="All"]').click();
  await page.locator('[data-wish]').first().click();
  await expect(page.locator('#wishCount')).toHaveText('1');

  await page.locator('[data-add]').first().click();
  await expect(page.locator('#cartDrawer')).toHaveClass(/open/);
  await expect(page.locator('#cartCount')).toHaveText('1');
  await page.locator('[data-qty][data-delta="1"]').click();
  await expect(page.locator('#cartCount')).toHaveText('2');
  await page.locator('#promoInput').fill('LUMORA10');
  await page.locator('#promoBtn').click();
  await expect(page.locator('#subtotal')).toHaveText('$212.40');
  await page.locator('#checkoutBtn').click();
  await expect(page.locator('#checkoutModal')).toHaveClass(/open/);
  await page.locator('#checkoutModal [data-close="checkout"]').last().click();

  await page.setViewportSize({ width: 768, height: 900 });
  await page.locator('#menuBtn').click();
  await expect(page.locator('.desktop-nav')).toBeVisible();
  await expect(page.locator('.desktop-nav')).toHaveClass(/mobile/);
  const tabletMenuBox = await page.locator('.desktop-nav').boundingBox();
  expect(tabletMenuBox.y).toBeLessThan(130);
  expect(tabletMenuBox.width).toBe(768);

  expect(errors).toEqual([]);
});
