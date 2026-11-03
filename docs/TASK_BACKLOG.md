# Engineering Task Backlog (`TASK_BACKLOG.md`)

| ID | Epic | Task Title | Priority | Story Points | Dependencies | Status |
|---|---|---|---|---|---|---|
| **TB-01** | Discovery | Playwright crawl of all public & auth routes on `https://atlasclass.app/` | P0 | 5 | — | Done |
| **TB-02** | Discovery | Mirror all 34 chapters' 3D engines (`book.js`, `render.js`, `world.js`, `model.js`, `pages.js`, `practice.js`) & fonts | P0 | 5 | TB-01 | Done |
| **TB-03** | Discovery | Dump all 374 Supabase problem sets, 184 open samples, and multi-step worked solutions | P0 | 3 | TB-01 | Done |
| **TB-04** | Discovery | Execute interactive Playwright scenarios (TOC, 3D Breakdown, Slip Hint, Ghost on Figure, Paywall, Mobile Explore) | P0 | 5 | TB-01 | Done |
| **TB-05** | Docs | Author ADR, PRD, SPEC, Architecture/Data Model, Implementation Plan, Backlog, Acceptance Criteria, Coverage, Parity | P0 | 5 | TB-04 | Done |
| **TB-06** | Database | Initialize Next.js + Prisma with SQLite (`schema.prisma`) & PostgreSQL (`schema.postgres.prisma`) schemas | P0 | 3 | TB-05 | Pending |
| **TB-07** | Database | Create initial Prisma migration & deterministic curriculum seed (`374 problem sets + real problems/solutions`, zero dummy users) | P0 | 5 | TB-06 | Pending |
| **TB-08** | Auth & Security | Implement Auth.js + Invite-Only registration (`/api/auth/register`, `/api/auth/login`, `/api/auth/verify-otp`) with single-use & expiring codes | P0 | 8 | TB-07 | Pending |
| **TB-09** | Auth & Security | Implement RBAC (`STUDENT`, `TEACHER`, `ADMIN`), immediate user/invite revocation, and immutable `AuditLog` service | P0 | 5 | TB-08 | Pending |
| **TB-10** | Backend API | Implement Curriculum & Practice RPC routes (`my_status`, `open_samples`, `open_set`, `submit_answer`, `my_referrals`, `claim_referral`, `my_classes`) | P0 | 8 | TB-07 | Pending |
| **TB-11** | Backend API | Implement Edge Function routes (`/api/fn/{ask,checkout,class-checkout,teacher-request,billing,delete-account}`) | P1 | 5 | TB-10 | Pending |
| **TB-12** | Frontend | Integrate all 34 3D textbook chapters, 3D subject covers, equation sheets, and 6-slide 3D hero with local Next.js API bridge (`/js/app.js`) | P0 | 8 | TB-10 | Pending |
| **TB-13** | Frontend | Implement Invite-Only `/login/` UI, `/account/`, `/account/subscription/`, `/pricing/`, `/teachers/`, and `/admin/` console | P0 | 8 | TB-09, TB-12 | Pending |
| **TB-14** | DevOps & QA | Add PostgreSQL/SQLite deployment configs (`Dockerfile`, `docker-compose.yml`) and run full Playwright E2E verification suite | P0 | 5 | TB-13 | Pending |
