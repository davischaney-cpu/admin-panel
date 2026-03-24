# Billing / Notifications Setup Notes

## Stripe

Current state:
- Billing UI exists in the dashboard
- `/api/billing/checkout` now creates a real Stripe Checkout session when env vars are configured
- `/api/billing/portal` opens the Stripe billing portal for existing customers

Required env vars:
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_STARTER`
- `STRIPE_PRICE_PRO`
- `STRIPE_PRICE_TEAM`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (optional for future client-side work)

Still needed for full billing lifecycle:
- Stripe products/prices created in the Stripe dashboard
- webhook handling to sync subscription status + billing plan back into Prisma
- optional upgrade/downgrade UI state based on the user’s actual plan

## Notifications

Current state:
- notification settings card exists
- `/api/notifications/test` is scaffolded
- no mail or SMS provider connected yet

Recommended providers:
- Email: Resend / Postmark
- SMS: Twilio

Suggested env vars:
- `RESEND_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`

## Demo workspace

Current state:
- `/api/demo/seed` loads a clean CRM demo workspace
- `/api/demo/reset` clears leads and jobs

Use this for:
- sales screenshots
- demo calls
- product walkthrough videos
