# Architecture & Data Model (`ARCHITECTURE_AND_DATA_MODEL.md`)

## 1. System Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        Browser Client (Desktop & Mobile)                     │
│                                                                              │
│  ┌──────────────────────────────┐   ┌─────────────────────────────────────┐  │
│  │  Marketing, Catalog, Auth,   │   │  34 Interactive 3D Chapters         │  │
│  │  Pricing, Teachers, Account, │   │  • Three.js r186 + EffectComposer   │  │
│  │  Equations, & Admin Console  │   │  • Paper-and-Ink Edge Shader        │  │
│  │  • Theme & View Transitions  │   │  • Click-to-Explode Breakdowns      │  │
│  │  • 11-Language i18n Routing  │   │  • Practice Drawer + 3D Step/Ghost  │  │
│  └──────────────┬───────────────┘   └──────────────────┬──────────────────┘  │
│                 └───────────────────┬──────────────────┘                     │
│                                     ▼                                        │
│                    Client Bridge (/js/app.js & /js/drawer.js)                │
└─────────────────────────────────────┼────────────────────────────────────────┘
                                      │ HTTPS / JSON (Session Cookie + Bearer)
┌─────────────────────────────────────▼────────────────────────────────────────┐
│                      Next.js App Router Server (Node.js)                     │
│                                                                              │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌──────────────┐  │
│  │ Auth.js / Invite-Only   │  │ Curriculum & Practice   │  │ Admin & RBAC │  │
│  │ Registration & Session  │  │ RPC & Edge Functions    │  │ & Audit API  │  │
│  │ • /api/auth/[...nextauth│  │ • /api/rpc/my_status    │  │ • /api/admin/│  │
│  │ • /api/auth/register    │  │ • /api/rpc/open_samples │  │   invitations│  │
│  │ • /api/auth/login       │  │ • /api/rpc/open_set     │  │ • /api/admin/│  │
│  │ • /api/auth/verify-otp  │  │ • /api/rpc/submit_answer│  │   users      │  │
│  │ • Revocation Guard      │  │ • /api/fn/{ask,checkout,│  │ • /api/admin/│  │
│  │                         │  │   billing,teacher-req}  │  │   audit-logs │  │
│  └────────────┬────────────┘  └────────────┬────────────┘  └──────┬───────┘  │
│               └────────────────────────────┼──────────────────────┘          │
│                                            ▼                                 │
│                         Prisma ORM Data Access Layer                         │
└────────────────────────────────────────────┼─────────────────────────────────┘
                                             ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│        Relational Database (SQLite in Local Dev / PostgreSQL in Prod)        │
│  Users · Sessions · InvitationCodes · InvitationRedemptions · AuditLogs      │
│  ProblemSets (374) · Problems · Attempts · FreeSetGrants · Referrals         │
│  Subscriptions · TeacherClassRequests                                        │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Prisma Data Model Specification

The Prisma schema (`prisma/schema.prisma` for SQLite local dev and `prisma/schema.postgres.prisma` for PostgreSQL production) defines the following core models:

### 2.1 Identity, Invite-Only Registration, RBAC, & Audit Logging
```prisma
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  name              String?
  passwordHash      String?
  role              String    @default("STUDENT") // STUDENT | TEACHER | ADMIN
  status            String    @default("ACTIVE")  // ACTIVE | REVOKED
  sessionVersion    Int       @default(1)
  emailVerified     DateTime?
  referralCode      String    @unique
  referredById      String?
  referredBy        User?     @relation("UserReferrals", fields: [referredById], references: [id])
  referrals         User[]    @relation("UserReferrals")
  freeLimit         Int       @default(3)
  premium           Boolean   @default(false)
  plan              String?   // monthly | annual | lifetime | teacher | class | referral
  subscriptionStatus String   @default("none") // none | active | canceled
  periodEnd         DateTime?
  cancelsAtPeriodEnd Boolean  @default(false)
  paymentBrand      String?
  paymentLast4      String?
  invitedByCodeId   String?
  invitedByCode     InvitationCode? @relation("InvitedUsers", fields: [invitedByCodeId], references: [id])
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  sessions          Session[]
  accounts          Account[]
  magicTokens       MagicLinkToken[]
  createdInvites    InvitationCode[] @relation("CreatedInvites")
  redemptions       InvitationRedemption[]
  freeSetGrants     FreeSetGrant[]
  attempts          Attempt[]
  teacherRequests   TeacherClassRequest[]
  auditLogs         AuditLog[] @relation("ActorAuditLogs")
}

model InvitationCode {
  id            String    @id @default(cuid())
  code          String    @unique
  role          String    @default("STUDENT") // STUDENT | TEACHER | ADMIN
  status        String    @default("ACTIVE")  // ACTIVE | REVOKED | DEPLETED | EXPIRED
  maxUses       Int       @default(1)
  usedCount     Int       @default(0)
  grantPremium  Boolean   @default(false)
  note          String?
  expiresAt     DateTime?
  revokedAt     DateTime?
  revokedReason String?
  createdById   String?
  createdBy     User?     @relation("CreatedInvites", fields: [createdById], references: [id], onDelete: SetNull)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  invitedUsers  User[]    @relation("InvitedUsers")
  redemptions   InvitationRedemption[]
}

model InvitationRedemption {
  id               String         @id @default(cuid())
  invitationCodeId String
  invitationCode   InvitationCode @relation(fields: [invitationCodeId], references: [id], onDelete: Cascade)
  userId           String
  user             User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  ipAddress        String?
  userAgent        String?
  redeemedAt       DateTime       @default(now())

  @@unique([invitationCodeId, userId])
}

model MagicLinkToken {
  id               String    @id @default(cuid())
  tokenHash        String    @unique
  email            String
  invitationCode   String?
  nextUrl          String?
  expiresAt        DateTime
  usedAt           DateTime?
  createdAt        DateTime  @default(now())
}

model AuditLog {
  id          String   @id @default(cuid())
  actorId     String?
  actor       User?    @relation("ActorAuditLogs", fields: [actorId], references: [id], onDelete: SetNull)
  actorEmail  String?
  action      String   // e.g. INVITE_CREATED, INVITE_REDEEMED, INVITE_REVOKED, USER_REGISTERED, USER_LOGIN, USER_ROLE_CHANGED, USER_REVOKED, SET_UNLOCKED, SUBSCRIPTION_UPDATED, TEACHER_REQUEST_SUBMITTED
  targetType  String   // USER | INVITATION | PROBLEM_SET | SUBSCRIPTION | TEACHER_REQUEST
  targetId    String?
  severity    String   @default("INFO") // INFO | WARN | CRITICAL
  ipAddress   String?
  userAgent   String?
  metadata    String?  // JSON payload
  createdAt   DateTime @default(now())

  @@index([action])
  @@index([actorId])
  @@index([createdAt])
}
```

### 2.2 Curriculum, Practice Sets, Attempts, & School Classes
```prisma
model ProblemSet {
  id          String    @id // e.g. "kinematics-1"
  chapter     String    // e.g. "kinematics"
  chapterNo   Int       // e.g. 1
  position    Int       // e.g. 1
  title       String    // e.g. "Kinematics, Position, Velocity"
  pages       String    // e.g. "1–1.2"
  nProblems   Int       // e.g. 8
  pageFrom    Int       // e.g. 0
  pageTo      Int       // e.g. 2
  i18nJson    String    // JSON map of localized titles across 10 languages

  problems    Problem[]
  freeGrants  FreeSetGrant[]

  @@index([chapter, position])
  @@index([chapterNo, position])
}

model Problem {
  id           String     @id // e.g. "kinematics-1-01"
  setId        String
  problemSet   ProblemSet @relation(fields: [setId], references: [id], onDelete: Cascade)
  chapter      String
  position     Int
  isSample     Boolean    @default(false)
  kind         String     // "num" | "mcq" | "fr"
  prompt       String
  choicesJson  String?    // JSON array of MCQ choices
  sceneJson    String?    // JSON 3D scene override { page, params, cam, look }
  unit         String?
  value        Float?     // Numeric answer
  answer       Int?       // MCQ answer index (0-based)
  solution     String?    // HTML/KaTeX written explanation
  stepsJson    String?    // JSON array of worked 3D figure steps [{ say, eq, pose, look, marks, cam }]
  slipsJson    String?    // JSON array of [wrongValue, hintText]
  ghostJson    String?    // JSON array of 3D ghost markers [{ ghost: "$", label: "your answer: $ m" }]

  attempts     Attempt[]

  @@index([chapter, isSample])
  @@index([setId, position])
}

model FreeSetGrant {
  id        String     @id @default(cuid())
  userId    String
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  setId     String
  problemSet ProblemSet @relation(fields: [setId], references: [id], onDelete: Cascade)
  grantedAt DateTime   @default(now())

  @@unique([userId, setId])
}

model Attempt {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  problemId   String
  problem     Problem  @relation(fields: [problemId], references: [id], onDelete: Cascade)
  answerJson  String   // Submitted value
  correct     Boolean
  createdAt   DateTime @default(now())

  @@index([userId, problemId])
}

model TeacherClassRequest {
  id        Int      @id @default(autoincrement())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name      String
  school    String
  staffUrl  String
  domain    String
  seats     Int
  course    String
  note      String?
  approved  Boolean  @default(false)
  paid      Boolean  @default(false)
  until     String   @default("2027-06-30")
  createdAt DateTime @default(now())
}
```
