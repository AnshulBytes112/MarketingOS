# AI Brand Growth Engine --- Master Product Requirements Document

**Document Type:** Master Product Requirements Document (PRD)\
**Version:** 2.0\
**Date:** August 13, 2026\
**Status:** Product/Engineering Baseline\
**Product:** AI Brand Growth Engine\
**Positioning:** AI-Native Digital Marketing Operating System

------------------------------------------------------------------------

## 1. Document Purpose

This document consolidates the available product, scope, architecture,
UX, engineering, and project guidance into a single
implementation-oriented PRD for the AI Brand Growth Engine.

It combines and reconciles the following project materials:

-   `AI_BRAND_GROWTH_ENGINE_SOW.md`
-   `AI_PRODUCT_REQUIREMENTS.md`
-   `AI_SYSTEM_ARCHITECTURE.md`
-   `AI_UX_DESIGN_GUIDELINES.md`
-   `AGENTS.md`
-   `CLAUDE.md`
-   `README.md`

It also incorporates the review of the supplied mock UI screens,
including the landing page, Dashboard, Brand Intelligence, Competitor
Intelligence, Market Intelligence, Content Engine, Publishing,
Analytics, SEO Engine, and AI Marketing Copilot.

Where the source documents define a requirement, this PRD preserves that
requirement. Where the mock UI reveals an implementation or UX
opportunity, it is identified as a product/UI recommendation rather than
presented as an existing requirement.

------------------------------------------------------------------------

# 2. Executive Summary

The AI Brand Growth Engine is an AI-native marketing operating system
for companies that struggle to consistently understand their market,
differentiate from competitors, create effective content, manage
multiple social channels, measure performance, and turn marketing data
into better decisions.

The product replaces a traditional linear marketing workflow:

**Manual research → content writing → design → scheduling → reporting**

with a continuous closed loop:

**Observe → Analyze → Strategize → Plan → Create → Approve → Publish →
Measure → Learn → Optimize → Repeat**

The product is not intended to be positioned as a simple AI content
generator. Its core differentiation is a growing intelligence layer
built from:

-   Brand DNA
-   Audience understanding
-   Competitor intelligence
-   Market intelligence
-   SEO intelligence
-   Historical content
-   Publishing history
-   Performance analytics
-   Campaign outcomes

The system should use this intelligence to answer four questions
continuously:

1.  **What is happening?**
2.  **Why is it happening?**
3.  **What should the brand do next?**
4.  **Can the system help execute that decision?**

The product should progressively evolve from an AI-assisted marketing
operating system in MVP toward an AI CMO capable of autonomous
optimization within explicit business guardrails.

------------------------------------------------------------------------

# 3. Problem Statement

Companies, especially growing brands and lean marketing teams, commonly
face a fragmented digital marketing workflow.

Typical problems include:

-   Brand knowledge is spread across documents, websites, presentations,
    and individual team members.
-   Competitor research is manual and inconsistent.
-   Teams discover trends too late.
-   Content is generated independently of strategy.
-   The same content is often copied across platforms instead of adapted
    to each platform.
-   Approval and publishing workflows are disconnected.
-   Analytics often show numbers without explaining what caused them.
-   Marketing teams struggle to turn performance data into future
    content decisions.
-   SEO, social, competitor, and campaign intelligence are disconnected.
-   There is no continuous learning loop between content performance and
    future strategy.
-   Multiple brands/accounts require isolated data and permissions.
-   Platform API limitations make publishing and analytics dependent on
    third-party access.

The AI Brand Growth Engine solves this by creating a single operating
system where intelligence flows into decisions and decisions flow into
execution.

------------------------------------------------------------------------

# 4. Product Vision

## Vision

Build a system that behaves like an AI marketing operating system for a
brand:

> It continuously understands the brand, watches the competitive and
> market environment, recommends what the brand should do, helps create
> the required assets, manages approval and publishing, measures
> outcomes, and improves future recommendations from accumulated
> evidence.

## Product Positioning

The product should be positioned as:

**AI Marketing Decision Engine / AI Marketing Operating System**

and not merely:

**AI Content Generator**

The product's value increases as more brand, competitor, audience,
content, and performance data accumulate.

------------------------------------------------------------------------

# 5. Product Principles

## 5.1 Intelligence Before Generation

The AI should not generate content blindly.

Content decisions should be informed by:

-   Brand DNA
-   Strategy
-   Audience
-   Competitor intelligence
-   Market opportunities
-   SEO opportunities
-   Historical performance

## 5.2 Explain Before Recommend

AI recommendations should follow:

**Observation → Likely Cause → Recommendation → Action**

The user should understand why the system is making a recommendation.

## 5.3 Recommendation Must Lead to Action

Where possible, an insight should have a direct action:

-   Apply to Strategy
-   Generate Content
-   Add to Calendar
-   Create Campaign
-   Schedule
-   Review
-   Approve

## 5.4 Human-in-the-Loop by Default

Human approval is mandatory for published content in MVP and Phase 1/2
unless explicitly configured otherwise for approved low-risk content
categories.

## 5.5 Platform-Aware Content

Content should be adapted for each platform rather than duplicated
verbatim.

## 5.6 Data Compounds

Every approved/published asset and its resulting performance should
become useful intelligence for future decisions.

## 5.7 AI Should Augment, Not Hide

The user should be able to understand:

-   what the AI observed
-   what evidence it used
-   what it recommends
-   what action it wants to take
-   what requires human approval

## 5.8 Premium Product Experience

The application should feel like a modern venture-backed startup product
inspired by the quality bar of products such as Linear, Framer, Stripe,
Apple, Arc, Vercel, Notion, Figma, Raycast, Airbnb, Attio, Perplexity,
Superhuman, and Pitch without copying them.

The UI should be:

-   Minimal
-   Elegant
-   Sophisticated
-   Calm
-   Confident
-   Fast
-   Modern
-   Creative
-   Premium

------------------------------------------------------------------------

# 6. Target Users

The source documents define role-based access using:

-   Owner
-   Admin
-   Marketing Manager
-   Content Manager
-   Designer
-   Analyst
-   Approver
-   Viewer

The product should support these roles at organization level.

