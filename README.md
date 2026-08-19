# Ammar Website Brief

Premium multi-step website brief for Vercel. Valid submissions become cards in a private Trello list and trigger a private SMTP notification to Ammar; all credentials remain server-side.

## Deploy

1. Import this folder as a new Vercel project, or run `npx vercel` here.
2. In Vercel Project Settings → Environment Variables add:
   - `TRELLO_API_KEY`
   - `TRELLO_TOKEN`
   - `TRELLO_LIST_ID` (the internal ID of the destination list)
   - `SMTP_HOST` (`smtp.gmail.com` for Gmail)
   - `SMTP_PORT` (`465`)
   - `SMTP_SECURE` (`true`)
   - `SMTP_USER` (the sender Gmail address)
   - `SMTP_APP_PASSWORD` (Google App Password, not the normal password)
   - `NOTIFY_EMAIL` (where new brief notifications should arrive)
3. Deploy, then submit one test brief and confirm the Trello card.
4. Add a custom domain such as `brief.ammarportfolio.xyz` in Vercel if desired.

Never put Trello credentials in `app.js`, `index.html`, Git, or any variable prefixed with `NEXT_PUBLIC_` / `VITE_`. Rotate the Trello token if it has ever been exposed publicly.

## Local preview

The UI can be previewed with any static server. Full submission requires Vercel Functions:

```powershell
npx vercel dev
```

Copy `.env.example` to `.env.local` and fill the values for local submissions. `.env.local` is ignored by Git.
