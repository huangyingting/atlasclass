# Technical & Functional Specification (`SPEC.md`)

## 1. Visual Design System & Typography
Replicated directly from `atlas.css`, `app.css`, `nav.css`, `subjects.css`, `drawer.css`, and `physics/engine/book.css`:

### 1.1 Color Palette (Light & Dark Modes)
| Token | Light Mode (`:root`) | Dark Mode (`[data-theme="dark"]`) | Purpose |
|---|---|---|---|
| `--bg` | `#ece9e2` | `#121210` | Warm stone outer canvas background |
| `--paper` | `#f7f5f0` | `#1b1a17` | Book page & primary surface background |
| `--card` | `#ffffff` | `#23221e` | Elevated interactive card / input surface |
| `--ink` / `--strong` | `#141413` | `#ece9e1` | Primary display and heading ink |
| `--body` | `#2c2b29` | `#c8c4ba` | Body copy ink |
| `--muted` | `#6e6c66` | `#8c887f` | Secondary captions, kickers, metadata |
| `--faint` | `#d8d4cb` | `#2e2d28` | Hairline 1px borders and dividers |
| `--accent` | `#e5484d` | `#e5484d` | Primary vector/highlight crimson red |
| `--blue` | `#2563eb` | `#3b82f6` | Secondary vector/highlight cobalt blue |
| `--ok` | `#2f8f5b` | `#3dd68c` | Correct answer & free-set badge green |

### 1.2 Typography (`fonts/fonts.css`)
- **Display & Headings (`--serif`)**: `'EB Garamond', Georgia, serif` (weights 400, 400i, 500, 600; fluid `clamp()` sizing).
- **UI & Prose (`--sans`)**: `'Inter', -apple-system, sans-serif` (weights 400, 500, 600).
- **Readouts, Kickers & Badges (`--mono`)**: `'JetBrains Mono', monospace` (weight 500; uppercase kickers with `letter-spacing: 0.08em`).
- **Mathematics**: Pre-rendered and dynamic **KaTeX** (`0.16.22`).

---

## 2. Route & Page Specifications

### 2.1 Public & Marketing Routes
1. **`GET /` (Homepage)**:
   - Top bar (`#top`): Brand `Atlas`, links (`Subjects`, `Practice`, `Premium`, `Teachers`), auth link (`Log in` or `Account` pill + `Admin` link for admins), theme toggle (`.theme`), mobile popover menu button (`popovertarget="site-menu"`).
   - Hero section: Left column with headline *"Every figure turns. Every part comes apart."*, primary CTAs (`Open a textbook` -> `/subjects/`, `Try practice` -> `/practice/`). Right column with `#hero-stage` running `js/hero.js` across 6 interactive 3D slides (`kinematics`, `rotation`, `applications`, `magnetism`, `parametric`, `circular`), prev/next arrows, slide dots, live `#hero-readout`, and `#hero-plate` breakdown card.
   - Feature sections: Interactive breakdown showcase, Practice on the 3D figure showcase, Subject grid, Pricing summary, and 3D tumbling books footer (`js/footer.js`).
2. **`GET /subjects/`**:
   - Displays live interactive subjects (`Physics` 15 chapters, `Calculus` 10 chapters, `Statistics` 9 chapters) with chapter number, title, and subtitle links, plus curriculum outlines for `Biology`, `Chemistry`, `US History`, `Macroeconomics`, and `US Government`.
3. **`GET /physics/`, `GET /calculus/`, `GET /statistics/`**:
   - Interactive 3D cover banner (`/<subject>/engine/cover.js`) with chapter cards showing cover thumbnail (`/<subject>/img/<chapter>.jpg`), chapter number, title, subtitle, AP C badge, and section list linking directly to `/<subject>/<chapter>/#<sectionIndex>`.
4. **`GET /physics/equations/`, `GET /calculus/equations/`, `GET /statistics/equations/`**:
   - Search input (`#q`) with live counter (`#count`) filtering `<section class="ch">` and `<tr data-s="...">` rows; each row links to `/<subject>/<chapter>/#<page>`.
