# Database Setup

Your admin panel now has Prisma wired in with PostgreSQL-ready models.

## Included models

- `User`
- `Order`
- `Role` enum (`ADMIN`, `EDITOR`, `VIEWER`)
- `OrderStatus` enum (`PAID`, `PENDING`, `REFUNDED`)

## 1) Add your Postgres connection string

Put this in `.env.local`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public"
```

You can use:
- Neon
- Supabase
- Railway
- Prisma Postgres
- local Postgres

## 2) Also add it to `.env`

Prisma CLI reads `.env` through `prisma.config.ts`, so mirror the same `DATABASE_URL` there too.

## 3) Generate the Prisma client

```bash
cd /Users/davischaney/.openclaw/workspace/admin-panel
npx prisma generate
```

## 4) Create your first migration

```bash
npx prisma migrate dev --name init
```

## 5) Start the app

```bash
npm run dev
```

## 6) Sync your Clerk user into the database

After signing in, click the **Sync my user to database** button in the dashboard.

## Notes

- Clerk still handles authentication
- Prisma + Postgres now handle application data
- The app maps Clerk `publicMetadata.role` into database roles
- If you want full production sync, next step is adding Clerk webhooks for user create/update
