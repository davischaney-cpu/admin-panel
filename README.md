# Admin Panel

A Next.js dashboard for school data with Clerk auth, Prisma/Postgres, Canvas sync, assignments, calendar views, and course detail pages.

## Features

- Clerk authentication
- Admin-only dashboard access
- Prisma + Postgres
- Canvas course and assignment sync
- Calendar view
- Assignment command center
- Course detail pages

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

- Clerk keys
- `DATABASE_URL`
- Canvas credentials if using sync/import features

## Production deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md).

## Build

```bash
npm run build
```
