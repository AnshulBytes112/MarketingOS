# AI Brand Growth Engine

AI-native, multi-tenant marketing operating system.

## Project Overview
The AI Brand Growth Engine automates the end-to-end marketing content lifecycle:
Observe → Analyze → Strategize → Plan → Create → Approve → Publish → Measure → Learn → Optimize → Repeat.

## Prerequisites
- Node.js 20.x
- npm
- Docker (for local infrastructure)

## Local Setup

### Environment Variables
Copy `.env.example` to `.env` and fill in the values:
```bash
cp .env.example .env
```

### Infrastructure (Docker)
Start PostgreSQL (with pgvector) and Redis locally:
```bash
docker compose up -d
```
To stop: `docker compose down`

### Database (Prisma)
We use Prisma ORM with PostgreSQL.
To apply schema changes and create migrations locally, use the canonical workflow:
```bash
npx prisma generate
npx prisma migrate dev
```

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Testing
- **Unit Tests (Vitest):** `npm run test`
- **E2E Tests (Playwright):** `npm run test:e2e`

### Code Quality
- **Linting:** `npm run lint`
- **Typecheck:** `npm run typecheck`
- **Formatting:** `npm run format`

## CI/CD
GitHub Actions is configured to run on `main` and all Pull Requests. It ensures formatting, linting, typechecking, and tests pass before allowing a merge.

For branch protection in GitHub: go to Settings > Branches > Add branch protection rule for `main`. Check "Require status checks to pass before merging" and select the `test` job from the CI workflow.

## Repository Structure
- `src/app` - Next.js UI routing and pages
- `src/components` - Reusable UI components
- `src/components/providers` - Context providers (Query, Theme, etc)
- `src/lib` - Utilities and shared code
- `prisma/` - Database schemas and migrations
- `tests/` - Unit and E2E test files

## Tenant Isolation

We use a **Centralized Repository-Layer Tenant Guard** (`src/lib/db/repository.ts`) rather than PostgreSQL Row-Level Security (RLS) for the MVP phase. 

### Why Repository-Layer Isolation?
- **Simpler for MVP**: It integrates naturally with Prisma's architecture.
- **Easier Testing**: Mocking tenant boundaries is straightforward in unit tests.
- **Natural Authorization Fit**: Fits well with our application-level role-based authorization model without requiring complex database-level connection state handling for each query.

### The Tradeoff
This approach means that data isolation depends entirely on our data-access layer. Direct, "raw" `prisma` client access could bypass these protections.

### Rule: NO RAW PRISMA ACCESS FOR TENANT DATA
**Raw Prisma access to organization-scoped models is PROHIBITED outside of `TenantRepository`.**
All organization-scoped access must utilize `TenantRepository`, passing the requisite `OrganizationContext` which automatically enforces the `organizationId` filter across all reads and writes.

### Organization-Scoped Table Rule
Every organization-scoped table (e.g. `Brand`, `AuditLog`, `OrganizationMember`) **MUST**:
1. Contain an `organizationId` column.
2. Have a foreign key connecting to the `Organization` table.
3. Have an index on the `organizationId` column.
4. Set `organizationId` as NOT NULL (mandatory).
