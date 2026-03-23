# Public Deployment Guide

This app is ready to be hosted publicly on the internet while still requiring sign-in/admin access.

## Recommended stack

- **Frontend/runtime:** Vercel
- **Database:** Neon Postgres
- **Auth:** Clerk
- **Domain:** optional custom domain later

## Before deploying

Make sure you have:

- a GitHub repo for this project
- a Vercel account
- a Clerk production app
- a production Postgres database
- Canvas API credentials if you want sync/import features to work in production

## Required environment variables

Set these in Vercel Project Settings → Environment Variables:

### Clerk
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`

### Database
- `DATABASE_URL`

### Canvas
- `CANVAS_BASE_URL`
- `CANVAS_API_TOKEN`

### Optional
- `NEXT_PUBLIC_APP_URL=https://your-app.vercel.app`

## Clerk production config

In Clerk:

1. Create or use a **production** Clerk app
2. Add your Vercel URL as an allowed origin/redirect host
3. Set the same sign-in/sign-up URLs (`/login` and `/sign-up`)
4. Make sure your user has `publicMetadata.role = "admin"`

## Deploy on Vercel

### Option A: easiest
1. Push this project to GitHub
2. In Vercel, click **Add New Project**
3. Import the repo
4. Add the environment variables above
5. Deploy

### Option B: CLI
```bash
npm i -g vercel
vercel
vercel --prod
```

## Database notes

This app uses Prisma with Postgres.

If your production database is empty, run the schema migrations against it before first use.

Typical flow:
```bash
npx prisma migrate deploy
```

If needed:
```bash
npx prisma generate
```

## Security notes

- The app can be public on the web **without** being open to everyone
- Clerk protects dashboard routes and API routes
- Admin-only UI still depends on your Clerk `publicMetadata.role`
- Keep Canvas tokens and database credentials server-side only

## After deploy checklist

- [ ] Visit deployed URL
- [ ] Confirm Clerk login works
- [ ] Confirm admin account can access dashboard
- [ ] Confirm non-admin account is blocked
- [ ] Confirm database reads/writes work
- [ ] Confirm Canvas sync works
- [ ] Add custom domain if desired
