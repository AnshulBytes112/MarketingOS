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
## Task 0.5: Storage, Core App Shell & Observability

### S3 Architecture & Signed Upload Flow
This project supports S3-compatible object storage for storing BrandAsset entities.
Uploads follow a secure, server-side signed upload flow:
1. Client requests an upload URL via /api/assets/upload
2. Server validates the session, permissions, and tenant isolation (ensuring the Brand belongs to the active Organization).
3. Server generates a short-lived S3 signed URL and a BrandAsset record with the object key (organization/{orgId}/brands/{brandId}/assets/{assetId}).
4. Client uploads the file directly to S3 without exposing credentials.

**Environment Variables Required:**
- S3_ENDPOINT
- S3_REGION
- S3_BUCKET
- S3_ACCESS_KEY_ID
- S3_SECRET_ACCESS_KEY

### Application IA & Core Shell
The application features a responsive sidebar and top bar. Navigation is organized into:
- **Engines:** Overview, Brand, Competitors, Market, Strategy, Content, Campaigns, Publishing, Analytics, SEO, Copilot
- **System:** Settings

**Command Palette:** Press Cmd+K (macOS) or Ctrl+K (Windows) to instantly navigate anywhere within the platform.

### Observability
- **Structured Logging:** A centralized logger produces JSON-formatted logs including timestamp, level, message, requestId, organizationId, and userId. Sensitive values are redacted.
- **Request ID:** A middleware automatically generates and propagates a x-request-id header across all incoming requests and outgoing responses.
- **Loading & Error Architecture:** We use loading.tsx to display Skeleton loaders during async page transitions and error.tsx for robust error boundaries to prevent full app crashes.
