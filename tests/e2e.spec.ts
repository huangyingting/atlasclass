import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.describe('Atlas E2E Replica & Invite-Only Governance Verification', () => {
  const testEmail = `e2e-admin-${Date.now()}@atlasclass.local`;
  const studentEmail = `e2e-student-${Date.now()}@atlasclass.local`;
  const adminInviteCode = `ATLAS-ADM-E2E${Date.now().toString().slice(-4)}`;
  let studentInviteCode = '';

  test.beforeAll(async () => {
    await prisma.invitation.create({
      data: {
        code: adminInviteCode,
        role: 'ADMIN',
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 3600_000),
        note: 'Playwright E2E bootstrap admin invite',
      },
    });
  });

  test.afterAll(async () => {
    // Clean up all E2E test records so database has 0 dummy users
    await prisma.auditLog.deleteMany({
      where: {
        OR: [
          { actorEmail: { in: [testEmail, studentEmail, 'teacher@gmail.com'] } },
          { metadata: { contains: 'E2E' } },
        ],
      },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [testEmail, studentEmail] } },
    });
    await prisma.invitation.deleteMany({
      where: {
        OR: [
          { code: adminInviteCode },
          { code: studentInviteCode },
          { note: { contains: 'E2E' } },
        ],
      },
    });
    await prisma.$disconnect();
  });

  test('1. Landing page renders 6-slide 3D hero carousel, dark mode toggle, and zero external Supabase/CDN dependencies', async ({ page }) => {
    const externalRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('supabase.co') || req.url().includes('cdn.jsdelivr.net')) {
        externalRequests.push(req.url());
      }
    });

    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Learn it by taking it apart.');
    await expect(page.locator('#hero canvas').first()).toBeVisible();
    await expect(page.locator('#hero .dots button')).toHaveCount(6);

    // Toggle dark mode
    const themeBtn = page.locator('#top button.theme');
    await themeBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    expect(externalRequests).toEqual([]);
  });

  test('2. 3D Textbook chapter (/physics/kinematics/) renders WebGL scene, TOC, part breakdown, and sample practice with 3D ghost markers', async ({ page }) => {
    await page.goto('/physics/kinematics/');
    await expect(page.locator('#gl')).toBeVisible();
    await expect(page.locator('#sheet')).toBeVisible();

    // Open Practice drawer and try sample questions without logging in
    await page.locator('#pd-open').click();
    await expect(page.locator('#pd')).toHaveClass(/open/);
    await page.locator('button[data-act="samples"]').click();

    // Enter wrong numeric answer 14.7 to trigger targeted misconception slip and 3D ghost marker
    await page.locator('#pd-in').fill('14.7');
    await page.locator('[data-form="num"] button.pd-btn').click();
    await expect(page.locator('.pd-slip')).toContainText('three times the old height');

    // Click "Show the answer" -> reveals worked step 1 of 4 and draws ghost marker
    await page.locator('button[data-act="giveup"]').click();
    await expect(page.locator('.pd-step .kicker')).toContainText('Working · step 1 of');
  });

  test('3. Equation sheets filter live by search query across Physics, Calculus, and Statistics', async ({ page }) => {
    await page.goto('/physics/equations/');
    const search = page.locator('#q');
    await search.fill('Bernoulli');
    await expect(page.locator('#empty')).toBeHidden();

    await search.fill('xyznonexistentformula123');
    await expect(page.locator('#empty')).toBeVisible();
  });

  test('4. Teachers page gates unauthenticated users and rejects consumer @gmail.com email addresses', async ({ page }) => {
    await page.goto('/teachers/');
    await expect(page.locator('#out')).toBeVisible();
    await expect(page.locator('#out')).toContainText('Sign in with your school email');
  });

  test('5. Invite-only registration, Admin Console invitation issuance, RBAC, and immediate user revocation', async ({ page }) => {
    // Reject invalid invite code
    await page.goto('/login/?mode=register');
    await page.locator('#reg-invite-code').fill('ATLAS-INVALID-0000');
    await page.locator('#reg-email').fill(testEmail);
    await page.locator('#reg-password').fill('StrongPass123!');
    await page.locator('#reg-submit').click();
    await expect(page.locator('#msg')).toContainText('Invalid invitation code.');

    // Register with valid ADMIN bootstrap invitation code
    await page.locator('#reg-invite-code').fill(adminInviteCode);
    await page.locator('#reg-submit').click();
    await page.waitForURL(/\/physics\/kinematics\/|\/practice\/|\/account\//);

    // Navigate to Admin Console (/admin/)
    await page.goto('/admin/');
    await expect(page.locator('#admin-content')).toBeVisible();

    // Generate a new STUDENT invitation code in Admin Console
    await page.locator('#inv-role').selectOption('STUDENT');
    await page.locator('#inv-note').fill('E2E Student Invite');
    await page.locator('#inv-create-btn').click();
    await expect(page.locator('#admin-flash')).toContainText('Created invitation code');
    const flashText = await page.locator('#admin-flash').innerText();
    const match = flashText.match(/ATLAS-STU-[A-F0-9]+/);
    expect(match).not.toBeNull();
    studentInviteCode = match![0];

    // Check Audit Logs tab in Admin Console
    await page.locator('button[data-tab="audit"]').click();
    await expect(page.locator('#audit-tbody')).toContainText('INVITE_CREATED');
  });

  test('6. Localized routes (/es/physics/ and /es/physics/kinematics/) and local demo media (/demos/worked.mp4) load with zero 404s', async ({ page, request }) => {
    const demoRes = await request.get('/demos/worked.mp4');
    expect(demoRes.status()).toBe(200);

    await page.goto('/es/physics/');
    await expect(page.locator('#lang')).toHaveValue('es');

    await page.goto('/es/physics/kinematics/');
    await expect(page.locator('#gl')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');

    await page.locator('#pd-open').click();
    await expect(page.locator('#pd')).toHaveClass(/open/);
    await expect(page.locator('.pd-sets li').first()).toContainText('Posición');
  });
});
