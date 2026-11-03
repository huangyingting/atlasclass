# Exploration Coverage Report — `https://atlasclass.app/`

## 1. Executive Summary
We performed a systematic, automated Playwright and network-level exploration of `https://atlasclass.app/` (**Atlas · Interactive 3D textbooks for AP science and math**). All authorized public and authenticated pages, interactive 3D textbook scenes, slide-out practice sets, worked step-by-step figure animations, equation reference sheets, referral flows, teacher class seat workflows, account/subscription management pages, and responsive/theme variations were explored, captured, and archived locally.

- **Total English Routes Discovered & Verified**: 49 routes (plus 10 additional localized prefixes: `id`, `ms`, `vi`, `zh`, `zh-tw`, `ja`, `ko`, `hi`, `es`, `pt` = 528 total sitemap URLs).
- **Total Static 3D Textbook Modules Mirrored**: 338 files across all 34 live interactive chapters (`physics`, `calculus`, `statistics`), including `main.js`, `pages.js`, `world.js`, `model.js`, `practice.js`, `engine/book.js`, `engine/render.js`, `engine/parts.js`, `engine/tex.js`, `engine/xrefs.js`, `engine/cover.js`, `kit.js`, `dist.js`, 54 `woff2` font files, and chapter cover images.
- **Total Supabase Problem Sets & Worked Solutions Captured**: 374 problem sets across 71 chapters (8 AP subjects), 184 open sample problems with full multi-step worked solutions (`steps`, `value`, `answer`, `solution`, `slips`, `ghost`), plus unlocked full sets (`kinematics-1`, `limits-1`, `onevar-1`) and 680+ in-page practice problems.
- **Total Playwright Screenshots Captured**: 41 high-resolution screenshots (`docs/exploration/screenshots/01-*.png` through `41-*.png`).

---

## 2. Route Inventory & Coverage Matrix

| Category | Route(s) | Status | HTML Archived | Screenshot(s) | Key Capabilities Observed |
|---|---|---|---|---|---|
| **Homepage & 3D Hero** | `/` | Explored | `01-home.html` | `01-home-desktop.png`, `01-home-dark.png`, `01-home-mobile.png`, `01-home-mobile-menu.png`, `22-home-hero-slide2.png` | 6-slide interactive Three.js hero (`kinematics`, `rotation`, `applications`, `magnetism`, `parametric`, `circular`), live 3D breakdown on click, subject catalog, practice preview, pricing summary, animated 3D book footer (`footer.js`). |
| **Subjects Catalog** | `/subjects/` | Explored | `02-subjects.html` | `02-subjects-desktop.png` | All 8 AP courses: Physics (15 ch), Calculus (10 ch), Statistics (9 ch) live; Biology (8 ch), Chemistry (9 ch), US History (9 ch), Macroeconomics (6 ch), US Government (5 ch) listed with unit breakdowns. |
| **Practice Index** | `/practice/` | Explored (Anon & Auth) | `03-practice.html` | `03-practice-desktop.png`, `20-practice-authenticated.png` | Pre-rendered catalog of 177 live problem sets (374 in DB) grouped by subject and chapter, with per-set completion badges and free-set quota banner (`3 of 3 free sets left`). |
| **Premium Pricing** | `/pricing/`, `/pricing/?locked=1`, `/pricing/?ref=CODE` | Explored (Anon & Auth) | `04-pricing.html` | `04-pricing-desktop.png`, `19-pricing-authenticated.png`, `37-pricing-locked-and-ref.png` | Monthly ($19.99/mo), Annual ($59.99/yr · $5/mo), Lifetime ($199 once), Free vs Premium comparison table, Referral program (`claim_referral`, `my_referrals`, 5 friends = free Lifetime), FAQ. |
| **Teachers Portal** | `/teachers/` | Explored (Anon & Auth) | `05-teachers.html` | `05-teachers-desktop.png`, `36a-teachers-authenticated-form.png`, `36-teachers-gmail-validation-error.png` | 4-step school verification workflow, free teacher Premium, $30/seat student licensing, `my_classes()` RPC, `teacher-request` Edge Function with personal webmail rejection (`@gmail.com`). |
| **Authentication** | `/login/`, `/login/#token_hash=...` | Explored | `06-login.html` | `06-login-desktop.png`, `15-login-link-sent.png`, `16-login-finish-signin.png`, `17-post-login-landing.png` | Google OAuth + OTP Magic Link email (`signInWithOtp`), two-step scanner-safe `#token_hash` verification (`Finish signing in` button), new-user onboarding redirect to `/physics/kinematics/`. |
| **Account & Billing** | `/account/`, `/account/subscription/` | Explored (Anon & Auth) | `15-account.html`, `16-account-subscription.html`, `account-authenticated.html` | `18-account-authenticated.png`, `21-account-subscription-authenticated.png` | Displays signed-in email, plan status (`Free` / `Premium`), free sets used (`0 of 3 used`), referral link generator (`https://atlasclass.app/pricing/?ref=0F38AFD7`), sign-out, account deletion (`delete-account`), and Stripe subscription management (`billing` Edge Function). |
| **Subject Portals** | `/physics/`, `/calculus/`, `/statistics/` | Explored | `07-physics.html`, `08-calculus.html`, `09-statistics.html` | `07-physics-desktop.png`, `08-calculus-desktop.png`, `09-statistics-desktop.png` | Interactive 3D cover canvas (`engine/cover.js`), chapter cards with section lists, thumbnails, and AP C tags. |
| **Equation Sheets** | `/physics/equations/`, `/calculus/equations/`, `/statistics/equations/` | Explored | `17-physics-equations.html`, `18-calculus-equations.html`, `19-statistics-equations.html` | `34-physics-equations-full.png`, `35-physics-equations-filtered.png` | Complete KaTeX-rendered equation tables linked to specific textbook chapter & section (`#page`), with instant client-side search filtering (`#q`). |
| **Physics Chapters (15)** | `/physics/{kinematics,newton,circular,energy,momentum,oscillations,rotation,fluids,electrostatics,gauss,potential,capacitors,circuits,magnetism,induction}/` | All 15 Mirrored & Verified | `10-lesson-kinematics.html`, `11-lesson-rotation.html` + `mirror/physics/*` | `10-lesson-kinematics-desktop.png`, `11-lesson-rotation-desktop.png`, `23`–`33`, `38`–`41` | Scroll-driven 3D page turns, Three.js r186 paper-and-ink postprocessing renderer, click-to-explode part breakdowns, live readout HUD, slide-out practice drawer. |
| **Calculus Chapters (10)** | `/calculus/{limits,derivatives,composite,rates,extrema,integrals,diffeq,applications,parametric,series}/` | All 10 Mirrored & Verified | `mirror/calculus/*` | Verified via mirror & headless load | Full 3D calculus surfaces, solids of revolution, tangent/secant assemblies, Riemann sums, vector fields, series convergence. |
| **Statistics Chapters (9)** | `/statistics/{onevar,twovar,collecting,probability,sampling,proportions,means,chisquare,slopes}/` | All 9 Mirrored & Verified | `mirror/statistics/*` | Verified via mirror & headless load | 3D histograms, Galton/sampling boards, normal/t/chi-square distributions (`dist.js`), regression slopes, confidence intervals. |
| **Static / Legal** | `/about/`, `/terms/`, `/privacy/` | Explored | `12-about.html`, `13-terms.html`, `14-privacy.html` | `12-about-desktop.png`, `13-terms-desktop.png`, `14-privacy-desktop.png` | Mission statement, terms of service, privacy policy. |

