# Route authorization sheet

Levels: public, signed-in (any active account), admin (operator or owner), owner. Admin and owner routes also require MFA when REQUIRE_ADMIN_MFA is on.
A signed-in request from a suspended or deleted account is refused with 403 before any route logic runs.

## Public

| Method | Path                                                    | Notes                                                           |
| ------ | ------------------------------------------------------- | --------------------------------------------------------------- |
| GET    | /                                                       | Name and version only                                           |
| GET    | /api/health, /api/health/live                           | No Arcjet check, no auth                                        |
| POST   | /api/webhooks/clerk                                     | Svix signature required, 503 if no secret                       |
| GET    | /api/games, /api/games/:slug, /api/games/:slug/packages | Published games and available packages only; no internal fields |

## Signed-in customer

| Method     | Path                                         | Notes                                             |
| ---------- | -------------------------------------------- | ------------------------------------------------- |
| GET, PATCH | /api/users/me                                | PATCH limited to name and phone, strict schema    |
| POST       | /api/games/:slug/lookup-player               | Hourly per-user limit, daily provider quota       |
| GET, POST  | /api/orders                                  | Own orders only; create needs Idempotency-Key     |
| GET        | /api/orders/:reference                       | Other people's orders return 404                  |
| POST       | /api/orders/:reference/proof-signal, /cancel | Own orders; state machine enforces allowed states |
| POST       | /api/orders/:reference/refund-request        | Own orders; only confirmed, failed or completed   |
| GET        | /api/payment/config                          | QR, recipient and WhatsApp number                 |

## Admin (operator or owner)

| Method    | Path                                                                                                     | Notes                                                 |
| --------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| GET       | /api/admin/games, /api/admin/games/:id, /api/admin/games/:id/packages                                    | Operators never receive cost                          |
| PATCH     | /api/admin/games/:id/availability, /api/admin/packages/:id/availability                                  | Audited                                               |
| GET       | /api/admin/orders, /summary, /:id                                                                        | Cost only in the owner response                       |
| POST      | /api/admin/orders/:id/confirm-payment, reject-payment, hold, release-hold, complete, fail, retry, cancel | State machine rules; claim-only actions for operators |
| GET, POST | /api/admin/refunds, /summary                                                                             | Operators can create requests, not decide             |
| GET       | /api/admin/dashboard                                                                                     | Profit fields only in the owner response              |

## Owner only

| Method                   | Path                                              | Notes                                               |
| ------------------------ | ------------------------------------------------- | --------------------------------------------------- |
| POST, PATCH              | /api/admin/games, /api/admin/games/:id            | Create and edit games                               |
| POST                     | /api/admin/games/:id/packages                     | Create packages                                     |
| PATCH                    | /api/admin/packages/:id                           | Price and cost changes, audited                     |
| POST                     | /api/admin/orders/:id/reassign, /reopen           |                                                     |
| POST                     | /api/admin/refunds/:id/approve, /deny, /mark-paid |                                                     |
| GET, POST, PATCH, DELETE | /api/admin/team/\*                                | Invites and roles                                   |
| GET, PATCH               | /api/admin/users, /api/admin/users/:id, /status   | Customers only; admins are changed on the Team page |
| GET, PUT                 | /api/admin/payment-config                         | Audited                                             |
| GET                      | /api/admin/audit-logs                             | Read only; no write routes exist                    |
| GET                      | /api/admin/dashboard/reconciliation.csv           |                                                     |
| POST                     | /api/admin/uploads/game-artwork, /payment-qr      | Size and content checks                             |

## Known limits

1. Lookup quota can be drained by many new accounts. Effect: lookups show "unavailable" and customers type the name. Orders are not blocked.
2. Express rate limits and the lookup cache live in memory. They reset on restart and are not shared. This is fine for one instance.
3. Arcjet limits by IP. Several mobile users can share one IP in Nepal, so the limits are generous.
4. The admin MFA check reads a Clerk claim that Clerk marks experimental. Confirm it in staging before relying on it.
5. The eSewa QR is a static personal QR. The admin check of amount and transaction ID against the statement is the real control.
6. API auth uses the Bearer header only; cookies are not sent cross-origin.