## 6.1 Owner

Primary needs:

-   business outcomes
-   overall brand performance
-   ROI
-   leads/conversions
-   executive insights
-   organization management

## 6.2 Marketing Manager

Primary needs:

-   strategy
-   campaigns
-   competitor analysis
-   market opportunities
-   content planning
-   performance insights

## 6.3 Content Manager

Primary needs:

-   content calendar
-   content generation
-   drafts
-   approvals
-   publishing

## 6.4 Designer

Primary needs:

-   creative assets
-   visual generation
-   asset library
-   brand guidelines
-   content packaging

## 6.5 Analyst

Primary needs:

-   analytics
-   competitor benchmarking
-   SEO
-   campaign performance
-   AI-generated explanations

## 6.6 Approver

Primary needs:

-   approval queue
-   quality scores
-   edit/reject/regenerate/approve
-   factuality and brand compliance

## 6.7 Viewer

Read-only access to permitted dashboards and reports.

------------------------------------------------------------------------

# 7. Core Product Loop

The entire application should reinforce this loop:

``` text
OBSERVE
  ↓
Brand + Competitor + Market + SEO + Performance Data
  ↓
ANALYZE
  ↓
AI identifies patterns, gaps, trends and causes
  ↓
STRATEGIZE
  ↓
Goals + Audience + Pillars + Funnel + Campaign Strategy
  ↓
PLAN
  ↓
Content Calendar + Campaign Plan
  ↓
CREATE
  ↓
Text + Images + Video + Repurposed Assets
  ↓
APPROVE
  ↓
Human Review + Quality Scores
  ↓
PUBLISH
  ↓
LinkedIn / Instagram / Additional Platforms
  ↓
MEASURE
  ↓
Post + Campaign Performance
  ↓
LEARN
  ↓
Performance Patterns + Experiments
  ↓
OPTIMIZE
  ↓
Updated Recommendations + Planner
  ↓
REPEAT
```

This loop is the core product architecture and should influence
navigation, APIs, data models, AI orchestration, and UI.

------------------------------------------------------------------------

# 8. Functional Architecture

The product consists of ten functional engines coordinated by a central
AI Marketing Orchestrator.

  -----------------------------------------------------------------------
  Engine                              Primary Responsibility
  ----------------------------------- -----------------------------------
  Brand Intelligence Engine           Build and maintain Brand DNA

  Competitor Intelligence Engine      Monitor competitors and identify
                                      gaps

  Market Intelligence Engine          Detect trends, mentions,
                                      discussions, and opportunities

  Strategy Engine                     Convert intelligence into marketing
                                      strategy

  Content Engine                      Generate platform-aware content and
                                      creatives

  Campaign Engine                     Manage goal-oriented campaigns

  Publishing Engine                   Connect accounts, schedule and
                                      publish

  Analytics Engine                    Normalize and analyze performance

  SEO Engine                          Keyword research and SEO content
                                      opportunities

  Learning Engine                     Experimentation and continuous
                                      optimization
  -----------------------------------------------------------------------

The ten engines should not necessarily become ten separate navigation
items. The UI should be organized around user workflows rather than
backend architecture.

------------------------------------------------------------------------

# 9. Recommended Product Information Architecture

The current mock UI exposes the engines directly in the sidebar. This is
visually strong, but the production product should eventually organize
navigation around user tasks.

## Recommended Navigation

### Workspace

-   Overview
-   Strategy
-   Content
-   Calendar
-   Campaigns

### Intelligence

-   Brand
-   Competitors
-   Market
-   SEO

### Measure

-   Analytics

### AI

-   Copilot

### System

-   Settings

The underlying engine names can remain visible in headings or product
language, but users should not be required to understand the technical
architecture.

------------------------------------------------------------------------

# 10. Dashboard / Overview

## Objective

Give the user an immediate understanding of:

-   what is happening
-   what changed
-   what needs attention
-   what opportunities exist
-   what actions should be taken

## Current Mock UI

The mock dashboard contains:

-   greeting
-   pending approvals
-   active campaign
-   engagement trend
-   Generate Content
-   Review Queue
-   Publish Now
-   View Analytics
-   KPI cards
-   impressions/reach chart
-   engagement/clicks chart

This should remain.

## Recommended Enhancement: AI Growth Brief

The dashboard should prioritize an AI Growth Brief before or alongside
KPI cards.

Example:

### AI Growth Brief

**3 opportunities detected today**

**Competitor Gap** Competitors are receiving stronger engagement from
educational carousel content.

**Recommendation** Increase educational carousel allocation.

**Action** `Apply to Strategy`

------------------------------------------------------------------------

### Performance Alert

LinkedIn engagement dropped 18%.

**Likely cause** Recent image-only posts were published during a
lower-performing window.

**Action** `View Analysis`

------------------------------------------------------------------------

### Market Opportunity

A detected topic has high brand relevance.

**Action** `Generate Content`

## KPI Layer

Recommended metrics:

-   Total Followers
-   Average Engagement
-   Total Impressions
-   Content Published
-   Pending Approvals
-   SEO Traffic

Long-term executive metrics:

-   Brand Awareness
-   Traffic
-   Leads
-   Conversions
-   CAC
-   Organic Revenue

## Dashboard Requirement

The dashboard should not become a chart-only page.

Every significant metric should lead to an explanation or action.

------------------------------------------------------------------------

# 11. Brand Intelligence Engine

## Objective

Create a structured, versioned representation of the brand that can be
referenced by all downstream AI systems.

## Inputs

-   Brand name
-   Industry
-   Website
-   Product/service catalog
-   Target audience
-   Geography
-   Price segment
-   Positioning
-   USP
-   Named competitors
-   Logo
-   Product images
-   Videos
-   Brand guidelines
-   Brochures
-   Catalogs
-   Presentations
-   Past campaign assets

## Brand DNA Outputs

-   Brand personality
-   Voice
-   Tone
-   Positioning
-   Visual identity
-   Audience
-   Content pillars
-   Preferred language
-   CTA preferences
-   Explicit avoid list
-   Brand claims
-   Brand constraints

## Required UI

Tabs:

