# AI Brand Growth Engine - System Architecture

## Overview
This document defines the technical architecture and tech stack for the AI Brand Growth Engine, a multi-tenant SaaS application that automates the end-to-end marketing content lifecycle.

## Tech Stack
- **Framework:** Next.js
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui (heavily customized)
- **State Management:** TanStack Query, Zustand (when appropriate)
- **Data & Tables:** TanStack Table
- **Forms & Validation:** React Hook Form, Zod
- **Animations:** Motion
- **Icons:** Lucide Icons
- **Notifications:** Sonner
- **Command Palette:** cmdk
- **Theming:** next-themes

## Application Layers
1. **Frontend:** Next.js / React application for brand onboarding, content calendar, approval workflow, campaign management, and reporting dashboards.
2. **API Gateway:** Centralized routing with authentication/RBAC, campaign API, and content API.
3. **Orchestration Layer:** Coordinates AI agents, analytics engine, and scheduler.
4. **AI Agent Layer:** Specialized agents (Research, Strategy, Content, SEO, Analytics, and Learning) coordinated by a central Orchestrator agent.
5. **Model Gateway:** Abstraction layer for multiple LLM providers and task-specific model routing (e.g., strongest reasoning model for strategy, cost-efficient for bulk, dedicated for image/video).

## Data Layer
- **Transactional Database:** PostgreSQL (brands, users, teams, campaigns, posts, platforms, schedules, analytics).
- **Vector Database:** pgvector / Qdrant / Pinecone (brand knowledge, historical content, competitor content, embeddings).
- **Object Storage:** S3-compatible (images, video, PDFs, generated assets).
- **Analytics Store:** PostgreSQL initially, migrating to ClickHouse as event volume scales.

## Multi-Tenancy & Security
- Strict organization-level data isolation (users, roles, brand profiles, campaigns, content, assets).
- Role-based Access Control (RBAC): Owner, Admin, Marketing Manager, Content Manager, Designer, Analyst, Approver, Viewer.
