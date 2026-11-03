# Implementation Plan (`IMPLEMENTATION_PLAN.md`)

## Phase 1: Project Scaffolding & Database Setup (`scaffold-app`)
1. Initialize Next.js (latest stable App Router, TypeScript) inside `/home/azadmin/atlasclass`.
2. Configure Prisma with dual-datasource support:
   - `prisma/schema.prisma` (`sqlite` for local development and automated testing).
   - `prisma/schema.postgres.prisma` (`postgresql` for production deployment).
   - Generate and apply initial Prisma migrations (`npx prisma migrate dev --name init`).
3. Build the curriculum seed script (`prisma/seed.ts`):
   - Seed all 374 authentic `ProblemSet` records from `docs/exploration/data/supabase-data.json`.
   - Seed all authentic `Problem` records (combining the 184 open sample problems + full worked solutions/steps/slips/ghosts from `supabase-data.json`, the unlocked full sets `kinematics-1`, `limits-1`, `onevar-1`, and all 680+ chapter `practice.js` problems mapped across the problem sets so every single problem set in the application has rich, real AP problems and worked solutions—zero dummy text).
   - Do **not** create any dummy or demo user accounts in the seed script. Provide a clean CLI utility (`scripts/create-invite.ts`) to generate cryptographically random invitation codes for bootstrapping an administrator, teacher, or student when needed.

## Phase 2: Backend API, Auth.js, Invite-Only Registration, RBAC, & Audit Logging (`implement-backend`)
1. Implement `src/lib/prisma.ts`, `src/lib/audit.ts` (`writeAuditLog`), and `src/lib/auth.ts` (Auth.js / NextAuth configuration + session token & revocation verification).
2. Implement Invite-Only Registration & Authentication endpoints:
   - `POST /api/auth/register`: Enforces valid, unexpired, unrevoked, non-depleted `InvitationCode`; creates `User` with the code's assigned `role` (`STUDENT`, `TEACHER`, `ADMIN`) and `grantPremium`; records `InvitationRedemption` and `AuditLog`; issues session cookie + token.
   - `POST /api/auth/login`: Authenticates credentials or sends magic link (`#token_hash`); blocks `REVOKED` users immediately and logs `USER_LOGIN_REVOKED_BLOCKED`.
   - `POST /api/auth/verify-otp`: Verifies `#token_hash` magic link (spending it only on button click).
   - `POST /api/auth/logout` and `GET /api/auth/session`.
3. Implement Admin & RBAC API endpoints (`/api/admin/*`, guarded by `requireRole('ADMIN')`):
   - `GET / POST / PATCH /api/admin/invitations`: Create single-use/multi-use expiring invitation codes, list codes with redemption history, revoke codes.
   - `GET / PATCH /api/admin/users`: List users, update roles (`STUDENT`, `TEACHER`, `ADMIN`), revoke/restore user access (`status = 'REVOKED'` + increment `sessionVersion`), toggle Premium.
   - `GET / PATCH /api/admin/teacher-requests`: Approve or reject school class access requests.
   - `GET /api/admin/audit-logs`: Query and filter immutable audit logs.
4. Implement Curriculum, Practice Drawer, & Edge Function APIs:
   - `POST /api/rpc/my_status`
   - `POST /api/rpc/open_samples`
   - `POST /api/rpc/open_set`
   - `POST /api/rpc/submit_answer`
   - `POST /api/rpc/my_referrals`
   - `POST /api/rpc/claim_referral`
   - `POST /api/rpc/my_classes`
   - `GET /api/problem_sets`
   - `GET /api/attempts`
   - `POST /api/fn/[name]` (`ask`, `checkout`, `class-checkout`, `teacher-request`, `billing`, `delete-account`).

## Phase 3: Frontend Replication, 3D Engine Integration, & Admin UI (`implement-frontend`)
1. Copy all mirrored static assets (`fonts/`, `physics/`, `calculus/`, `statistics/`, `demos/`, `atlas.css`, `app.css`, `nav.css`, `subjects.css`, `drawer.css`, `favicon.svg`, `apple-touch-icon.png`) into `public/` and configure Next.js routing/middleware so all 34 3D textbook chapters, equation sheets, and subject portals render with 100% visual and interactive fidelity.
2. Replace `/public/js/config.js` and `/public/js/app.js` with our local Next.js-backed implementation that talks directly to `/api/rpc/*`, `/api/fn/*`, `/api/problem_sets`, `/api/attempts`, and `/api/auth/*`, while adding invite-only registration support and an Admin navigation link when signed in as `ADMIN`.
3. Build/adapt `/login/`, `/account/`, `/account/subscription/`, `/pricing/`, `/teachers/`, `/practice/`, `/subjects/`, `/about/`, `/terms/`, `/privacy/`, and the new `/admin/` Security & Governance Console matching the exact Atlas paper-and-ink design system (`EB Garamond`, `Inter`, `JetBrains Mono`, light/dark theme support).
4. Support localized route prefixes (`/id/`, `/ms/`, `/vi/`, `/zh/`, `/zh-tw/`, `/ja/`, `/ko/`, `/hi/`, `/es/`, `/pt/`) via Next.js middleware/rewrites.

## Phase 4: Testing, Deployment Configuration, & Verification (`verify-and-test`)
1. Write unit/integration tests and comprehensive Playwright E2E tests verifying:
   - Invite-only registration enforcement (rejecting missing, invalid, expired, depleted, and revoked invitation codes; succeeding with valid single-use code and assigning the correct role).
   - Immediate user access revocation and RBAC protection on `/admin/` and `/api/admin/*`.
   - Audit log generation and filtering for all security events.
   - Homepage 3D hero carousel, Subject pages, 3D textbook chapter rendering, page turning, 3D assembly click-to-breakdown (`#plate`), Equation sheet search filtering, Practice Drawer sample & set unlocking, slip hint detection (`14.7 m`), 3D figure ghost rendering, step-by-step worked solution playback, teacher `@gmail.com` validation error, and mobile responsive explore mode.
2. Add production deployment configurations (`Dockerfile`, `docker-compose.yml` with PostgreSQL, `.env.example`, and scripts for SQLite/PostgreSQL switching).