-   Brand DNA
-   Voice & Tone
-   Audience
-   Assets
-   Guidelines

## Recommended Additional Metadata

The UI should expose:

-   Brand DNA version
-   Last generated timestamp
-   AI confidence
-   Sources used
-   Changes from previous version
-   Review/edit controls

Example:

``` text
Brand DNA v3
Generated Aug 13

Confidence: 94%

Sources:
✓ Website
✓ Brand Guidelines
✓ Product Catalog
✓ Historical Campaigns
```

## Regeneration

`Regenerate DNA` should:

1.  ingest current sources
2.  compare with existing Brand DNA
3.  produce a proposed version
4.  show changes
5.  allow review
6.  publish the new version

------------------------------------------------------------------------

# 12. Competitor Intelligence Engine

## Objective

Understand competitive activity and identify actionable opportunities.

## Competitor Inputs

For each competitor:

-   name
-   website
-   social handles
-   supported platforms
-   category

## Data to Track

-   posting frequency
-   content types
-   hooks
-   captions
-   hashtags
-   CTA patterns
-   format mix
-   engagement rate
-   average likes
-   comments
-   shares
-   views
-   follower growth
-   posting cadence
-   topic distribution

## Content Gap Detection

The engine should identify:

-   topics competitors are underserving
-   topics with demonstrated audience interest
-   format gaps
-   CTA gaps
-   content timing gaps
-   positioning gaps

## Mock UI Concept

The existing:

**Multi-Platform Competitor Feed & Counter-Playbook**

is a good long-term experience.

The action panel:

**Measure You Should Take**

should remain because it turns monitoring into decision support.

## MVP Constraint

MVP competitor intelligence is baseline/non-real-time and focused on
LinkedIn + Instagram.

Live monitoring and broader platform coverage should be introduced
later.

The UI should not claim live monitoring unless the backend actually
supports it.

------------------------------------------------------------------------

# 13. Market Intelligence Engine

## Objective

Detect external signals that could create marketing opportunities.

## Signals

-   trending topics
-   viral discussions
-   industry news
-   emerging keywords
-   brand mentions
-   competitor announcements
-   influencer conversations
-   hashtags
-   topic momentum

## Opportunity Object

Each opportunity should contain:

-   title
-   platform
-   type
-   trend growth
-   mentions/volume
-   relevance
-   confidence
-   detected time
-   recommended action
-   related content formats

## Brand Relevance

The existing UI's:

**Brand Relevance: 92%**

is a strong pattern and should remain.

## Action

Every useful opportunity should support:

`Generate Content`

or:

`Add to Strategy`

## Phase

Market Intelligence / social listening is Phase 2 unless the MVP scope
is explicitly expanded.

------------------------------------------------------------------------

# 14. Strategy Engine

## Objective

Convert intelligence into a measurable marketing strategy.

## Inputs

-   business objectives
-   Brand DNA
-   audience
-   competitor intelligence
-   market opportunities
-   SEO intelligence
-   historical performance

## Strategy Outputs

-   primary goal
-   target audience segment
-   content pillars
-   weighted content allocation
-   funnel-stage mapping
-   platform strategy
-   content formats
-   posting cadence
-   recommended themes
-   campaign opportunities

## Funnel

Support:

-   Awareness
-   Engagement
-   Consideration
-   Trust
-   Conversion

## Content Pillars

Example:

-   Educational
-   Thought Leadership
-   Product
-   Case Studies
-   Industry News
-   Culture

## Strategy UI

Recommended sections:

### Goal

What is the primary business outcome?

### Audience

Who are we targeting?

### Content Mix

Show percentage allocation.

### Funnel

Show content distribution by funnel stage.

### AI Reasoning

Explain why the strategy was selected.

### Actions

-   Regenerate
-   Edit
-   Approve
-   Generate Calendar

------------------------------------------------------------------------

# 15. Content Planning / Calendar

## Objective

Translate strategy into a dynamic publishing plan.

Each planned item should contain:

-   date
-   platform
-   content type
-   format
-   pillar
-   funnel stage
-   topic
-   hook
-   CTA
-   campaign
-   status
-   AI score
-   reason/recommendation

## Dynamic Planner

The planner should eventually reweight format mix based on observed
performance.

Example:

``` text
Educational Carousels
Current: 20%
Recommended: 35%
Reason: +42% engagement lift
```

## Calendar UX

Each content item should show enough context that the user understands
why it exists.

------------------------------------------------------------------------

# 16. Content Engine

## Objective

Generate brand-aligned, platform-specific content and creative assets.

## Generation Modes

### Source-Based Generation

Input:

-   product image
-   blog
-   PDF
-   video
-   press release
-   product description

Output:

-   social posts
-   captions
-   threads
-   video scripts
-   email newsletter
-   SEO article

### AI-Native Generation

Uses:

-   Brand DNA
-   competitor intelligence
-   trend intelligence
-   SEO intelligence
-   historical performance

### Repurposing

A long-form source can become:

-   blog
-   LinkedIn posts
-   X posts
-   Instagram carousel
-   short-video concepts
-   quote cards
-   newsletter

## Creative Types

### Text

-   posts
-   captions
-   hooks
-   headlines
-   CTAs
-   threads
-   articles
-   ad copy

### Image

-   social creatives
-   carousels
-   product creatives
-   ads
-   infographics
-   quote cards

### Video

-   reels
-   shorts
-   scripts
-   storyboards
-   voiceover suggestions
-   captions
-   B-roll notes

## Platform-Aware Generation

The same source should not be duplicated verbatim across platforms.

The generator must consider:

-   character limits
-   tone
-   hook structure
-   CTA
-   formatting
-   hashtags
-   media requirements
-   audience behavior

## Model Gateway

The UI should not hardcode specific model names.

The system should route requests through the Model Gateway, which
chooses appropriate models for:

-   strategy
-   bulk copy
-   reasoning
-   image generation
-   video generation
-   embeddings

The user can see a high-level state such as:

**Auto-selected model**

rather than coupling the UI to provider/model names.

------------------------------------------------------------------------

# 17. Content Quality Scoring

Every generated asset should expose quality signals:

-   Brand Fit
-   SEO Score
-   Originality
-   Factuality
-   CTA Quality

