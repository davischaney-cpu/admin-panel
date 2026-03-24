# Billing / Notifications Setup Notes

## Stripe

Current state:
- Billing UI exists in the dashboard
- `/api/billing/checkout` is scaffolded
- live checkout is not connected yet

To finish Stripe:
- create Stripe products/prices for Starter / Pro / Team
- add env vars:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PRICE_STARTER`
  - `STRIPE_PRICE_PRO`
  - `STRIPE_PRICE_TEAM`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (optional later for client-side flows)
- replace the 501 response in `/api/billing/checkout` with real Stripe session creation

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
