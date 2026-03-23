# Better Canvas Grade Automation

This project can import the visible Better Canvas dashboard grades directly from local Chrome.

## One-time assumptions

- You are logged into Canvas in the Chrome profile at:
  - `/Users/davischaney/.openclaw/workspace/.target-profile`
- Better Canvas is installed and active in that profile.
- The admin panel is running locally at `http://localhost:3000`.

## Run the import manually

```bash
cd /Users/davischaney/.openclaw/workspace/admin-panel
npm run canvas:import-better
```

## Run it from the app

Open:

- `http://localhost:3000/canvas`
- or `http://localhost:3000/canvas/import`

Then click **Import from Canvas pages**.

What it does:
- uses your local logged-in Chrome session
- opens each active academic course's `/grades` page
- reads the visible `Total:` value from the page
- saves those grades into Postgres as the preferred imported grade source

What it does:
- launches Chrome with the local profile
- opens the Canvas dashboard
- reads `.bettercanvas-card-grade` elements
- posts those grades into `/api/canvas/import-grades`

## Notes

- This relies on your real logged-in local browser profile
- It is more accurate than the Canvas grade API for your school because it mirrors Better Canvas dashboard grades
- If Canvas or Better Canvas changes DOM/class names, the importer will need an update