These should be configurable and extensible.

Example:

``` text
Brand Fit       94
SEO Score       87
Originality     91
Factuality      96
CTA Quality     88
```

The score should support explainability.

The user should be able to understand why a score is high or low.

------------------------------------------------------------------------

# 18. Human Approval Workflow

## Statuses

Suggested lifecycle:

``` text
Draft
↓
AI Reviewed
↓
Needs Review
↓
Approved
↓
Scheduled
↓
Publishing
↓
Published
↓
Measured
```

Possible alternative states:

-   Rejected
-   Regeneration Requested
-   Failed Publishing

## Reviewer Actions

-   Edit
-   Approve
-   Reject
-   Regenerate

## Approval Rules

MVP:

-   Human approval required for all published content.

Future:

-   configurable auto-publish rules
-   low-risk educational content
-   higher-risk product claims
-   promotional content
-   paid ads

Auto-publish should be disabled by default.

------------------------------------------------------------------------

# 19. Campaign Engine

## Objective

Group related content and activities under a measurable business
objective.

## Campaign Fields

-   campaign name
-   objective
-   start date
-   end date
-   platforms
-   target audience
-   content
-   budget
-   lead target
-   conversion target
-   status

## Campaign Dashboard

Show:

-   progress
-   content volume
-   reach
-   engagement
-   clicks
-   leads
-   conversions
-   revenue where attributable
-   budget
-   performance against target

## AI Recommendations

Campaigns should support recommendations such as:

> Increase carousel allocation by 15%.

or:

> Campaign engagement is strong but conversion is weak. Review CTA and
> landing page alignment.

------------------------------------------------------------------------

# 20. Publishing Engine

## Supported Platforms

MVP:

-   LinkedIn
-   Instagram

Future, subject to API access:

-   X
-   YouTube
-   TikTok
-   Pinterest
-   Threads
-   Facebook

## Required Capabilities

-   OAuth connection
-   account/page/channel linking
-   permission scoping
-   media upload
-   scheduling
-   publishing
-   status tracking
-   post ID retrieval
-   analytics pull-back
-   token refresh

## Connected Accounts

A brand may have multiple connected accounts per platform type.

## Publishing Status

Every publishing operation should clearly expose:

-   scheduled
-   publishing
-   published
-   failed
-   retrying
-   authentication issue

## Platform API Dependency

The product must handle third-party API restrictions, rate limits,
permission changes, and platform policy changes gracefully.

------------------------------------------------------------------------

# 21. Analytics Engine

## Objective

Collect normalized performance data and turn it into actionable
intelligence.

## Post-Level Data

Track where available:

-   platform
-   date/time
-   content type
-   topic
-   pillar
-   hook
-   CTA
-   hashtags
-   media type
-   campaign
-   impressions
-   reach
-   likes
-   comments
-   shares
-   saves
-   clicks
-   CTR
-   conversions
-   revenue

## Derived Insights

Identify:

-   best topic
-   best format
-   best hook
-   best day
-   best time
-   best CTA
-   best platform
-   strongest content pillar

## Analytics UI

Current mock structure is good:

-   Overview
-   By Platform
-   Top Content
-   Insights

Add:

### AI Performance Insights

Each insight should contain:

**Observation**

**Likely Cause**

**Recommendation**

**Action**

Example:

``` text
Engagement dropped 18%.

Likely Cause:
Recent posts were image-only and published during
a lower-performing time window.

Recommendation:
Prioritize articles and carousels Tuesday–Thursday.

[Apply Recommendation]
```

This is one of the most important product differentiators.

------------------------------------------------------------------------

# 22. SEO Engine

## Objective

Connect search intelligence directly to content planning.

## Capabilities

-   keyword research
-   search intent
-   keyword difficulty
-   competitor ranking comparison
-   content-gap identification
-   organic traffic reporting
-   keyword movement
-   backlinks
-   CTR

## Integration

A high-opportunity keyword should be able to create:

-   recommended article
-   supporting social posts
-   campaign opportunity

## Phase

SEO is Phase 2.

------------------------------------------------------------------------

# 23. AI Marketing Copilot

## Objective

Provide a natural-language interface over the brand's own intelligence
and performance data.

## Example Questions

-   Why did LinkedIn performance drop?
-   What should we post tomorrow?
-   Generate a 30-day campaign.
-   What is our best performing content format?
-   Summarize competitor content gaps.
-   Which hashtags are driving saves?

## Response Format

Use:

``` text
Observation
↓
Likely Cause
↓
Recommendation
↓
Action
```

## Action-Oriented Copilot

The Copilot should not only answer.

Example:

User:

> What should we post tomorrow?

AI:

> Recommended: LinkedIn carousel Topic: Sustainable sourcing Pillar:
> Education Funnel: Awareness
>
> \[Generate Draft\] \[Add to Calendar\]

The Copilot should be capable of invoking approved product workflows.

------------------------------------------------------------------------

# 24. Learning Engine

## Phase

Phase 3+.

## Purpose

Continuously optimize decisions based on accumulated outcomes.

## Context

Potential context variables:

-   platform
-   audience segment
-   topic
-   format
-   posting time

## Action

The publish decision.

## Reward

Weighted business-aligned signal:

1.  revenue
2.  conversions
3.  qualified leads
4.  CTR
5.  engagement
6.  likes

The system should not optimize toward vanity metrics when stronger
business signals are available.

## Requirements

-   contextual bandit / experimentation framework
-   configurable reward function
-   predictive performance scoring
-   dynamic planner
-   statistically meaningful data volume

The system must avoid claiming meaningful learning when insufficient
historical data exists.

------------------------------------------------------------------------

# 25. AI Marketing Orchestrator

The Orchestrator coordinates specialized AI agents.

## Agents

-   Research Agent
-   Strategy Agent
-   Content Agent
-   SEO Agent
-   Analytics Agent
-   Learning Agent

## Orchestration Principles

The Orchestrator should:

1.  identify task
2.  gather required context
3.  invoke appropriate agent(s)
4.  retrieve brand knowledge
5.  validate output
6.  produce structured result
7.  expose explanation
8.  request human approval where required
9.  trigger downstream actions only when authorized

