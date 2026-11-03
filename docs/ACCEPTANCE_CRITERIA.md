# Acceptance Criteria (`ACCEPTANCE_CRITERIA.md`)

## 1. Invite-Only Registration, Roles, Revocation, & Audit Logging
- **AC-01 (Invite-Only Enforcement)**:
  - *Given* an unauthenticated visitor on `/login/`,
  - *When* they attempt to register a new account without an invitation code or with an invalid code,
  - *Then* registration is rejected with HTTP 400/403, no `User` record is created, and an `AUTH_REGISTER_REJECTED` audit log entry is recorded.
- **AC-02 (Single-Use & Expiring Invitation Codes)**:
  - *Given* a single-use invitation code (`maxUses = 1`) with an expiration date (`expiresAt`),
  - *When* a new user registers with that code before `expiresAt`,
  - *Then* the user is created with the code's specified `role` (`STUDENT`, `TEACHER`, or `ADMIN`) and `grantPremium` flag, `usedCount` becomes `1`, `status` becomes `DEPLETED`, an `InvitationRedemption` row is created, and subsequent attempts to reuse the code fail with `"This invitation code has already been used."`.
- **AC-03 (Invitation Code Revocation)**:
  - *Given* an active invitation code created by an `ADMIN`,
  - *When* the `ADMIN` revokes the code via `/admin/` or `PATCH /api/admin/invitations`,
  - *Then* `status` becomes `REVOKED`, an `INVITE_REVOKED` audit log is written, and any attempt to redeem the code is rejected immediately.
- **AC-04 (Role-Based Access Control & User Revocation)**:
  - *Given* a signed-in user with `role = 'STUDENT'` or `role = 'TEACHER'`,
  - *When* they request `/admin/` or `/api/admin/*`,
  - *Then* access is denied with HTTP 403.
  - *When* an `ADMIN` revokes a user's access (`status = 'REVOKED'`),
  - *Then* the user's active session is immediately invalidated (`my_status` and authenticated endpoints return 401/403), they cannot log back in, and a `USER_REVOKED` audit log entry is recorded.
- **AC-05 (No Dummy Data or Demo Accounts)**:
  - *Given* a freshly migrated and seeded database (`npx prisma migrate deploy && npx prisma db seed`),
  - *When* querying `User`,
  - *Then* there are `0` pre-seeded dummy/demo users, while `ProblemSet` contains all 374 real AP problem sets and `Problem` contains all real AP curriculum problems and worked solutions.

---

## 2. Interactive 3D Textbooks, Equation Sheets, & Practice Drawer
- **AC-06 (Homepage 6-Slide 3D Hero & Footer)**:
  - *Given* a user visiting `/`,
  - *When* they click next/dots on the hero carousel or click a 3D part on the canvas,
  - *Then* the Three.js scene transitions across the 6 slides (`kinematics`, `rotation`, `applications`, `magnetism`, `parametric`, `circular`) and opens the `#hero-plate` breakdown panel.
- **AC-07 (34 Interactive 3D Chapters & Breakdowns)**:
  - *Given* a user visiting any of the 34 chapters across `/physics/<chapter>/`, `/calculus/<chapter>/`, and `/statistics/<chapter>/`,
  - *When* the page loads, turns pages (`#dots` or `#pagenum` TOC), or clicks an assembly on `#gl`,
  - *Then* the 3D scene renders with paper-and-ink outlines, interpolates cameras between pages, explodes the selected assembly into parts, pauses time (`paused` pill), and displays the `#plate` Breakdown with live state facts (`#facts`).
- **AC-08 (Practice Drawer: Slip Hints, 3D Ghost, & Worked Steps)**:
  - *Given* a student in the Practice Drawer (`#pd`) on `/physics/kinematics/`,
  - *When* they enter `14.7` on question 1 (`kinematics-1-01`),
  - *Then* the drawer displays `"Not quite: 14.7 m isn’t it. Have another go."` and the slip hint `"That is three times the old height: height does not grow in step with speed."`.
  - *When* they click `"Show the answer"` and step through `WORKING · STEP 1–4`,
  - *Then* the 3D figure animates to each step's pose and displays the translucent red ghost marker `your answer: 14.7 m` at `y = 14.7 m` alongside `h = 44.1 m`.
- **AC-09 (Free Set Quota, Soft Confirmation, & Hard Paywall)**:
  - *Given* an authenticated Free user (`free_limit = 3`),
  - *When* they click an unopened practice set,
  - *Then* they are prompted `"This will be free set X of 3. Free sets stay yours."` before unlocking it.
  - *When* all 3 free sets are used and they click a 4th set,
  - *Then* the drawer displays `"You’ve used your free sets."` with a CTA to `/pricing/?locked=1`.
- **AC-10 (Equation Reference Sheets & Teacher Validation)**:
  - *Given* a user on `/physics/equations/`, `/calculus/equations/`, or `/statistics/equations/`,
  - *When* they type a query into `#q`,
  - *Then* matching equations filter in real time and update `#count`.
  - *Given* an authenticated user on `/teachers/`,
  - *When* they submit a personal email domain (`gmail.com`),
  - *Then* the server rejects the request with `"Please sign in with your school email address, not a personal one."`.
