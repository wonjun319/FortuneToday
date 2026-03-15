# LuckMatchDay

Next.js app for team-specific KBO matchup and fortune pages opened from NFC links.

## Protected Access

Plain `/team/{route-slug}` URLs are blocked by [`middleware.ts`](/c:/Users/I/Desktop/luckmatchday/middleware.ts).

Allowed flow:

1. Open an encrypted link at `/t/{token}`
2. Server decrypts and validates the token
3. Server issues a short-lived `HttpOnly` session cookie
4. User is redirected to `/team/{route-slug}`

## Environment Variables

Set these before local run or deployment:

```bash
LMD_ACCESS_SECRET=replace-this-with-a-long-random-secret
LMD_BASE_URL=https://luckmatchday.xyz
LMD_URL_TOKEN_TTL_MINUTES=0
LMD_SESSION_TTL_MINUTES=1
```

`LMD_URL_TOKEN_TTL_MINUTES=0` means the encrypted URL token does not expire.

## Generate a Team Access URL

```bash
npm run token -- tigers
```

This prints an encrypted token and a full `/t/{token}` URL.

## Local Run

```bash
npm install
npm run dev
```

## Routes

- `/`: landing page
- `/t/[token]`: decrypts token and creates an access session
- `/team/[team]`: protected team page using public route slugs like `tigers`, `lions`, `bears`

## Data Update

- Scheduled crawl: daily 03:10 KST
- Manual crawl: `npm run crawl`