------------------------------------------------------------------------

# 26. Knowledge / RAG Layer

The system requires retrieval over:

-   Brand DNA
-   brand guidelines
-   historical content
-   competitor content
-   source documents
-   product information
-   approved claims
-   performance history

## MVP Recommendation

Use PostgreSQL + pgvector initially unless scale requirements
demonstrate the need for a dedicated vector database.

The architecture allows:

-   pgvector
-   Qdrant
-   Pinecone

but the final choice should minimize MVP infrastructure complexity.

------------------------------------------------------------------------

# 27. Multi-Tenancy

The system is a multi-tenant SaaS application.

Data isolation must cover:

-   organizations
-   users
-   roles
-   brands
-   connected social accounts
-   campaigns
-   content
-   analytics
-   assets
-   AI knowledge

No tenant should be able to access another tenant's data.

------------------------------------------------------------------------

# 28. RBAC

Roles:

-   Owner
-   Admin
-   Marketing Manager
-   Content Manager
-   Designer
-   Analyst
-   Approver
-   Viewer

Permissions should be enforced server-side and reflected in the UI.

Example:

A Viewer may read analytics but should not:

-   edit Brand DNA
-   publish content
-   approve content
-   manage social credentials

------------------------------------------------------------------------

# 29. Data Architecture

## Transactional Database

PostgreSQL for:

-   brands
-   users
-   teams
-   campaigns
-   posts
-   content
-   platforms
-   schedules
-   analytics

## Vector Database

Initially PostgreSQL + pgvector, subject to future scale evaluation.

## Object Storage

S3-compatible storage for:

-   images
-   video
-   PDFs
-   generated creatives
-   source assets

## Analytics Store

PostgreSQL initially.

ClickHouse or equivalent may be introduced when event volume warrants
it.

------------------------------------------------------------------------

# 30. Technical Stack

## Frontend

-   Next.js
-   TypeScript
-   Tailwind CSS v4
-   shadcn/ui, heavily customized
-   Motion
-   Lucide Icons
-   TanStack Query
-   TanStack Table
-   React Hook Form
-   Zod
-   Sonner
-   cmdk
-   next-themes
-   Zustand when appropriate

## Engineering Principles

-   reusable components
-   scalable design system
-   no duplicated styles
-   responsive from day one
-   semantic HTML
-   accessible interactions
-   keyboard navigation
-   visible focus states
-   proper contrast

The project guidance specifically requires checking the installed
Next.js version and relevant local Next.js documentation before making
code changes because the project's Next.js version may contain breaking
changes.

------------------------------------------------------------------------

# 31. UX / Design System

## Visual Direction

The UI should feel:

-   premium
-   calm
-   modern
-   intelligent
-   trustworthy

## Typography

Use:

-   Geist or Inter

Typography should establish hierarchy rather than relying primarily on
color.

## Color

Use:

-   mostly neutrals
-   one primary accent
-   one success
-   one warning
-   one danger
-   subtle gradients

## Spacing

Use an 8px spacing system.

## Components

Customize:

-   cards
-   tables
-   forms
-   buttons
-   inputs
-   dropdowns
-   dialogs
-   tooltips
-   command palette
-   sidebar
-   navbar
-   charts
-   lists

## Motion

Use subtle motion for:

-   state changes
-   hierarchy
-   loading
-   success
-   hover
-   navigation

Target animation duration:

**150--250ms**

Avoid decorative animation that does not improve usability.

------------------------------------------------------------------------

# 32. Loading / Empty / Error States

Every major module must define:

### Loading

Prefer:

-   skeletons
-   progressive loading
-   optimistic updates where safe

Avoid raw spinners when a skeleton is more appropriate.

### Empty

Example:

> No competitors added yet.

`Add Competitor`

### Error

Example:

> Instagram connection expired.

`Reconnect Account`

### Success

Example:

> Content approved and scheduled for Aug 15 at 9:00 AM.

The user should always know:

-   where they are
-   what happened
-   what they can do next
-   what is loading
-   what succeeded
-   what failed

------------------------------------------------------------------------

# 33. AI Activity / Transparency

The existing top-bar "AI Active" concept should be expanded.

Clicking it can show:

``` text
AI Activity

✓ Competitor data analyzed
✓ Performance data analyzed
✓ 3 market opportunities detected
→ Updating strategy
→ Generating recommendations

Last sync: 2 minutes ago
```

This gives users confidence that the system is actively working.

The product should avoid pretending that AI processes are real-time if
the underlying jobs are asynchronous or scheduled.

------------------------------------------------------------------------

# 34. Onboarding Flow

The system should provide a guided first-run onboarding experience.

## Steps

1.  Brand
2.  Audience
3.  Positioning
4.  Competitors
5.  Assets
6.  Social Accounts
7.  Brand DNA
8.  Ready

## Final Step

Show:

**Your Brand DNA is Ready**

-   confidence
-   sources
-   key assumptions
-   missing information

Actions:

-   Review Brand DNA
-   Edit
-   Continue to Strategy

------------------------------------------------------------------------

# 35. Notifications

Notifications should cover:

-   approval required
-   publishing success
-   publishing failure
-   connection expiration
-   campaign milestone
-   important performance anomaly
-   AI recommendation
-   failed AI generation
-   data sync issue

Notifications should be actionable.

------------------------------------------------------------------------

# 36. Search and Command Palette

Global search should support:

-   campaigns
-   content
-   competitors
-   posts
-   assets
-   keywords
-   reports

Command palette:

**Cmd+K / Ctrl+K**

Examples:

-   Generate Content
-   Create Campaign
-   Open Calendar
-   Review Approvals
-   Ask AI Copilot
-   Add Competitor
-   Connect Instagram

------------------------------------------------------------------------

# 37. Platform Integration Requirements

## OAuth

Each platform integration must support:

-   secure authorization
-   account selection
-   permission scope
-   token storage
-   token refresh
-   disconnect
-   reconnect

## Publishing

The publishing service should:

1.  validate content
2.  validate media
3.  verify connection
4.  schedule/publish
5.  capture platform ID
6.  update status
7.  retry where appropriate
8.  log failures