5. **`GET /practice/`**:
   - Displays all problem sets grouped by subject and chapter. When authenticated, queries `/api/rpc/my_status` and `/api/attempts` to show free-set quota banner (`You have X of 3 free sets left`) and per-set completion counts (`done / n_problems`).
6. **`GET /pricing/`**:
   - Handles `?locked=1` banner (*"You've used your free sets..."*) and `?ref=CODE` referral banner (calls `claim_referral` when signed in, or stores `localStorage.ref` and prompts signup).
   - Displays Monthly ($19.99/mo), Annual ($59.99/yr), and Lifetime ($199 once) cards, Free vs Premium feature comparison table, Referral card (`Share your link: 5 friends = free Lifetime`), and FAQ.
7. **`GET /teachers/`**:
   - Unauthenticated: Shows `#out` gate prompting sign-in with school email.
   - Authenticated: Shows `#classes` (from `my_classes` RPC with `Buy N seats` button invoking `class-checkout`) and `#f` request form (`name`, `school`, `staff_url`, `domain`, `students`, `course`, `note`) invoking `teacher-request`. Rejects personal webmail domains (`gmail.com`, `yahoo.com`, `outlook.com`, `hotmail.com`, `icloud.com`, `aol.com`, `proton.me`, `fldubai.com` when testing webmail rejection or domain mismatch).
8. **`GET /about/`, `GET /terms/`, `GET /privacy/`**:
   - Editorial narrow-column layout (`main.narrow`) with full prose and 3D footer.

### 2.2 Authentication, Invite-Only Registration, Account, & Admin Routes
9. **`GET /login/`**:
   - Supports **Sign In** (existing users via Email + Password or Magic Link `#token_hash`) and **Invite-Only Registration** (new users providing a valid `Invitation Code`, `Email`, `Name`, and `Password`, or redeeming an invitation code during magic-link signup).
   - Preserves the original Atlas magic-link `#token_hash` two-step confirmation button (`Finish signing in`) so automated email scanners cannot consume single-use tokens.
10. **`GET /account/` & `GET /account/subscription/`**:
    - Shows signed-in user email, role badge (`STUDENT`, `TEACHER`, `ADMIN`), plan status (`Free` or `Premium`), free sets used (`X of 3 used`), referral link & progress (`my_referrals`), Sign out button, Delete account confirmation flow (`delete-account`), and subscription management (`/account/subscription/` calling `billing` endpoint for `summary`, `switch`, `cancel`, `resume`, `card`).
11. **`GET /admin/` (Admin Security, Invitations & Audit Console)**:
    - Restricted to `role === 'ADMIN'` (returns 403 / redirects non-admins).
    - **Invitation Codes Tab**: Generate single-use (`maxUses: 1`) or multi-use expiring invitation codes with target role (`STUDENT`, `TEACHER`, `ADMIN`), optional Premium entitlement, custom expiration window, and note; copy invite link (`/login/?invite=CODE`); revoke active codes (`status = 'REVOKED'`).
    - **Users & RBAC Tab**: View all registered users, their role, status (`ACTIVE` / `REVOKED`), invitation code used, free sets used, Premium status; change user role; revoke or restore user access immediately.
    - **Teacher Requests Tab**: Review and approve/reject submitted teacher class requests.
    - **Audit Logs Tab**: Filterable, real-time view of all security and operational audit events (`AuditLog`).

---

## 3. API & RPC Contract Specification

