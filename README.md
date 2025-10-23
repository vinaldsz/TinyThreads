# TinyThreads - Next + Express scaffold

This repository contains a minimal Next.js app served through an Express server.

Quick start

1. Install dependencies

```bash
npm install
```

2. Run the dev server (uses `server/index.js` which starts Next in dev mode):

```bash
npm run dev
```

3. Open http://localhost:3000

Scripts

- `npm run dev` — start the Express+Next dev server
- `npm run build` — build the Next app
- `npm run start` — start production server (run after `build`)
- `npm run lint` — run ESLint

What I added

- `server/index.js` — Express server that handles Next requests and a sample API route `/api/hello`.
- `pages/*` — minimal Next pages.
- `.eslintrc.json` — ESLint config using Next rules.


- Add TypeScript support
- Add API routes under `pages/api` or move to Express endpoints
- Integrate Firebase/Firestore into the project
- Add testing (Jest/Playwright)