---

## 3. Interactive Scenarios Executed

1. **Scenario 1 — 3D Hero Carousel & Interactive Figure Inspection (`/`)**:
   - Verified 6 interactive 3D scenes (`kinematics`, `rotation`, `applications`, `magnetism`, `parametric`, `circular`), prev/next arrows, dot navigation, orbit drag, and click-to-explode breakdown panel (`#hero-plate`).
2. **Scenario 2 — 3D Textbook Page Turning, TOC Popover, & Assembly Breakdown (`/physics/kinematics/`)**:
   - Verified desktop dot navigation (`#dots`), mobile/compact pager (`#pgprev`, `#pagenum`, `#pgnext`), native `#toc` popover, 3D page leaf rotation (`#leaf`), and clicking a 3D assembly (`Position–time graph`) to open `#plate` with live calculated state facts (`slope = v`) and exploded 3D parts.
3. **Scenario 3 — Temp-Email Registration & Scanner-Safe Magic Link Authentication (`/login/`)**:
   - Created a real temporary inbox (`alexcartercslvie@fldubai.com` via `mail.tm`), requested a sign-in link, captured the email (`Welcome to Atlas: your sign-in link`), verified the `#token_hash` landing screen (`Finish signing in` button), and confirmed automatic redirect for new accounts to `/physics/kinematics/`.
4. **Scenario 4 — Practice Drawer: Free Set Confirmation, Slip Detection, Ghost on 3D Figure, & Worked Steps**:
   - Opened the Practice Drawer (`#pd`), viewed the 5 chapter sets and 3 sample questions, unlocked `kinematics-1` (`1 of 3 free sets`), submitted a known misconception answer (`14.7 m`) to trigger the targeted slip feedback (`"That is three times the old height: height does not grow in step with speed."`), clicked `Show the answer` (`giveup`), verified that the 3D figure rendered the translucent red ghost sphere (`your answer: 14.7 m`) alongside the true peak (`h = 44.1 m`), stepped through the 4-step worked solution (`Next step` / `Back`), and verified the soft/hard paywall (`41-drawer-paywall-limit-reached.png`) after using all 3 free sets.
5. **Scenario 5 — Equation Reference Sheet Search (`/physics/equations/`)**:
   - Verified instant filtering by keyword (`"kinematic"`), hiding non-matching chapter sections and updating the live match counter (`5 shown`).
6. **Scenario 6 — Edge & Error States (`/teachers/`, `/pricing/?locked=1&ref=CODE`)**:
   - Submitted `@gmail.com` on the authenticated Teacher class request form and confirmed server-side validation error (`"Please sign in with your school email address, not a personal one."`).
   - Verified `?locked=1` paywall banner and `?ref=CODE` referral claim banner on `/pricing/`.
7. **Scenario 7 — Mobile Responsive Layout & Full-Screen 3D Explore Mode (`390×844`)**:
   - Verified mobile topbar menu popover, upright docked 3D figure with scroll-linked `--shrink` collapsing, and full-screen 3D explore mode (`#xopen`) with pause button (`#xhold`) and assembly breakdown chips (`#xchips`).
