# TinyThreads

TinyThreads is a small marketplace prototype built with Next.js (App Router) focused on fast client-side image preview and S3-based storage for listings. This repository contains the application code, test pages, and small server endpoints used during development.

## MVP (minimum viable product)

A marketplace that enables parents to list and browse second-hand baby clothes and toys in under 60 seconds per item.

Key capabilities (MVP):

- Browse local inventory by size, category (clothes/toys), and condition.
- Create a listing in ~60 seconds: photo(s), size, brief title, price, and short description.
- Optional client-side compression, then upload to S3.

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
S3_BUCKET_NAME=tinythreads-s3-bucket
S3_PUBLIC_BASE=https://tinythreads-s3-bucket.s3.us-east-1.amazonaws.com
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID_HERE
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY_HERE
```

- If you do not plan to test S3 endpoints, you may omit the AWS variables; the app will throw if code paths that require AWS are executed.

3. Start the dev server

```bash
npm run dev
```

4. Open http://localhost:3000 in your browser

## Environment variable reference

- `S3_BUCKET_NAME` — required for S3 operations
- `S3_PUBLIC_BASE` — optional base URL for public object URLs
- `AWS_REGION` — required when talking to AWS
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` — AWS credentials for local testing

## Developer workflows

- Branching: create feature branches from `main`. Example:

```bash
git checkout -b feature/your-feature main
```

- Creating a Pull Request:
  - Via web: https://github.com/vinaldsz/TinyThreads/compare/main...feature/your-branch
  - Via GitHub CLI (after `gh auth login --web`):

```bash
gh pr create --base main --head feature/your-branch --title "Short title" --body "Description"
```

If GitHub reports the branches have no common history, recreate a branch from `main` and cherry-pick your commits (recommended) rather than force-pushing unrelated histories.

## Documentation & useful links

- Project board activity:

  - Board: https://github.com/vinaldsz/TinyThreads/projects
  - Milestones: https://github.com/vinaldsz/TinyThreads/milestones
  - Insights: https://github.com/vinaldsz/TinyThreads/pulse

- Sprint Evidence: Refer `sprint-evidence.md`

## Repository tree (hierarchical view)

- .eslintrc.json
- .gitignore
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
  - file.svg
  - globe.svg
  - next.svg
  - vercel.svg
  - window.svg
- src/
  - app/
    - Items/
      - [id]/
        - page.js
    - add-listing/
      - page.js
      - page.module.css
    - favicon.ico
    - globals.css
    - layout.js
    - page.js
    - page.module.css
  - components/
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
  - lib/
    - awss3.js
    - mongodb.js
  - services/
    - itemService.js
  - types/
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
  - Documentation files

## Contributing

- Open an issue or a PR using the flow above. Keep PRs small and focused.

## License

This project is released under the MIT License. See `LICENSE` for details.
