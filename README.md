# TinyThreads - Baby Clothes Marketplace

TinyThreads is a small marketplace prototype built with Next.js (App Router) focused on fast client-side image preview and S3-based storage for listings. This repository contains the application code, test pages, and small server endpoints used during development.

## MVP (minimum viable product)

A marketplace that enables parents to list and browse second-hand baby clothes and toys in under 60 seconds per item.

### Sprint 2 – Updated MVP Capabilities

The MVP has evolved significantly since Sprint 0. As of Sprint 2, the live deployed version supports:

- **Browse & Search**: Users can browse all available listings and search by keyword.
- **Advanced Filtering (#16)**: Filter by size, category, condition, and price range.
- **Real Production Listings (#48)**: Production database populated with real inventory instead of mock data.
- **Add Listing Flow**: Create a listing in ~60 seconds with:
  - Title, size, category, condition, age range, location, price, description
  - Single image upload (validated for type & file size ≤ 5MB)
  - Real-time preview
- **Form Validations (#40)**:
  - Required fields enforced
  - Input sanitization (e.g., `1=1` does not bypass validation)
  - File size/type validation
- **Back Navigation (#44)**: Users can return to home without listing an item.
- **Brand Identity (#45)**: Professional TinyThreads logo integrated into the navbar.
- **About Page (#46)**: A dedicated, styled page explaining the platform’s mission and team.
- **CI/CD Pipeline (#35)**: Pull Requests trigger linting, testing, and build checks.
- **Separate Dev Infrastructure (#43)**: Distinct dev MongoDB and dev S3 bucket.
- **Test Coverage (#38)**: 282 tests across 12 suites with ~77% coverage.

### Live Production Deployment

The MVP is deployed and accessible at:

```
https://tiny-threads-ten.vercel.app
```

This represents the current working version demoed to the Product Owner.

## Value proposition — how TinyThreads is better than alternatives

Current alternatives (users' pain points):

- Facebook Marketplace:
  - Takes 10+ minutes to list each item individually.
  - Search results are noisy and often irrelevant (search "2T" can return unrelated electronics or adult items).
  - Generic platform not optimized for baby clothes.
- Physical consignment stores:
  - Limited hours of operation (closed evenings/weekends).
  - High commission fees (30–50%).

How TinyThreads MVP adds value:

- Speed — 10x faster listing
  - Them: ~10 minutes per item on Facebook Marketplace
  - Us: ~60 seconds per listing in TinyThreads
  - Value: Save hours when selling multiple items; lower friction improves supply and listing frequency.

- Relevance — baby-specific
  - Them: Search through random, unrelated items
  - Us: Only baby clothes (0–5 years) and toys, categorized by size and type
  - Value: Buyers find the right items in seconds; sellers reach a highly relevant audience.

## User problems this MVP solves

1. Primary user problem

Parents waste money buying baby clothes that are only used for a short period, and disposing of them is either time-consuming (listing individually) or yields little financial return (donation).

2. Specific pain points surfaced in interviews and how the MVP addresses them

- Problem 1: Time investment vs. return
  - User quote (Tiffany): "I tried Facebook Marketplace once, but it was such a hassle - taking photos, meeting strangers. Now I just donate and take the tax deduction."
  - How MVP solves: 60-second listing creation means the effort is worth the return; quicker listings increase the chance of selling.

- Problem 2: Clutter & storage
  - User quote (Bhavi): "Sorting takes a weekend; frustrating and feels wasteful."
  - How MVP solves: Quick listing and deletion mean items don't pile up; easier turnover reduces household clutter.

- Problem 3: Finding right size quickly
  - User quote (Cathy): "Growth spurt happened overnight. Spent whole morning on failed Target trips."
  - How MVP solves: Browse by size and see local inventory instantly so parents can find available items fast.

- Problem 4: Wastefulness
  - User quote (Bhavi): "Biggest frustration: waste of barely worn outfits."
  - How MVP solves: Easy resale reduces waste and helps families recoup value from lightly worn items.

## Quick start (local development)

Requirements:

- Node.js (>=16) and npm
- (Optional for S3 tests) AWS credentials with S3 access

1. Install dependencies

```bash
npm install
```

2. Create `.env.local` in the repository root with these variables (do NOT commit secrets):

```
# MongoDB
MONGODB_URI=mongodb+srv://<db-username>:<db-password>@TinyThreads.houabd4.mongodb.net/tinythreads?retryWrites=true&w=majority&appName=TinyThreads
MONGODB_DB=tinythreads

# AWS S3
S3_BUCKET_NAME=tinythreads-s3-bucket
S3_PUBLIC_BASE=https://tinythreads-s3-bucket.s3.us-east-1.amazonaws.com
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID_HERE
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY_HERE

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@tinythreads.com
FOUNDERS_EMAIL=founders@tinythreads.com

# Stripe (optional for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# General
NODE_ENV=development
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

- If you do not plan to test S3 endpoints, you may omit the AWS variables; the app will throw if code paths that require AWS are executed.
- For email functionality, configure SMTP credentials with your email provider (Gmail, SendGrid, etc.)
- For authentication, obtain Google OAuth credentials from https://console.cloud.google.com
- Gmail SMTP quick path: Google Account → Security → 2-Step Verification → App passwords → Select app “Mail”, device “Other (Custom name)” → generate 16-character password. Use your Gmail address as `SMTP_USER` and the generated app password as `SMTP_PASS`.

3. Start the dev server

```bash
npm run dev
```

4. Open http://localhost:3000 in your browser

## Environment variable reference

### Database

- `MONGODB_URI` — MongoDB connection string (required)
- `MONGODB_DB` — Database name (required, default: "tinythreads")
- `NODE_ENV` — Environment ("development" or "production")

### AWS S3

- `S3_BUCKET_NAME` — S3 bucket name (required for file uploads)
- `S3_PUBLIC_BASE` — Base URL for public S3 objects (required for S3 operations)
- `AWS_REGION` — AWS region (default: "us-east-1")
- `AWS_ACCESS_KEY_ID` — AWS access key (required for S3 operations)
- `AWS_SECRET_ACCESS_KEY` — AWS secret key (required for S3 operations)

### Authentication (NextAuth + Google OAuth)

- `NEXTAUTH_URL` — NextAuth callback URL (e.g., http://localhost:3000)
- `NEXTAUTH_SECRET` — Secret key for NextAuth (generate with `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID` — Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` — Google OAuth client secret

### Email (SMTP)

- `SMTP_HOST` — SMTP server hostname (e.g., smtp.gmail.com)
- `SMTP_PORT` — SMTP port (typically 587 for TLS)
- `SMTP_SECURE` — Use TLS ("true" or "false")
- `SMTP_USER` — Email address for SMTP authentication
- `SMTP_PASS` — Email password or app-specific password
- `SMTP_FROM` — Sender email address for notifications
- `FOUNDERS_EMAIL` — Email for receiving reports/notifications

### Client-side

- `NEXT_PUBLIC_API_BASE_URL` — Base URL for API calls (e.g., http://localhost:3000)

## Developer workflows

- Branching: create feature branches from `develop`. Example:

```bash
git checkout -b feature/your-feature develop
```

- Creating a Pull Request:
  - Via web: https://github.com/vinaldsz/TinyThreads/compare/main...feature/your-branch
  - Via GitHub CLI (after `gh auth login --web`):

```bash
gh pr create --base main --head feature/your-branch --title "Short title" --body "Description"
```

If GitHub reports the branches have no common history, recreate a branch from `main` and cherry-pick your commits (recommended) rather than force-pushing unrelated histories.

## Testing

TinyThreads uses **Jest** and **React Testing Library** for automated testing.

Run all tests:

```bash
npm run test
```

Run in watch mode:

```bash
npm run test:watch
```

Run coverage:

```bash
npm run test:coverage
```

Test suites are located under:

```
src/**/__tests__/
```

## Linting & Formatting

Run eslint:

```bash
npm run lint
```

Run Prettier (format all files):

```bash
npm run format
```

Eslint is configured via `eslint.config.mjs`, and Prettier is set up to ensure consistent code style.

## CI/CD Pipeline Overview

CI is configured using GitHub Actions (`.github/workflows/CI.yml`).

On every Pull Request:

- Install dependencies
- Run `npm run lint`
- Run tests
- Run build

All checks must pass before merging due to branch protection rules.

Deployment:

- Production is deployed on Vercel at:  
  https://tiny-threads-ten.vercel.app

### CI Pipeline Link

View all CI runs here:
https://github.com/vinaldsz/TinyThreads/actions

### How CI/CD Works

1. Developer opens a Pull Request into `develop`.
2. GitHub Actions (`.github/workflows/CI.yml`) runs automatically:
   - Install dependencies
   - Run ESLint
   - Run Jest tests
   - Run Next.js build
3. PR cannot be merged unless all checks pass.
4. On merging `develop` → `main`, the team manually triggers a production deployment using Vercel.

### Deployment Details

- **Deployment Type:** Manual trigger on Vercel
- **Dev Environment:** Uses separate Dev MongoDB + Dev S3 bucket
- **Prod Environment:** Uses production MongoDB + production S3 bucket
- **Rollback:** Previous commit can be redeployed from Vercel dashboard under _Deployments_.

## Branching Strategy

- `main` — Production-ready code
- `development` — Integration branch
- `feature/*` — Feature-specific branches

Pull Requests:

- Feature → development
- Development → main (production release)

## Testing Strategy Overview

We follow a layered testing approach:

- **Unit tests:** Components, services, utils
- **Integration tests:** API interactions & component flows
- **End-to-end tests:** Critical flows (future addition)

Coverage target: **≥70%** (current: ~77%).

### Current Sprint 2 Testing Summary

- **282 tests** across **12 test suites**.
- **77% overall coverage** (statements, branches, functions, and lines).
- Core areas covered:
  - FilterBar filtering logic
  - ItemGrid pagination & load‑more behavior
  - ItemCard interactions and routing
  - ItemDetail rendering and fallback states
  - Add Listing form validations (client-side)
  - AWS S3 upload utility (mocked)
  - MongoDB connection utility (mocked)
  - ItemService business logic for listings
- Error and edge cases covered:
  - Empty results in filters
  - Failed load-more operations
  - Invalid file upload type/size
  - Missing form fields

  These tests collectively ensure the core user flows (browse → filter → view → add listing) remain stable across code changes.

## Deployment Information

Production URL:

```
https://tiny-threads-ten.vercel.app
```

No setup required for PO review:

- Real production database
- S3 storage configured
- All features fully functional

## Documentation & useful links

- Project board activity:
  - Board: https://github.com/vinaldsz/TinyThreads/projects
  - Milestones: https://github.com/vinaldsz/TinyThreads/milestones
  - Insights: https://github.com/vinaldsz/TinyThreads/pulse

- Sprint Evidence: Refer `docs/Sprint-2/sprint-evidence.md`

## Repository tree (hierarchical view)

- .eslintrc.json
- .gitignore
- .prettierrc
- LICENSE
- README.md
- changed_files.txt
- eslint.config.mjs
- next-env.d.ts
- next.config.mjs
- next.config.ts
- nodemon.json
- package-lock.json
- package.json
- postcss.config.mjs
- public/
  - Images/about/team
    - member-1.png
    - member-2.png
    - member-3.png
      journey-child.png
  - file.svg
  - globe.svg
  - next.svg
  - vercel.svg
  - window.svg
  - TinyThreadsLogo.png
  - TinyThreadsScribble.png
- src/
  - app/
    - **tests**/
      - layout.test.js
      - page.test.js
    - about/
      - page.js
      - page.module.css
      - components/
        - BeliefCard/
        - JourneySection/
        - TeamCard/
    - add-listing/
      - **tests**/
        - page.test.js
      - actions.js
      - page.js
      - page.module.css
    - api/items/
      - id/route.js
      - route.js
    - Items/
      - [id]/
        - page.js
    - favicon.ico
    - globals.css
    - layout.js
    - page.js
    - page.module.css
  - components/
    - **tests**/
    - FilterBar/
      - FilterBar.js
      - FilterBar.module.css
    - ItemCard/
      - ItemCard.js
      - ItemCard.module.css
    - ItemDetail/
      - ItemDetail.js
      - ItemDetail.module.css
    - ItemGrid/
      - ItemGrid.js
      - ItemGrid.module.css
    - Navbar/
      - Navbar.js
      - Navbar.module.css
  - lib/
    - tests/
    - awss3.js
    - mongodb.js
  - services/
    - tests/
    - itemService.js
  - types/
    - tests/
    - item.js
- styles/
  - globals.css
- tsconfig.json

## Key files and purpose (quick guide)

- README.md
  - Project overview, setup and usage instructions (primary documentation entry).
- package.json / package-lock.json
  - Project dependencies and scripts.
- next.config.mjs / next.config.ts
  - Next.js build/runtime configuration.
- src/app/
  - Application routes and pages (Next.js app directory).
  - `src/app/add-listing` — Add listing UI.
  - `src/app/Items/[id]/page.js` — Item detail route.
- src/components/
  - Reusable UI components:
    - FilterBar, ItemCard, ItemDetail, ItemGrid.
- src/lib/
  - Infrastructure helpers:
    - `awss3.js` — S3 upload/presigned integration
    - `mongodb.js` — MongoDB connection helper
- src/services/itemService.js
  - Business logic / API helpers for listings
- public/
  - Static assets (SVG icons)
- docs/
  - `Sprint Planning Artifacts.pdf` — Effort Planning, MVP Planning, Daily Standup meeting notes
  - `sprint-evidence.md` - Detailed sprint details.

## Contributing

- Open an issue or a PR using the flow above. Keep PRs small and focused.

## License

This project is released under the MIT License. See `LICENSE` for details.