## Analytics

Analytics sync should:

1.  retrieve platform data
2.  normalize metrics
3.  associate with post
4.  store timestamp
5.  update aggregate metrics
6.  feed analytics/learning systems

------------------------------------------------------------------------

# 38. Content Safety and Governance

The system must distinguish between:

-   educational content
-   thought leadership
-   product claims
-   promotional content
-   paid advertising

High-risk content should require stronger human review.

The client remains responsible for factual and regulatory approval of
promotional and product claims.

The product should not represent AI-generated content as legally
approved.

------------------------------------------------------------------------

# 39. MVP Definition

## Phase 1 --- Core Loop

### Platforms

-   LinkedIn
-   Instagram

### Included

-   Brand onboarding
-   Brand Intelligence / Brand DNA
-   Baseline competitor analysis
-   AI strategy generation
-   Content calendar
-   AI content generation
-   Human approval
-   Publishing
-   Baseline analytics
-   AI Copilot

## MVP Exit Criteria

A brand can:

1.  onboard
2.  create Brand DNA
3.  add competitors
4.  receive an AI-generated strategy
5.  receive a content calendar
6.  generate content
7.  review and approve content
8.  publish to LinkedIn/Instagram
9.  retrieve performance data
10. view performance insights

The core loop must work end-to-end before advanced intelligence is
layered on.

------------------------------------------------------------------------

# 40. Phase 2 --- Intelligence Expansion

Add:

-   SEO Engine
-   social listening
-   Market Intelligence
-   campaign management
-   content repurposing
-   expanded analytics
-   role-based reporting
-   X
-   YouTube
-   additional prioritized platforms

------------------------------------------------------------------------

# 41. Phase 3 --- Learning Systems

Add:

-   Learning Engine
-   contextual bandits
-   experimentation
-   predictive performance scoring
-   self-adjusting planner

------------------------------------------------------------------------

# 42. Phase 4 --- AI CMO

Add:

-   autonomous campaign optimization
-   budget optimization
-   paid ad creative generation
-   paid ad management
-   cross-channel attribution
-   revenue-linked reporting

Autonomy must remain bounded by configurable business guardrails.

------------------------------------------------------------------------

# 43. UI Scope Recommendations from Mock Review

The supplied mock UI is already visually strong and should not be
redesigned from scratch.

## Keep

-   landing page visual language
-   Dashboard layout foundation
-   Brand Intelligence structure
-   Competitor Feed / Counter-Playbook concept
-   Market opportunity cards
-   Content Studio
-   Publishing Calendar
-   Analytics visual language
-   SEO keyword table
-   AI Copilot conversation format
-   purple/blue accent system
-   sidebar/topbar system

## Change

### Dashboard

Make AI Growth Brief more prominent.

### Analytics

Add:

**Observation → Cause → Recommendation → Action**

### Competitor Intelligence

Separate:

-   MVP baseline analysis
-   future live monitoring

### Market Intelligence

Treat as Phase 2 unless explicitly included in MVP.

### Content Engine

Do not hardcode vendor/model names in the primary UX.

### Publishing Calendar

Show the reason/strategy behind planned content.

### Copilot

Allow action execution, not only natural-language answers.

### Sidebar

Organize production navigation around user workflows rather than
exposing every backend engine.

### Add

-   onboarding
-   Strategy Engine screen
-   Campaign Engine screen
-   AI Activity
-   Brand DNA versioning/confidence
-   recommendation-to-action flows

------------------------------------------------------------------------

# 44. Key Product Workflows

## Workflow A --- New Brand

``` text
Sign Up
↓
Create Organization
↓
Create Brand
↓
Enter Brand Details
↓
Upload Assets
↓
Connect Social Accounts
↓
Generate Brand DNA
↓
Review Brand DNA
↓
Add Competitors
↓
Generate Strategy
↓
Generate Calendar
```

## Workflow B --- Intelligence to Content

``` text
Trend Detected
↓
Brand Relevance Calculated
↓
Opportunity Created
↓
User clicks Generate Content
↓
Strategy Context Loaded
↓
Brand DNA Retrieved
↓
Content Generated
↓
Quality Scoring
↓
Human Review
↓
Approve
↓
Schedule
```

## Workflow C --- Performance to Strategy

``` text
Post Published
↓
Metrics Retrieved
↓
Analytics Normalized
↓
Performance Pattern Detected
↓
AI Explains Cause
↓
Recommendation Generated
↓
User Applies Recommendation
↓
Strategy Updated
↓
Calendar Rebalanced
```

## Workflow D --- Copilot Action

``` text
User asks question
↓
Copilot interprets intent
↓
Retrieve brand/performance context
↓
Analyze
↓
Explain
↓
Recommend
↓
Offer action
↓
User confirms
↓
Execute workflow
```

------------------------------------------------------------------------

# 45. Core Data Entities

High-level entities should include:

-   Organization
-   User
-   Role
-   Brand
-   BrandDNA
-   BrandDNAVersion
-   BrandAsset
-   BrandGuideline
-   Audience
-   Competitor
-   CompetitorAccount
-   CompetitorPost
-   MarketSignal
-   Opportunity
-   Strategy
-   ContentPillar
-   FunnelStage
-   ContentPlan
-   ContentItem
-   ContentVersion
-   CreativeAsset
-   Campaign
-   SocialPlatform
-   SocialConnection
-   ScheduledPost
-   PublishedPost
-   PostMetric
-   CampaignMetric
-   Keyword
-   SEOOpportunity
-   AIInsight
-   AIRecommendation
-   Approval
-   Experiment
-   LearningPolicy
-   Notification
-   AuditLog

All organization-scoped entities must carry tenant context.

------------------------------------------------------------------------

# 46. API / Service Boundaries

Recommended logical services/modules:

``` text
Auth / RBAC
Brand Service
Competitor Service
Market Intelligence Service
Strategy Service
Content Service
Campaign Service
Publishing Service
Analytics Service
SEO Service
AI Orchestrator
Model Gateway
Knowledge / RAG Service
Notification Service
```

The API Gateway should provide centralized routing and
authentication/RBAC.

------------------------------------------------------------------------

