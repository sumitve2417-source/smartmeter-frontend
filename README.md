# SmartMeter Frontend

React 18 + Vite + Tailwind + Recharts. Talks to the Spring Boot backend over `/api` (proxied in dev).

## Run
```
npm install
npm run dev
```
Opens on http://localhost:5173 and proxies `/api/*` to `http://localhost:8080` (your backend).
To point at a different backend URL: `VITE_API_TARGET=http://your-backend:8080 npm run dev`.

For production: `npm run build` outputs static files in `dist/` - serve them with any static host/Nginx,
with `/api/*` reverse-proxied to the Spring Boot app.

## Structure
- `src/pages/Login.jsx` - single login form, redirects to `/tenant` or `/landlord` by role.
- `src/pages/tenant/` - **Dashboard** (live power gauge, day/month/year consumption chart, balance/tariff
  cards), **Wallet** (UPI QR + link, submit recharge with UTR, recharge status, transaction history),
  **Bill** (pick a past month, view the breakdown, download as PDF).
- `src/pages/landlord/` - **Dashboard** (rooms overview, revenue/consumption chart day/month/year),
  **Rooms** (add room/meter, onboard tenant, toggle relay, vacate), **Recharges** (approve/reject queue),
  **Settings** (tariff, minimum balance, UPI ID, QR upload).
- `src/components/` - `PowerGauge` (circular live-power gauge), `ConsumptionChart` (line for day view,
  bar for month/year), `RangeTabs`, `BottomNav`, `StatCard`.
- `src/api/client.js` - axios instance; attaches the JWT from localStorage, redirects to `/login` on 401.

## Notes
- The dashboards auto-refresh (tenant every 10s, landlord every 15s) by re-fetching the REST endpoints -
  simple polling, not a websocket. Good enough for a 3-second-interval meter; swap for a websocket/SSE
  push later if you want sub-second updates without polling.
- Chart data comes from the backend's `/api/tenant/consumption` and `/api/landlord/analytics`
  (`range=day|month|year`, optional `date=`), which read from the `DailyConsumption` rollup table for
  month/year and from raw `Reading` rows (bucketed into 24 hourly points) for day - so a whole year of
  charts stays fast even with millions of raw readings on the backend.

## Update: Security, Customer Care, and password reset
- Login is now by **email** (the tenant onboarding form and the login form both use email).
- New **Forgot password** flow: `/forgot-password` -> emails a reset link -> `/reset-password?email=&token=`
  (the link the backend emails already has these params filled in).
- New **Settings** tab for both roles:
  - Tenant: Security (update email/phone/password) + Customer Care (landlord's contact + app support contact).
  - Landlord: Payments (unchanged) + Security + Customer Care (the app's own support contact - set via
    `SUPPORT_NAME` / `SUPPORT_EMAIL` / `SUPPORT_PHONE` on the backend).
- **Pay Now fix**: the UPI deep link now always includes an amount (`am=`) and a note (`tn=`) - many UPI
  apps silently do nothing without an amount, which was the root cause. There's also a "Copy UPI ID"
  fallback and an explanatory note, since `upi://` links only do anything on a phone with a UPI app
  installed - on a desktop browser nothing will visibly happen, which is expected, not a bug.
