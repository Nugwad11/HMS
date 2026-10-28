This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Backend (accounts and profiles)

Accounts, sessions, email verification codes and profiles live in a local SQLite file through Drizzle ORM.
Nothing external is required: the database and its migrations are created on first request.

- Database: `data/covenant.db` (override with `DATABASE_PATH`). WAL mode and foreign keys are on.
- Schema: `lib/db/schema.ts` — `users`, `sessions`, `email_codes`, `profiles`.
- Migrations: `drizzle/` is generated with `npm run db:generate` and applied automatically at runtime.
- Passwords: scrypt with a random per-user salt (`lib/server/password.ts`); plaintext is never stored.
- Sessions: opaque 32-byte tokens stored only as SHA-256 hashes in `sessions`, delivered in an httpOnly,
  SameSite=Lax cookie that is `Secure` in production.
- Email verification: 6-digit codes hashed at rest, 10-minute expiry, 5 attempts, 5 requests per 15-minute
  window. No mailer is connected, so the demo returns the code to the UI and the demo inbox. Set
  `COVENANT_DEMO_MODE=false` to stop returning it, e.g. once a real mailer exists.
- API: `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/session`,
  `/api/auth/email/code`, `/api/auth/email/verify`, `/api/profile` (GET/PATCH) and `/api/account` (DELETE,
  password-confirmed and cascading).
- Requests are rate-limited in memory, mutations are same-origin checked and JSON bodies are capped at 1.5MB.

What stays in the browser for now: matches, chat, interests, flags, the demo inbox, verification tiers for
phone/photo/ID and Premium. They are stored per account under `covenant-demo-v4:<userId>`. A legacy
`covenant-demo-v3` bundle is claimed once into the first account, but trust tier and Premium are reset on
registration so a new account starts unverified and unpaid. Moving those remaining features server-side is
the next slice; until then they are simulated.

Tests cover the server logic against in-memory SQLite with the real migrations: `npm test`.

## Device location (optional)

The city or state field on signup and profile can read a one-off GPS position from the browser, which uses
Google location services on most Android phones. `/api/location` converts the coordinates to a Nigerian city or
state and returns only that label; the coordinates are never stored. Without configuration it falls back to the
nearest state capital, so this works offline and with no credentials.

For precise city names, set a server-side Google Geocoding key. It is read only inside the route handler and is
never sent to the browser:

```bash
GOOGLE_GEOCODING_API_KEY=your-key
```

Browsers only expose geolocation on HTTPS or localhost. To try this from a phone against the dev server, use an
HTTPS tunnel or `next dev --experimental-https`; a plain LAN address such as `http://192.168.x.x:3000` will be
blocked by the browser. Deployed sites are HTTPS, so the button works there normally.

## Installable app (PWA)

`app/manifest.ts` serves `/manifest.webmanifest` with the Covenant name, standalone display, portrait
orientation and theme colours. Icons live in `app/icon.png` and `app/apple-icon.png` (browser tab and iOS home
screen) plus `public/icons/` (192px, 512px and a 512px maskable icon used by Android).

`public/sw.js` is a network-only service worker so browsers treat the site as installable. It deliberately
caches nothing: the demo reads live browser state, and offline caching would serve stale screens. The worker
registers only in production builds, so `npm run build && npm run start` is the way to test installation.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