# 47. Security Requirements

## Tenant Isolation

Strict organization-level isolation.

## Credentials

Social credentials/tokens must be securely stored and never exposed to
frontend clients.

## Authorization

Every protected operation must validate permissions server-side.

## Audit

Important actions should be logged:

-   login
-   brand changes
-   Brand DNA regeneration
-   content approval
-   content rejection
-   publishing
-   connection changes
-   campaign changes
-   role changes

## Data Access

AI retrieval must be tenant-scoped.

No AI agent should retrieve another organization's data.

------------------------------------------------------------------------

# 48. Observability

The system should monitor:

-   API latency
-   AI latency
-   AI token/cost usage
-   generation failures
-   publishing failures
-   social API failures
-   analytics sync failures
-   queue depth
-   job duration
-   model error rate

AI operations should have traceable IDs so failures can be diagnosed.

------------------------------------------------------------------------

# 49. Performance Requirements

The application should prioritize:

-   fast navigation
-   progressive loading
-   responsive dashboards
-   cached analytics where appropriate
-   asynchronous AI generation
-   optimistic updates for safe interactions
-   efficient media loading
-   pagination for large content/post datasets

The UI should feel fast even when AI jobs or external API requests are
slow.

------------------------------------------------------------------------

# 50. Accessibility

Requirements:

-   keyboard navigation
-   visible focus states
-   semantic HTML
-   accessible forms
-   sufficient contrast
-   screen-reader friendly interactions
-   responsive layouts
-   accessible charts and data summaries

------------------------------------------------------------------------

# 51. Responsive Requirements

The product should support:

-   desktop
-   tablet
-   mobile

The sidebar should collapse appropriately.

The calendar, content studio, analytics charts, and approval workflow
need explicit responsive behavior.

------------------------------------------------------------------------

# 52. Business Success Metrics

The product should ultimately optimize for business outcomes, not vanity
metrics.

## Product Metrics

-   brands onboarded
-   active brands
-   weekly active marketing users
-   content generated
-   content approved
-   content published
-   campaigns created
-   connected accounts
-   AI Copilot usage
-   recommendation acceptance rate

## Marketing Outcome Metrics

-   engagement lift
-   CTR lift
-   qualified lead lift
-   conversion lift
-   revenue attributed
-   organic traffic growth
-   content production time saved

## AI Quality Metrics

-   Brand Fit score
-   factuality
-   regeneration rate
-   approval rate
-   recommendation acceptance
-   recommendation success
-   prediction accuracy
-   learning confidence

------------------------------------------------------------------------

# 53. AI Cost Management

LLM and generative model usage is usage-based.

The Model Gateway should support:

-   model routing
-   cost-aware routing
-   task-specific models
-   caching
-   token monitoring
-   generation limits
-   tenant-level usage tracking

Bulk generation should not automatically use the most expensive
reasoning model.

------------------------------------------------------------------------

# 54. Risks and Mitigations

## Risk: Platform API Restrictions

Mitigation:

-   abstract integrations
-   validate permissions
-   show connection state
-   graceful degradation
-   avoid promising unsupported functionality

## Risk: Insufficient Historical Data

Mitigation:

-   disable/limit Learning Engine claims
-   use baseline recommendations
-   display confidence
-   gradually activate learning

## Risk: Hallucinated Marketing Claims

Mitigation:

-   source-grounded generation
-   factuality scoring
-   human approval
-   approved claims knowledge base

## Risk: Over-Automation

Mitigation:

-   human approval
-   configurable guardrails
-   explicit action confirmation

## Risk: Generic AI Content

Mitigation:

-   Brand DNA
-   historical approved content
-   performance signals
-   platform-aware generation
-   content-gap intelligence

## Risk: Dashboard Becomes Too Complex

Mitigation:

-   progressive disclosure
-   AI briefing
-   clear priorities
-   workflow-oriented navigation
-   reduce unnecessary cards

------------------------------------------------------------------------

# 55. Out of Scope

Until separately scoped:

-   paid advertising execution before Phase 4
-   guaranteed organic reach
-   guaranteed follower growth
-   guaranteed engagement
-   unsupported platform publishing
-   fully autonomous publishing by default
-   legal/regulatory review
-   broad third-party data migration
-   platforms without stable public APIs

------------------------------------------------------------------------

# 56. Assumptions

1.  Client provides brand assets and relevant credentials.
2.  Social platform APIs remain available within documented limits.
3.  LLM/generative model costs are usage-based unless separately
    contracted.
4.  Human approval remains mandatory in MVP.
5.  Learning requires sufficient historical data.
6.  Platform capabilities may change over time.
7.  Some integrations may require separate developer/business
    verification.
8.  Data quality from third-party platforms may vary.

------------------------------------------------------------------------

# 57. Acceptance Criteria

A phase is complete when:

1.  all in-scope modules are functional in staging
2.  UAT is completed
3.  exit criteria are satisfied
4.  designated client approval is received
5.  no critical/blocking defects remain

## MVP Acceptance

The MVP specifically must demonstrate:

-   brand onboarding
-   Brand DNA
-   competitor baseline
-   strategy
-   calendar
-   generation
-   approval
-   LinkedIn/Instagram publishing
-   analytics
-   actionable AI insights

------------------------------------------------------------------------

# 58. Recommended MVP Build Order

## Sprint Group 1 --- Foundation

-   project setup
-   design system
-   authentication
-   organization/brand
-   RBAC
-   database
-   storage
-   navigation
-   core layout

## Sprint Group 2 --- Brand Intelligence

-   onboarding
-   assets
-   Brand DNA
-   guidelines
-   versioning

## Sprint Group 3 --- Competitor + Strategy

-   competitor entities
-   baseline competitor analysis
-   strategy engine
-   content pillars
-   funnel mapping

## Sprint Group 4 --- Content

-   content studio
-   source ingestion
-   AI generation
-   quality scoring
-   content versions

## Sprint Group 5 --- Approval + Publishing

-   approval queue
-   LinkedIn OAuth
-   Instagram OAuth
-   scheduling
-   publishing
-   status tracking

## Sprint Group 6 --- Analytics

