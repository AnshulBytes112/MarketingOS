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
To push the schema or run migrations locally:
```bash
npx prisma generate
npx prisma db push
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

## Repository Structure
- `src/app` - Next.js UI routing and pages
- `src/components` - Reusable UI components
- `src/components/providers` - Context providers (Query, Theme, etc)
- `src/lib` - Utilities and shared code
- `prisma/` - Database schemas and migrations
- `tests/` - Unit and E2E test files
