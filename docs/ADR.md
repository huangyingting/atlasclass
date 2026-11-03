# Architecture Decision Records (ADR)

## ADR-001: Full-Stack Framework — Next.js (Latest Stable App Router) with Hybrid Static ESM 3D Engine
- **Status**: Accepted
- **Context**: `https://atlasclass.app/` combines standard web application pages (`/`, `/subjects/`, `/practice/`, `/pricing/`, `/teachers/`, `/login/`, `/account/`, `/about/`, `/terms/`, `/privacy/`, `/<subject>/`, `/<subject>/equations/`) with 34 highly specialized, performance-critical Three.js r186 + KaTeX interactive 3D textbook chapters (`/<subject>/<chapter>/`).
- **Decision**: Use the latest stable **Next.js (App Router, TypeScript)** as the unified application server. Serve all 34 interactive 3D textbook chapters and their shared rendering engines (`engine/book.js`, `engine/render.js`, `engine/parts.js`, `engine/tex.js`, `engine/xrefs.js`, `engine/cover.js`, `kit.js`, `dist.js`) with 100% fidelity, while backing `/js/app.js` and `/js/drawer.js` with Next.js Route Handlers (`/api/...`) authenticated via Auth.js and persisted via Prisma.
- **Consequences**: Preserves 100% pixel-and-shader accuracy for all 34 Three.js chapters and the 6-slide 3D homepage hero while giving the application a modern, type-safe Next.js + Auth.js + Prisma backend with server-side rendering, API routes, middleware authorization, and zero external Supabase dependency.

---

## ADR-002: Database & ORM — Prisma with Dual SQLite (Local Dev) and PostgreSQL (Production) Support
- **Status**: Accepted
- **Context**: The system must run out-of-the-box in local development using SQLite while supporting PostgreSQL in production deployments, with full schema migrations and zero dummy/mock user accounts.
- **Decision**: Use **Prisma ORM** with:
  1. `prisma/schema.prisma` configured for SQLite (`provider = "sqlite"`, `DATABASE_URL="file:./dev.db"`) for local development and automated testing, with initial migration SQL committed under `prisma/migrations/`.
  2. `prisma/schema.postgres.prisma` (and a provider-switching script `npm run db:use:postgres` / `npm run db:use:sqlite`) targeting PostgreSQL (`provider = "postgresql"`) for production deployments.
  3. A deterministic curriculum seed (`prisma/seed.ts`) that populates ONLY the authentic curriculum data (all 374 AP problem sets across 71 chapters and all real interactive problems, worked multi-step solutions, slips, and figure ghosts) and an optional CLI-generated initial bootstrap invitation code—never creating dummy users or demo accounts.
- **Consequences**: Developers and CI can run `npx prisma migrate deploy && npx prisma db seed` immediately against local SQLite, while production deployments can target PostgreSQL seamlessly.

---

## ADR-003: Authentication — Auth.js / NextAuth with Invite-Only Registration
- **Status**: Accepted
- **Context**: While the original `atlasclass.app` used passwordless magic links and Google OAuth, our production application requires **invite-only registration** with single-use or expiring invitation codes, roles, revocation, and audit logging, while preserving the smooth login/signup UX.
- **Decision**: Implement **Auth.js (NextAuth v5)** alongside dedicated auth API endpoints (`/api/auth/register`, `/api/auth/login`, `/api/auth/magic-link`, `/api/auth/[...nextauth]`) supporting:
  1. **Invite-Only Registration**: New users cannot self-register without a valid, unrevoked, unexpired invitation code that still has remaining uses (`usedCount < maxUses`).
  2. **Credentials & Token Hash Flows**: Users register with an invitation code + email + password (or magic-link token hash) and receive a database-backed/JWT-verified session.
  3. **Role Assignment from Invitation**: Each `InvitationCode` specifies the target role (`STUDENT`, `TEACHER`, or `ADMIN`) and optional plan grant (e.g., `FREE`, `PREMIUM`, or class seat domain), which is atomically assigned to the new `User` inside a database transaction that increments `InvitationCode.usedCount` and records an `InvitationRedemption` and `AuditLog` entry.
