# Product Requirements Document (PRD) — Atlas Interactive 3D Textbooks

## 1. Product Vision & Overview
**Atlas** ("Interactive 3D textbooks for AP science and math") is an interactive educational platform that replaces static textbook diagrams with real-time, manipulable 3D figures rendered as pen-and-ink illustrations on paper. Every figure turns in 3D, pauses on hover, and explodes into labeled parts on click (`Breakdown` mode). Alongside the 34 chapters across AP Physics, AP Calculus, and AP Statistics, Atlas provides 374 AP-style practice sets where worked solutions play out step-by-step directly on the 3D figure—drawing the student's wrong numerical answer as a translucent red "ghost" on the figure and diagnosing common mathematical/physical slips—plus a context-aware AI tutor and enterprise-grade invite-only access control.

---

## 2. Target Personas
1. **AP Student (`STUDENT`)**:
   - Reads interactive 3D chapters across Physics (1/2/C), Calculus (AB/BC), and Statistics.
   - Manipulates 3D figures, clicks assemblies to read component breakdowns, and uses searchable equation sheets.
   - Tries free sample questions in every chapter, unlocks up to 3 free full practice sets on a Free account, or upgrades to Premium (or uses a school seat / referral reward) to unlock all 374 sets and the AI follow-up tutor.
2. **AP Teacher (`TEACHER`)**:
   - Uses Atlas in classroom instruction on projector/desktop.
   - Submits a school verification request on `/teachers/` using an institutional email domain (personal webmail domains such as `@gmail.com` are rejected).
   - Receives complimentary Teacher Premium and can purchase/provision student class seats ($30/seat/year) or issue class invitation codes.
3. **Platform Administrator (`ADMIN`)**:
   - Manages invite-only registration by generating single-use or multi-use expiring invitation codes assigned to specific roles (`STUDENT`, `TEACHER`, `ADMIN`) and optional Premium entitlements.
   - Revokes unused or compromised invitation codes.
   - Manages registered users, updates roles, revokes/restores user access with immediate session invalidation, approves teacher class requests, and audits all platform activity via the immutable Audit Log.

---

## 3. Core Functional Requirements

### 3.1 Interactive 3D Textbooks & Curriculum
- **FR-01 (3D Hero & Landing Page)**: The homepage (`/`) must render the 6-slide interactive Three.js hero (`kinematics`, `rotation`, `applications`, `magnetism`, `parametric`, `circular`) with live readout, click-to-breakdown panel, subject cards, practice preview, pricing overview, and animated 3D tumbling books in the footer.
- **FR-02 (Subject Portals & Catalog)**: `/subjects/` must display all 8 AP subjects (Physics, Calculus, Statistics active with 34 chapters; Biology, Chemistry, US History, Macroeconomics, Government listed with chapter outlines). `/physics/`, `/calculus/`, and `/statistics/` must render interactive 3D subject covers (`engine/cover.js`) and chapter grids.
- **FR-03 (34 Interactive 3D Chapters)**: Every chapter route (`/<subject>/<chapter>/`) must render:
  - Left textbook page (`#sheet`) with KaTeX math, tables, SVG charts, cross-reference hover/click callouts (`xrefs.js`), and page-turn leaf animation (`#leaf`).
  - Right 3D figure canvas (`#gl`) with custom paper-and-ink postprocessing (`render.js`), camera interpolation across pages, orbit drag, shift-drag pan, double-click reset, hover pause, live numeric HUD (`#readout`), and click-to-explode component breakdowns (`#plate` + `#facts`).
  - Top navigation bar with desktop page dots (`#dots`), mobile compact pager (`#pgprev`, `#pagenum`, `#pgnext`), native Table of Contents popover (`#toc`), theme toggle, and site menu.
  - Mobile upright docked figure mode (`max-width: 900px`) with scroll-linked `--shrink` collapsing and full-screen 3D explore mode (`#xopen`, `#xhold`, `#xchips`).
- **FR-04 (Searchable Equation Reference Sheets)**: `/physics/equations/`, `/calculus/equations/`, and `/statistics/equations/` must display all course equations grouped by chapter, linked directly to the exact chapter page where each equation is derived, with live search filtering (`#q`).

### 3.2 AP Practice Sets, 3D Worked Steps, & AI Tutor
- **FR-05 (Practice Catalog & Slide-Out Drawer)**: `/practice/` lists all problem sets grouped by subject and chapter with live user completion counts (`done / n_problems`). Every chapter hosts the slide-out Practice Drawer (`#pd`) with sample questions (no login required) and 5–6 chapter problem sets.
- **FR-06 (Grading, Slip Detection, & 3D Ghost Rendering)**:
  - Supports numerical (`num`), multiple-choice (`mcq`), and self-graded free-response (`fr`/`reveal`) questions.
  - Wrong answers allow unlimited retries (`tries`) without revealing the answer.
  - If a wrong numerical answer is within 2% of a known misconception (`slips`), display the specific diagnostic slip hint (`.pd-slip`).
  - When answered right or when the student clicks `Show the answer` (`giveup`), reveal the multi-step worked solution (`WORKING · STEP k OF N`). Each step drives `window.__atlas.question.step(...)` to animate/pose the 3D figure and renders the student's wrong number as a translucent red ghost marker (`your answer: X`) on the 3D scene.
- **FR-07 (Free Set Quota & Paywall)**: Free authenticated users receive 3 free practice sets (`free_limit = 3`) with an explicit confirmation prompt before unlocking a set. Attempting to open a 4th set displays the paywall prompt linking to `/pricing/?locked=1`.
- **FR-08 (Context-Aware AI Tutor)**: Premium users can open `Ask a follow-up` under any practice question to ask natural-language questions. The backend receives the full question prompt, student tries, active worked step, visible 3D figure labels/readout, and current textbook page text (`askContext`), returning KaTeX-formatted explanations.

### 3.3 Invite-Only Registration, RBAC, Revocation, & Audit Logging
- **FR-09 (Invite-Only Registration)**: Registration on `/login/` requires a valid `invitationCode`. Codes support `maxUses` (default 1 for single-use), `expiresAt` timestamp, assigned `role` (`STUDENT`, `TEACHER`, `ADMIN`), and optional `grantPremium` flag. Expired, depleted, or revoked codes are rejected with clear error messages.
- **FR-10 (Bootstrap & Admin Invitation Management)**: Provide a CLI script and Admin UI (`/admin/`) to create, inspect, and revoke invitation codes without seeding any dummy or demo user accounts.
- **FR-11 (RBAC & User Revocation)**: Enforce `STUDENT`, `TEACHER`, and `ADMIN` roles across API routes and UI pages. Administrators can change a user's role or revoke/restore a user's account (`status = 'REVOKED'`), immediately invalidating their session.
- **FR-12 (Immutable Audit Logging)**: Record all authentication, invitation lifecycle, role change, user revocation, practice set unlock, referral claim, billing, and teacher request events in `AuditLog`, viewable and filterable in `/admin/`.

---

## 4. Non-Functional Requirements
- **NFR-01 (Zero Dummy Data / No Demo Accounts)**: The database must never contain fake/dummy users or placeholder curriculum text. All 34 chapters, 374 problem sets, and worked solutions must be authentic curriculum data.
- **NFR-02 (Responsive & Accessible UI)**: Support desktop (`1440×900`), tablet (`900px` breakpoint), and mobile (`390×844`) viewports, light and dark themes (`data-theme="light|dark"` with View Transitions API), and `prefers-reduced-motion`.
- **NFR-03 (Dual Database Portability)**: Full compatibility with SQLite in local development/testing and PostgreSQL in production via Prisma.
