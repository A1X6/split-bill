# Split Bill

Split any bill in seconds. Snap a photo of the receipt, assign items to the people who had them, and everyone knows exactly what they owe — tax included.

A full Next.js app with accounts, a marketing site, and saved bill history in Postgres.

## Features

- 🔐 **Accounts** — email/password and Sign in with Google (Better Auth). The app is private to logged-in users.
- 💾 **Saved bill history** — every bill autosaves to Postgres; reopen, edit, or delete any past bill.
- 📸 **Scan receipts with AI** — photograph a receipt and the items, quantities, and taxes are extracted automatically (free OpenRouter vision models).
- 🧮 **Compound tax detection** — several taxes (e.g. VAT 14% + service 12%) combine multiplicatively (1.14 × 1.12 → 27.68%).
- 🧑‍🤝‍🧑 **Per-item splits** — shared plates split between exactly who shared them; tax lands in proportion to what each person ordered.
- ✏️ Review and edit AI-scanned items before they hit the bill.
- 🌓 Light and dark themes with a toggle.
- 📱 Responsive, from phone to desktop.

Friends on a bill are just names — only you need an account.

## Tech Stack

- **Framework**: Next.js 16, App Router (Turbopack)
- **Auth**: Better Auth (email/password + Google OAuth)
- **Database**: Postgres (Neon) via Drizzle ORM
- **UI**: Tailwind CSS 4 + shadcn/ui, Bricolage Grotesque + Geist
- **AI**: OpenRouter free vision models (Gemma 4, Nemotron Nano VL)
- **Language**: TypeScript

## Getting Started

### 1. Install

```bash
git clone https://github.com/yourusername/split-bill.git
cd split-bill
npm install
```

### 2. Environment

Copy `.env.example` to `.env.local` and fill it in:

```bash
cp .env.example .env.local
```

| Variable | Required | Where it comes from |
| --- | --- | --- |
| `DATABASE_URL` | yes | A Postgres connection string — see below |
| `BETTER_AUTH_SECRET` | yes | Generate one: `npx @better-auth/cli secret` |
| `BETTER_AUTH_URL` | yes | `http://localhost:3000` in dev; your deployed URL in production |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | no | Enables the "Continue with Google" button — see below |
| `OPENROUTER_API_KEY` | no | Enables AI receipt scanning — free key at [openrouter.ai/keys](https://openrouter.ai/keys) |

Google sign-in and receipt scanning each degrade gracefully: leave their variables unset and the rest of the app still works.

### 3. Database

Any Postgres works. Create a free database at [neon.tech](https://neon.tech) (or add the Neon integration to your Vercel project) and copy its connection string into `DATABASE_URL` — or point `DATABASE_URL` at a local Postgres instead:

```bash
docker run -d --name splitbill-pg -e POSTGRES_PASSWORD=postgres -p 55432:5432 postgres:17
# DATABASE_URL=postgresql://postgres:postgres@localhost:55432/postgres
```

The app picks its driver from the URL: a `*.neon.tech` host uses Neon's HTTP driver, anything else uses the standard `pg` driver. Create the tables:

```bash
npm run db:migrate
```

Other database commands: `npm run db:generate` (new migration from schema changes), `npm run db:push` (push schema without a migration), `npm run db:studio` (browse data).

### 4. Google sign-in (optional)

In the [Google Cloud Console](https://console.cloud.google.com):

1. **APIs & Services → OAuth consent screen** — External; add yourself as a test user while the app is unverified.
2. **Credentials → Create credentials → OAuth client ID → Web application**.
3. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google` (and the same path on your production domain).
4. Copy the client ID and secret into `.env.local`.

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How to Use

1. **Sign up** — with email and password, or with Google.
2. **New bill** — from your dashboard. It saves as you go.
3. **Add the people** splitting it (just their names).
4. **Scan the receipt** — or type items in by hand. Review what the AI read, fix anything it misread, and assign each item to the people who had it.
5. **Set the tax rate** — scanned receipts fill this in automatically.
6. **See everyone's share** — each person's items, subtotal, tax, and total.

## Deploying

Deploys to Vercel as-is. Set `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (your production URL), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `OPENROUTER_API_KEY` in the project's environment variables, add your production callback URL to the Google OAuth client, and run `npm run db:migrate` against the production database.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