- **Consequences**: Unauthorized sign-ups are strictly blocked at the API and database layer; every registered user has a cryptographic provenance chain linking back to the exact invitation code that admitted them.

---

## ADR-004: Role-Based Access Control (RBAC) & Immediate Access Revocation
- **Status**: Accepted
- **Context**: The platform serves three distinct roles (`STUDENT`, `TEACHER`, `ADMIN`) and requires immediate revocation of both invitation codes and user access.
- **Decision**:
  1. **Roles**:
     - `STUDENT`: Accesses all 34 interactive 3D chapters, equation sheets, sample problems, up to `freeLimit` (default 3) unlocked practice sets (or all 374 sets + AI tutor if `premium`), and personal referral/subscription settings.
     - `TEACHER`: All `STUDENT` capabilities plus teacher class access request submission, class seat management (`/teachers/`), and ability to generate student invitation codes for their approved class.
     - `ADMIN`: Full access to the Admin Security & Operations Console (`/admin/` and `/api/admin/*`) to issue single-use/multi-use expiring invitation codes, revoke invitation codes, change user roles, revoke/suspend user accounts (`status = 'REVOKED'`), approve teacher requests, and inspect the immutable audit log.
  2. **Immediate Revocation Enforcement**: Every authenticated request validates the user's current `status` and `sessionVersion` against the database. When an administrator revokes a user (`status = 'REVOKED'`) or revokes an invitation code (`status = 'REVOKED'`), active sessions for that user are immediately invalidated and logged in `AuditLog`.
- **Consequences**: Fine-grained authorization across UI routes and API endpoints with zero window for revoked users or revoked invite codes to continue operating.

---

## ADR-005: Immutable Security & Operational Audit Logging
- **Status**: Accepted
- **Context**: Security-sensitive lifecycle events (invitation creation, invitation redemption, invitation revocation, user registration, login success/failure, role change, user revocation, practice set unlock, subscription change, teacher request, account deletion) must be auditable.
- **Decision**: Create a dedicated `AuditLog` table in Prisma recording `id`, `createdAt`, `actorId`, `actorEmail`, `action`, `targetType`, `targetId`, `ipAddress`, `userAgent`, `metadata` (JSON string), and `severity` (`INFO`, `WARN`, `CRITICAL`). Expose a helper ` writeAuditLog(...)` invoked inside all auth, invitation, RBAC, and billing mutations, and expose a filterable Audit Log viewer in `/admin/` and `/api/admin/audit-logs`.
- **Consequences**: Complete forensic traceability of all security and administrative actions.

---

## ADR-006: Client Compatibility Bridge (`/js/app.js` & `/js/drawer.js`)
- **Status**: Accepted
- **Context**: All 34 chapter pages and marketing pages import `/js/app.js` (`sb`, `status`, `fn`, `CHAPTERS`, `SUBJECT_OF`, `loginUrl`, `landing`) and `/js/drawer.js` (`open_samples`, `open_set`, `submit_answer`).
- **Decision**: Implement `/js/app.js` so its exported `sb` client and `status()` / `fn()` helpers communicate directly with our local Next.js API routes (`/api/rpc/my_status`, `/api/rpc/open_samples`, `/api/rpc/open_set`, `/api/rpc/submit_answer`, `/api/rpc/my_referrals`, `/api/rpc/claim_referral`, `/api/rpc/my_classes`, `/api/problem_sets`, `/api/attempts`, `/api/fn/[name]`, and `/api/auth/*`).
- **Consequences**: All 34 chapter pages, `/practice/`, `/pricing/`, `/teachers/`, `/login/`, and `/account/` work seamlessly against our local Next.js + Prisma backend with zero external network calls to Supabase.