-   metric ingestion
-   normalized post metrics
-   dashboard
-   platform analytics
-   AI insights

## Sprint Group 7 --- Copilot

-   natural-language queries
-   RAG
-   analytics reasoning
-   action execution

## Sprint Group 8 --- Hardening

-   security
-   tenant isolation testing
-   responsive UI
-   accessibility
-   error states
-   observability
-   UAT

------------------------------------------------------------------------

# 59. Definition of Done for a Feature

A feature is not complete when its happy path works.

It is complete when it includes:

-   UI
-   API/service logic
-   database model
-   permission checks
-   loading state
-   empty state
-   error state
-   success state
-   responsive behavior
-   accessibility
-   validation
-   auditability where appropriate
-   observability
-   tests

For AI features additionally:

-   prompt/version management
-   source context
-   output validation
-   confidence where appropriate
-   cost tracking
-   failure handling
-   human approval where required

------------------------------------------------------------------------

# 60. Design Quality Gate

Before a screen is considered complete, evaluate:

1.  Would it look out of place next to Linear?
2.  Would Framer ship it?
3.  Would Apple approve the spacing?
4.  Would Stripe designers accept the hierarchy?
5.  Does the user immediately know where they are?
6.  Does the user know what happened?
7.  Does the user know what to do next?
8.  Are loading, empty, success, and error states polished?
9.  Is the interface accessible?
10. Does the screen reduce cognitive load?

Do not settle for the first implementation.

------------------------------------------------------------------------

# 61. Final Product Experience

The final product should feel like a single intelligent system rather
than ten disconnected AI tools.

A user should be able to move naturally through:

``` text
"My brand is underperforming."
        ↓
AI explains why.
        ↓
"Here is what the market is doing."
        ↓
"Here is what competitors are missing."
        ↓
"Here is the strategy we recommend."
        ↓
"Here are the posts to create."
        ↓
"Here are the generated assets."
        ↓
"Approve them."
        ↓
"Publish them."
        ↓
"Here is what happened."
        ↓
"Here is what we learned."
        ↓
"Here is how the next strategy should change."
```

That closed loop is the product.

------------------------------------------------------------------------

# 62. Product North Star

The product should ultimately make the following statement true:

> **A marketing team should not have to manually connect market
> research, competitor research, strategy, content creation, publishing,
> and performance analysis. The AI Brand Growth Engine should
> continuously connect those activities into one explainable,
> measurable, and progressively self-optimizing system.**

The MVP proves the loop.

Phase 2 expands intelligence.

Phase 3 adds learning.

Phase 4 moves toward the AI CMO.

------------------------------------------------------------------------

# 63. Source Consolidation Notes

## Scope of Work

Defines the 10 engines, phased delivery, social integrations, analytics,
AI analyst, SEO, reporting, learning engine, technical architecture,
multi-tenancy, roles, assumptions, acceptance criteria, and out-of-scope
boundaries.

## Product Requirements

Defines the core concept, 10 functional engines, phases, and the
critical positioning that this is an AI marketing decision engine rather
than simply a content generator.

## System Architecture

Defines Next.js/TypeScript/Tailwind/shadcn and the application layers,
AI agent architecture, model gateway, PostgreSQL, vector storage, object
storage, analytics storage, and RBAC/multi-tenancy.

## UX Guidelines / Engineering Agent Guidance

Defines the premium visual quality bar, typography, colors, spacing,
components, motion, accessibility, responsive behavior, loading states,
and reusable design-system expectations.

## README

Confirms the project is a Next.js application and provides the local
development entry point.

## Mock UI Review

The supplied screens establish the current visual direction and
demonstrate the intended experiences for:

-   landing page
-   dashboard
-   Brand Intelligence
-   Competitor Intelligence
-   Market Intelligence
-   Content Engine
-   Publishing
-   Analytics
-   SEO Engine
-   AI Marketing Copilot

The mock UI should be treated as the visual foundation, with the
product-flow and phase adjustments defined in this PRD.

------------------------------------------------------------------------

# 64. Open Product Decisions

The following should be finalized before or during implementation:

1.  Final MVP platform permissions for LinkedIn and Instagram.
2.  Exact social account types supported.
3.  Vector storage choice, with pgvector recommended for MVP.
4.  LLM/model providers.
5.  Image/video generation providers.
6.  AI cost limits per tenant.
7.  Exact KPI definitions.
8.  Attribution methodology for leads/revenue.
9.  Approval policy by content risk.
10. Organization vs brand hierarchy.
11. Notification channels.
12. Data retention policy.
13. Analytics sync frequency.
14. Competitor data acquisition method where official APIs do not
    provide required data.
15. Phase 2 scope confirmation.
16. Final commercial packaging and plan limits.

------------------------------------------------------------------------

# 65. Immediate Implementation Priorities

Before adding advanced AI capabilities, the engineering team should
establish:

1.  Multi-tenant foundation
2.  Auth/RBAC
3.  Brand model
4.  Brand DNA and asset ingestion
5.  Content model
6.  Strategy model
7.  Approval workflow
8.  Social connection abstraction
9.  Publishing abstraction
10. Analytics normalization
11. AI Orchestrator
12. Model Gateway
13. RAG/knowledge layer
14. Audit logging
15. Observability
16. Design system

Then implement the MVP closed loop.

------------------------------------------------------------------------

# 66. Final Scope Summary

### MVP

**Brand → Competitor → Strategy → Content → Approval → Publish →
Analytics → Copilot**

### Phase 2

**Market Intelligence → SEO → Campaigns → Repurposing → More Platforms →
Reporting**

### Phase 3

**Learning → Prediction → Experimentation → Self-Adjusting Planner**

### Phase 4

**AI CMO → Autonomous Optimization → Paid Ads → Budget Optimization →
Revenue Attribution**

------------------------------------------------------------------------

## Final Product Statement

**AI Brand Growth Engine is an AI-native marketing operating system that
continuously understands a brand, analyzes competitors and market
signals, converts intelligence into strategy, creates and publishes
platform-aware content, measures outcomes, explains performance, and
learns from results to improve future marketing decisions.**

It is designed to turn fragmented digital marketing operations into one
continuous, explainable, human-supervised growth loop.
