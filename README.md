# Atlas — Interactive 3D Textbooks for AP Science and Math

Production-ready full-stack web application replicating [atlasclass.app](https://atlasclass.app/), built with **Next.js (App Router)**, **Auth.js (NextAuth v5)**, **Prisma ORM** (SQLite for local development, PostgreSQL for production), **Three.js**, and **KaTeX**, enhanced with **Invite-Only Registration**, **Role-Based Access Control (`STUDENT`, `TEACHER`, `ADMIN`)**, **Immediate Account & Invitation Revocation**, and **Immutable Audit Logging**.

## Key Features

- **34 Interactive 3D Textbook Chapters**:
  - **AP Physics 1 & C (15 chapters)**: Kinematics, Newton's Laws, Circular Motion, Work & Energy, Momentum, Oscillations, Rotation, Fluids, Electrostatics, Gauss's Law, Electric Potential, Capacitors, Circuits, Magnetic Fields, Induction.
  - **AP Calculus AB & BC (10 chapters)**: Limits & Continuity, Derivatives, Composite/Implicit/Inverse Functions, Derivatives in Context, Analyzing Functions, Integration & Accumulation, Differential Equations, Applications of Integration, Parametric/Polar/Vector Functions, Infinite Series.
  - **AP Statistics (9 chapters)**: One-Variable Data, Two-Variable Data, Collecting Data, Probability & Random Variables, Sampling Distributions, Inference for Proportions, Inference for Means, Chi-Square Tests, Inference for Slopes.
- **374 AP-Style Problem Sets & 3D Figure Synchronization**:
  - Live numeric tolerance grading ($\pm 1.5\%$), targeted misconception slip hints, 3D red ghost markers on wrong numeric answers (`your answer: X`), multi-step worked solutions synchronized with the 3D scene, and Premium AI follow-up tutoring.
- **Searchable AP Equation Sheets**:
  - Live instant filtering and dark/light theme support for `/physics/equations/`, `/calculus/equations/`, and `/statistics/equations/`.
- **Invite-Only Registration, RBAC, Revocation & Audit Logging**:
  - Single-use, expiring, role-scoped (`STUDENT`, `TEACHER`, `ADMIN`), optionally email-locked invitation codes (`ATLAS-STU-XXXX`, `ATLAS-TCH-XXXX`, `ATLAS-ADM-XXXX`).
  - Zero dummy data or demo user accounts seeded by default.
  - Full Admin Console at `/admin/` for Invitation lifecycle management, User Role & Revocation management, Teacher verification approvals, and Audit Log inspection.

## Engineering Documentation

All architecture, specification, and exploration artifacts are located in `docs/`:
- [`docs/EXPLORATION_COVERAGE.md`](docs/EXPLORATION_COVERAGE.md)
- [`docs/ADR.md`](docs/ADR.md)
- [`docs/PRD.md`](docs/PRD.md)
- [`docs/SPEC.md`](docs/SPEC.md)
- [`docs/ARCHITECTURE_AND_DATA_MODEL.md`](docs/ARCHITECTURE_AND_DATA_MODEL.md)
- [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md)
- [`docs/TASK_BACKLOG.md`](docs/TASK_BACKLOG.md)
- [`docs/ACCEPTANCE_CRITERIA.md`](docs/ACCEPTANCE_CRITERIA.md)
- [`docs/FEATURE_PARITY.md`](docs/FEATURE_PARITY.md)

## Quick Start (Local Development with SQLite)

```bash
# 1. Install dependencies
npm install

# 2. Run SQLite migrations and seed authentic curriculum data (0 dummy users)
npx prisma migrate dev
npm run db:seed

# 3. Generate a bootstrap ADMIN invitation code via CLI
npm run invite:create -- --role ADMIN --expires-in-hours 72

# 4. Start the server
npm run dev
```

## Production Deployment (PostgreSQL & Docker)

```bash
docker compose up --build -d
```