### 3.1 Supabase-Compatible RPC & REST Endpoints (Used by `/js/app.js` & `/js/drawer.js`)
- `POST /api/rpc/my_status`: Returns `{ premium, plan, status, period_end, cancels, via, free_limit, free_sets, role }`.
- `POST /api/rpc/open_samples`: Body `{ p_chapter, p_lang }` -> Returns array of sample problems `[{ id, kind, prompt, choices, scene, unit }]`.
- `POST /api/rpc/open_set`: Body `{ p_set, p_lang }` -> Verifies user is authenticated and either `premium` or `p_set` is in `free_sets` or `free_sets.length < free_limit` (atomically adding `p_set` to `FreeSetGrant` and writing an `AuditLog`). If quota exceeded, returns HTTP 402/403 with `{ message: "paywall", hint: "paywall" }`. Returns `{ set, problems }`.
- `POST /api/rpc/submit_answer`: Body `{ p_problem, p_answer, p_lang }` -> Grades `p_answer` against the problem's canonical solution:
  - Numeric (`kind === 'num'`): `p_answer === null` reveals solution (`correct: false, value, steps, solution, slips, ghost`). Otherwise validates numeric input (returns `{ code: '22023', message: 'answer must be a number' }` if invalid), checks tolerance `|x - value| <= max(|value| * 0.015, 1e-3)`, records `Attempt` if authenticated, and returns `{ correct, value, steps, solution, slips, ghost }`.
  - Multiple choice (`kind === 'mcq'`): Checks `p_answer === answer`, records `Attempt`, returns `{ correct, answer, steps, solution }`.
  - Free-response (`kind === 'fr'`): Returns `{ correct: Boolean(p_answer?.self), steps, solution }`.
- `POST /api/rpc/my_referrals`: Returns `{ code, counted, pending, needed: 5, lifetime, reward, discount }`.
- `POST /api/rpc/claim_referral`: Body `{ p_code }` -> Links referrer code to current user (`status: 'ok' | 'self' | 'already' | 'invalid'`).
- `POST /api/rpc/my_classes`: Returns approved teacher classes `[{ id, school, domain, seats, until, paid }]`.
- `GET /api/problem_sets`: Supports `?chapter=eq.<ch>` and ordering by `chapter_no, position`.
- `GET /api/attempts`: Returns user's attempted `problem_id` rows filtered by `like` or `in`.
- `POST /api/fn/[name]`:
  - `ask`: Context-aware tutor response using the current question, student tries, worked steps, 3D figure state, and textbook page context.
  - `checkout`: Creates/simulates plan checkout (`monthly`, `annual`, `lifetime`) and updates subscription state with audit log.
  - `class-checkout`: Marks teacher class seats paid and activates domain licensing.
  - `teacher-request`: Validates school domain (blocks webmail domains with `{ message: "Please sign in with your school email address, not a personal one.", hint: "webmail" }`), persists `TeacherClassRequest`, and logs audit event.
  - `billing`: Handles `summary`, `cancel`, `resume`, `switch`, and `card` actions for `/account/subscription/`.
  - `delete-account`: Deletes the user's account and records an audit log entry.

### 3.2 Auth, Invitation, & Admin Endpoints
- `POST /api/auth/register`: Validates `invitationCode` (exists, `status === 'ACTIVE'`, not expired, `usedCount < maxUses`), creates `User` with role from invitation, increments `usedCount`, creates session, and writes `INVITATION_REDEEMED` + `USER_REGISTERED` audit logs.
- `POST /api/auth/login`: Authenticates existing user (rejecting `status === 'REVOKED'` with 403 and logging `AUTH_LOGIN_REVOKED`), issues session or magic-link `#token_hash`, and writes `AUTH_LOGIN_SUCCESS` audit log.
- `POST /api/auth/verify-otp`: Verifies `#token_hash` magic link (redeeming invitation code if attached for new users).
- `GET / POST / PATCH /api/admin/invitations`: List, create, and revoke invitation codes (`ADMIN` only).
- `GET / PATCH /api/admin/users`: List users, update role (`STUDENT` / `TEACHER` / `ADMIN`), revoke/restore user access, toggle Premium (`ADMIN` only).
- `GET / PATCH /api/admin/teacher-requests`: List and approve/reject teacher requests (`ADMIN` only).
- `GET /api/admin/audit-logs`: Paginated, filterable security audit logs (`ADMIN` only).
