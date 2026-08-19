# INFERNO

INFERNO is a pnpm monorepo with separate React/Vite/React Router and NestJS applications plus a small shared TypeScript package.

## Structure

```text
apps/
  client/       React + Vite frontend
  server/       NestJS API
packages/
  shared/       Shared TypeScript types
```

## Requirements

- Node.js 20.19 or newer
- pnpm 10 or newer

## Installation

```bash
pnpm install
```

## Commands

Run all applications:

```bash
pnpm dev
```

Run only the client:

```bash
pnpm dev:client
```

Run only the server:

```bash
pnpm dev:server
```

Check TypeScript across the workspace:

```bash
pnpm typecheck
```

Build all packages and applications:

```bash
pnpm build
```

The client runs at `http://localhost:5173` and the API runs at `http://localhost:3000` by default.

## Telegram authentication

INFERNO uses Telegram's OpenID Connect Authorization Code flow with PKCE. The client only redirects the browser to the API; the API performs the code exchange, validates Telegram's signed ID token, and creates a separate HttpOnly INFERNO session cookie.

### BotFather setup

BotFather configuration is a manual step and cannot be performed by the application:

1. Create or select the Telegram bot that represents INFERNO.
2. Open the bot's **Login Widget** settings in BotFather.
3. Add the frontend origin and the exact OIDC callback URL to **Allowed URLs**. For local development these defaults are `http://localhost:5173` and `http://localhost:3000/auth/telegram/callback`.
4. Copy the displayed Client ID and Client Secret into `apps/server/.env` using `apps/server/.env.example` as the template.
5. Set a random `SESSION_SECRET` containing at least 32 characters.
6. Set `VITE_API_URL` in `apps/client/.env` using `apps/client/.env.example` as the template.

Never commit real credentials. Telegram may require a registered HTTPS development URL, so an HTTPS tunnel or a dedicated development domain can be used when localhost is not accepted.

The available auth endpoints are:

```text
GET  /auth/telegram/start
GET  /auth/telegram/callback
GET  /auth/me
POST /auth/logout
```

There is no database in the project yet. The verified Telegram identity is therefore kept only in a short-lived, signed application session. Persistent user creation should be added when database integration is introduced.
