# Opulent

Game top-up store for Nepal. Customers order in NPR, pay with eSewa, and send proof on WhatsApp. An admin team verifies each payment by hand and tops up the account.

## Screenshots

Add screenshots of the home page, game page, checkout, order timeline and admin order page to docs/screenshots and link them here.

## What is implemented

- Public catalogue of games and packages, with unavailable packages shown as unavailable
- Player lookup (name, level, region) for Free Fire, PUBG Mobile and Mobile Legends, with a typed-name fallback
- Order creation with server-side prices, price snapshots, idempotency and a signed lookup token
- Checkout with eSewa QR, exact amount, WhatsApp handoff, and an optional "I have sent my proof" signal
- Admin queue, claim, confirm payment (eSewa transaction IDs), hold, complete, fail, retry, cancel, reopen
- Refunds with their own statuses, owner approval and paid-out reference
- Owner and operator roles, owner-only team, users, payment settings and audit log
- Telegram alerts and reminders, dashboard, reconciliation CSV export
- Terms, refund policy and privacy policy pages

## Stack

| Part       | Technology                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| Frontend   | React, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query, React Hook Form, Zod, Radix Dialog |
| Backend    | Node.js, Express 5, TypeScript, MongoDB with Mongoose, Zod, pino                                        |
| Auth       | Clerk                                                                                                   |
| Storage    | Cloudinary (game artwork and the payment QR image)                                                      |
| Protection | Helmet, CORS allowlist, Arcjet, express-rate-limit                                                      |
| Hosting    | Vercel (frontend), Render (backend), MongoDB Atlas                                                      |

## Structure

backend/src: config, controllers, services, routes, models, middleware, validators, utils, jobs, scripts
frontend/src: components, pages, layouts, hooks, services, schemas, types, utils
docs: state machine, data model, API conventions, threat model, runbook, launch modes

## Local setup

1. Create backend/.env from backend/.env.example and frontend/.env from frontend/.env.example.
2. In backend: npm install, then npm run seed:games, npm run seed:packages, npm run seed:payment -- "<qr image url>".
3. npm run dev in backend and in frontend.
4. Sign up with an address listed in OWNER_EMAILS to become owner.

## Scripts (backend)

dev, build, start, seed:owner, seed:games, seed:packages, seed:payment, cleanup:stale, remind:waiting

## Environment variables

Names are in the two .env.example files. Secrets are never committed. Frontend variables starting with VITE\_ are public.

## Deployment

See docs/10-staging-checklist.md and docs/12-launch-modes.md. render.yaml describes the Render service.

## Security

Server-side authorization on every route (docs/09-route-authorization.md). Roles are stored in the database only. Prices and statuses are never taken from the browser. Orders are protected by a state machine with conditional updates and audit logs. Rate limits, Arcjet, strict request validation, output mapping and log redaction are in place.

## Known limits

- Payment is verified by people against the eSewa statement; there is no automatic confirmation.
- A static personal QR does not carry the amount or order ID.
- Rate limits and the scheduler run inside one API instance.
- The admin MFA check depends on a Clerk claim marked experimental.
- Player lookup depends on a third-party provider and is optional.
