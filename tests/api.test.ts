import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { POST as registerPOST } from '@/app/api/auth/register/route';
import { POST as loginPOST } from '@/app/api/auth/login/route';
import { POST as rpcPOST } from '@/app/api/rpc/[fn]/route';
import { POST as fnPOST } from '@/app/api/fn/[fn]/route';
import { GET as invitationsGET, POST as invitationsPOST } from '@/app/api/admin/invitations/route';
import { PATCH as invitationPATCH } from '@/app/api/admin/invitations/[id]/route';
import { PATCH as userPATCH } from '@/app/api/admin/users/[id]/route';
import { GET as auditLogsGET } from '@/app/api/admin/audit-logs/route';

describe('Atlas API, Invite-Only Registration, RBAC, Revocation & Grading', () => {
  const createdUserIds: string[] = [];
  const createdInviteIds: string[] = [];
  let adminToken = '';
  let studentToken = '';
  let studentId = '';

  beforeAll(async () => {
    // Clean up any test-specific artifacts from prior test runs
    await prisma.user.deleteMany({
      where: { email: { endsWith: '@test.atlasclass.local' } },
    });
    await prisma.invitation.deleteMany({
      where: { code: { startsWith: 'TEST-' } },
    });
  });

  afterAll(async () => {
    // Clean up test records so the database stays clean with 0 dummy users
    await prisma.auditLog.deleteMany({
      where: {
        OR: [
          { actorEmail: { endsWith: '@test.atlasclass.local' } },
          { targetId: { in: [...createdUserIds, ...createdInviteIds] } },
        ],
      },
    });
    await prisma.teacherRequest.deleteMany({
      where: { email: { endsWith: '@test.atlasclass.local' } },
    });
    await prisma.user.deleteMany({
      where: { email: { endsWith: '@test.atlasclass.local' } },
    });
    await prisma.invitation.deleteMany({
      where: { code: { startsWith: 'TEST-' } },
    });
  });

  it('seeds 374 problem sets and 0 dummy users by default', async () => {
    const setCount = await prisma.problemSet.count();
    const problemCount = await prisma.problem.count();
    const userCount = await prisma.user.count();
    expect(setCount).toBe(374);
    expect(problemCount).toBeGreaterThanOrEqual(2000);
    expect(userCount).toBe(0);
  });

  it('rejects registration without an invitation code or with an invalid/expired/revoked code', async () => {
    // 1. Missing code
    const req1 = new Request('http://localhost:3000/api/auth/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'uninvited@test.atlasclass.local',
        password: 'Password123!',
        inviteCode: '',
      }),
    });
    const res1 = await registerPOST(req1);
    expect(res1.status).toBe(403);
    const body1 = await res1.json();
    expect(body1.code).toBe('INVITE_REQUIRED');

    // 2. Non-existent code
    const req2 = new Request('http://localhost:3000/api/auth/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'uninvited@test.atlasclass.local',
        password: 'Password123!',
        inviteCode: 'TEST-NONEXISTENT',
      }),
    });
    const res2 = await registerPOST(req2);
    expect(res2.status).toBe(403);
    expect((await res2.json()).code).toBe('INVITE_INVALID');

    // 3. Expired code
    const expInvite = await prisma.invitation.create({
      data: {
        code: 'TEST-EXPIRED-01',
        role: 'STUDENT',
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() - 3600_000),
      },
    });
    createdInviteIds.push(expInvite.id);

    const req3 = new Request('http://localhost:3000/api/auth/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'expired@test.atlasclass.local',
        password: 'Password123!',
        inviteCode: 'TEST-EXPIRED-01',
      }),
    });
    const res3 = await registerPOST(req3);
    expect(res3.status).toBe(403);
    expect((await res3.json()).code).toBe('INVITE_EXPIRED');
  });

  it('redeems a single-use ADMIN invitation code and blocks reuse', async () => {
    const admInvite = await prisma.invitation.create({
      data: {
        code: 'TEST-ADMIN-01',
        role: 'ADMIN',
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 3600_000),
      },
    });
    createdInviteIds.push(admInvite.id);

    const req = new Request('http://localhost:3000/api/auth/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@test.atlasclass.local',
        password: 'AdminPassword123!',
        inviteCode: 'TEST-ADMIN-01',
      }),
    });
    const res = await registerPOST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.user.role).toBe('ADMIN');
    adminToken = data.session.access_token;
    createdUserIds.push(data.user.id);

    // Attempt to reuse the same single-use code
    const reuseReq = new Request('http://localhost:3000/api/auth/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'second@test.atlasclass.local',
        password: 'AdminPassword123!',
        inviteCode: 'TEST-ADMIN-01',
      }),
    });
    const reuseRes = await registerPOST(reuseReq);
    expect(reuseRes.status).toBe(403);
    expect((await reuseRes.json()).code).toBe('INVITE_USED');
  });

  it('allows ADMIN to create and revoke invitations, and registers a STUDENT', async () => {
    // Create an invitation to revoke
    const createReq1 = new Request('http://localhost:3000/api/admin/invitations/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        code: 'TEST-REVOKE-ME',
        role: 'STUDENT',
        expiresInHours: 24,
      }),
    });
    const createRes1 = await invitationsPOST(createReq1);
    expect(createRes1.status).toBe(201);
    const inv1 = (await createRes1.json()).invitation;
    createdInviteIds.push(inv1.id);

    // Revoke it
    const revReq = new Request(`http://localhost:3000/api/admin/invitations/${inv1.id}/`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const revRes = await invitationPATCH(revReq, { params: Promise.resolve({ id: inv1.id }) });
    expect(revRes.status).toBe(200);
    expect((await revRes.json()).invitation.status).toBe('REVOKED');

    // Try registering with the revoked code
    const tryRevReq = new Request('http://localhost:3000/api/auth/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'revokedinvite@test.atlasclass.local',
        password: 'StudentPassword123!',
        inviteCode: 'TEST-REVOKE-ME',
      }),
    });
    const tryRevRes = await registerPOST(tryRevReq);
    expect(tryRevRes.status).toBe(403);
    expect((await tryRevRes.json()).code).toBe('INVITE_REVOKED');

    // Create a valid STUDENT invite and register
    const createReq2 = new Request('http://localhost:3000/api/admin/invitations/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        code: 'TEST-STUDENT-01',
        role: 'STUDENT',
        email: 'student@test.atlasclass.local',
        expiresInHours: 24,
      }),
    });
    const createRes2 = await invitationsPOST(createReq2);
    const inv2 = (await createRes2.json()).invitation;
    createdInviteIds.push(inv2.id);

    const regStudentReq = new Request('http://localhost:3000/api/auth/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@test.atlasclass.local',
        password: 'StudentPassword123!',
        inviteCode: 'TEST-STUDENT-01',
      }),
    });
    const regStudentRes = await registerPOST(regStudentReq);
    expect(regStudentRes.status).toBe(201);
    const sData = await regStudentRes.json();
    studentToken = sData.session.access_token;
    studentId = sData.user.id;
    createdUserIds.push(studentId);
  });

  it('enforces RBAC (403 for STUDENT on admin endpoints) and logs UNAUTHORIZED_ADMIN_ATTEMPT', async () => {
    const stuAdminReq = new Request('http://localhost:3000/api/admin/invitations/', {
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const stuAdminRes = await invitationsGET(stuAdminReq);
    expect(stuAdminRes.status).toBe(403);
  });

  it('enforces 3-free-set quota and grades numeric problems with slips and ghosts', async () => {
    // Unlock 3 sets: kinematics-1, limits-1, onevar-1
    for (const setId of ['kinematics-1', 'limits-1', 'onevar-1']) {
      const req = new Request('http://localhost:3000/api/rpc/open_set/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({ p_set: setId, p_lang: 'en' }),
      });
      const res = await rpcPOST(req, { params: Promise.resolve({ fn: 'open_set' }) });
      const json = await res.json();
      expect(json.error).toBeNull();
      expect(json.data.set.id).toBe(setId);
      expect(json.data.problems.length).toBeGreaterThan(0);
    }

    // 4th set should return paywall hint
    const req4 = new Request('http://localhost:3000/api/rpc/open_set/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ p_set: 'kinematics-2', p_lang: 'en' }),
    });
    const res4 = await rpcPOST(req4, { params: Promise.resolve({ fn: 'open_set' }) });
    const json4 = await res4.json();
    expect(json4.error?.hint).toBe('paywall');

    // Submit wrong numeric answer (14.7) on kinematics-1-01 -> returns slips and ghost
    const subWrong = new Request('http://localhost:3000/api/rpc/submit_answer/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ p_problem: 'kinematics-1-01', p_answer: 14.7, p_lang: 'en' }),
    });
    const wrongRes = await rpcPOST(subWrong, { params: Promise.resolve({ fn: 'submit_answer' }) });
    const wrongJson = await wrongRes.json();
    expect(wrongJson.data.correct).toBe(false);
    expect(wrongJson.data.value).toBeCloseTo(44.1, 1);
    expect(Array.isArray(wrongJson.data.slips)).toBe(true);
    expect(Array.isArray(wrongJson.data.ghost)).toBe(true);

    // Submit right numeric answer (44.1) on kinematics-1-01 -> returns correct: true and steps
    const subRight = new Request('http://localhost:3000/api/rpc/submit_answer/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ p_problem: 'kinematics-1-01', p_answer: 44.1, p_lang: 'en' }),
    });
    const rightRes = await rpcPOST(subRight, { params: Promise.resolve({ fn: 'submit_answer' }) });
    const rightJson = await rightRes.json();
    expect(rightJson.data.correct).toBe(true);
    expect(Array.isArray(rightJson.data.steps)).toBe(true);
  });

  it('validates school email on teacher-request and rejects @gmail.com', async () => {
    const gmailReq = new Request('http://localhost:3000/api/fn/teacher-request/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Teacher',
        email: 'jane@gmail.com',
        school: 'Oak Ridge High',
        courses: ['AP Physics 1'],
      }),
    });
    const gmailRes = await fnPOST(gmailReq, { params: Promise.resolve({ fn: 'teacher-request' }) });
    expect(gmailRes.status).toBe(400);
    expect((await gmailRes.json()).error).toBe('Please use your school email address.');
  });

  it('immediately revokes active user sessions when ADMIN revokes the account', async () => {
    const revokeUserReq = new Request(`http://localhost:3000/api/admin/users/${studentId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'REVOKED', reason: 'Security policy test' }),
    });
    const revokeUserRes = await userPATCH(revokeUserReq, {
      params: Promise.resolve({ id: studentId }),
    });
    expect(revokeUserRes.status).toBe(200);

    // Student token should now return null on my_status
    const statusReq = new Request('http://localhost:3000/api/rpc/my_status/', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({}),
    });
    const statusRes = await rpcPOST(statusReq, { params: Promise.resolve({ fn: 'my_status' }) });
    expect((await statusRes.json()).data).toBeNull();

    // Student login attempt should return 403 ACCOUNT_REVOKED
    const loginReq = new Request('http://localhost:3000/api/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@test.atlasclass.local',
        password: 'StudentPassword123!',
      }),
    });
    const loginRes = await loginPOST(loginReq);
    expect(loginRes.status).toBe(403);
    expect((await loginRes.json()).code).toBe('ACCOUNT_REVOKED');

    // Audit log should contain USER_REVOKED and UNAUTHORIZED_ADMIN_ATTEMPT
    const auditReq = new Request('http://localhost:3000/api/admin/audit-logs/', {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const auditRes = await auditLogsGET(auditReq);
    const { auditLogs } = await auditRes.json();
    const actions = new Set(auditLogs.map((l: any) => l.action));
    expect(actions.has('INVITE_CREATED')).toBe(true);
    expect(actions.has('INVITE_REDEEMED')).toBe(true);
    expect(actions.has('INVITE_REVOKED')).toBe(true);
    expect(actions.has('UNAUTHORIZED_ADMIN_ATTEMPT')).toBe(true);
    expect(actions.has('USER_REVOKED')).toBe(true);
  });
});
