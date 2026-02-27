# VC Intelligence

VC Intelligence is a Next.js application for browsing, enriching, and organizing startup/company data for investment-style research workflows.

## Current Stack

- Next.js 16.1.6 (App Router, Turbopack)
- React 19.2.3
- TypeScript 5
- ESLint 9

## Features

- Company directory with search, filter, and sorting
- Pagination on the companies page (7 companies per page)
- Company profile view with re-enrichment simulation and JSON export
- Save companies to local storage
- Create and manage custom lists
- Local API route for enrichment (`POST /api/enrich`)

## Data Notes

- The app ships with 20 mock companies in `lib/mockData.ts`
- Company and list state is persisted in `localStorage` for client-side workflows

## Project Structure

```text
app/
  api/enrich/route.ts       API enrichment endpoint
  companies/page.tsx        Company table, filters, pagination
  companies/[id]/page.tsx   Company profile page
  lists/page.tsx            List management UI
  saved/page.tsx            Saved companies UI
lib/
  mockData.ts               Company seed data
  listManager.ts            List persistence helpers
  searchManager.ts          Saved company/search helpers
components/
  AppLayout.tsx             App layout shell
```

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` in the project root and add required keys:

```env
GOOGLE_API_KEY=
GOOGLE_MODEL=gemini-1.5-flash
ENRICHMENT_PROVIDER=google
SCRAPING_API_KEY=
```

Optional fallbacks:

```env
GOOGLE_API_KEY_2=
GOOGLE_API_KEYS=
```

3. Start development server:

```bash
npm run dev
```

4. Open `http://localhost:3000`

## Scripts

- `npm run dev` - start local dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - run ESLint

## Quality Checks

Recommended before creating a PR:

```bash
npm run lint
npm run build
```

## Pull Request Workflow

```bash
git checkout -b feat/your-change
git add .
git commit -m "Describe your change"
git push -u origin feat/your-change
# then open a PR on GitHub
```
