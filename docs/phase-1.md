# Phase 1: authentication and database audit

## Status and live observations

Phase 1 application code is implemented. Database security migration is **not applied**.
No business rows, auth accounts, credentials, or dashboard settings were changed.
No real signup email was sent during testing. End-to-end account confirmation and
Google OAuth still need a user-controlled account/browser and dashboard configuration.

Read-only anonymous API checks against the configured project found:

| Check | Observed result |
| --- | --- |
| `Businesses` selecting `id,name,description`, zero rows | HTTP 200 |
| `Businesses` selecting `account_id`, zero rows | HTTP 401 (denied) |
| `Businesses` selecting `location`, zero rows | HTTP 400 (not usable; verify schema) |
| `products` selecting `id`, zero rows | HTTP 404 (not exposed/available) |
| Public API schema document | HTTP 401 |
| Email authentication / signup | Enabled |
| Email confirmation | Required |
| Google provider | Disabled |

These checks do **not** prove authenticated access restrictions, RLS definitions,
foreign keys, uniqueness constraints, or absence of alternate exposure through views
and RPCs. No SQL connection or management connector is available in this workspace.
Use `supabase/audit.sql` in the Supabase SQL Editor to inspect those details.

## Files and behavior

Created:

- `src/auth/AuthProvider.tsx`, `useAuth.ts`, `session.ts`: initial `getSession`, auth
  subscription, loading/errors, persisted-session integration, cleanup and stale-response protection.
- `src/auth/RequireAuth.tsx`, `authUtils.ts`: guarded account routes, safe return paths,
  understandable authentication errors.
- `src/components/AuthForm.tsx`; `src/Pages/Login.tsx`, `Signup.tsx`, `AuthCallback.tsx`:
  email/password login, registration, confirmation-email notice, Google sign-in,
  disabled submit controls, accessible labels, password confirmation, and callback handling.
- `src/lib/supabaseConfig.ts`: missing/malformed config and secret-key rejection.
- `tests/auth.test.mjs`, `tests/auth-render.test.mjs`: auth lifecycle, redirects,
  configuration, rendered form/profile/guard checks.
- `scripts/audit-supabase.mjs`, `supabase/audit.sql`, `supabase/verify_phase1.sql`,
  `supabase/migrations/202610140001_business_security.sql`, this report.

Modified:

- `src/App.tsx`: retains the router and cart provider, adds AuthProvider and
  `/login`, `/signup`, `/auth/callback`, and guards `/previous-orders`.
- `src/Pages/Profile.tsx`: real authenticated email/display name/join date/email
  confirmation status, local-session logout, and a guest login/signup invitation.
- `src/components/Navbar.tsx`: account/login navigation alongside the existing cart.
- `src/lib/supabase.ts`: validates public config, retains one client, explicitly
  enables persistence/refresh/callback detection, and checks Google availability
  before redirecting so a disabled provider produces an inline error.
- `src/App.css`: matching cream/sage auth forms and profile states.

The existing cart, public browse pages, Farmers query, and market prototype remain
functional. Order history is still explicitly prototype data until Phase 5. It is
now behind the auth guard; no real orders are claimed. Checkout stays unavailable.
No profiles table is needed: this phase uses the authenticated user's existing
email and metadata without duplicating private account data.

## Dashboard setup

1. Authentication → URL Configuration: set Site URL to the real deployment origin.
   Add redirect entries for the development origin and deployed origin, e.g.
   `http://127.0.0.1:5173/auth/callback**`,
   `http://localhost:5173/auth/callback**`, and
   `https://YOUR-DEPLOYMENT/auth/callback**`. The suffix allows the safe `next` query.
   Use only origins you control. Configure the web host to serve `index.html` for
   React Router paths, including `/auth/callback`.
2. Authentication → Providers → Email: keep email/password enabled; confirmation
   is already required. Configure SMTP for production delivery and check the email
   template preserves Supabase's confirmation URL. Dashboard password policies may
   require more than the UI's minimum of eight characters; API errors are displayed.
3. For Google, create a Google OAuth web client, use the **Supabase callback URL**
   displayed in the Google provider panel as Google's authorized redirect URI, and
   enable/configure the provider in Supabase. The client secret belongs only in
   that dashboard, never a Vite variable. Add your app origin to Google's allowed
   JavaScript origins where required. Until enabled, the app offers email login
   and explains Google is unavailable.
4. Keep the existing `.env.local` public values. Restart Vite after changing config.
   Never add a service-role key or database password as a `VITE_` variable.

References: [Google OAuth setup](https://supabase.com/docs/guides/auth/social-login/auth-google),
[auth lifecycle](https://supabase.com/docs/reference/javascript/auth-onauthstatechange),
[column permissions](https://supabase.com/docs/guides/database/postgres/column-level-security).

## Database review and migration

1. Run `supabase/audit.sql` as the administrator in SQL Editor. Check actual column
   types, defaults, account foreign key, one-business-per-account constraints, direct
   and inherited grants, policies, public views, and SECURITY DEFINER functions.
   `location` is deliberately not assumed or queried by the application.
2. Review `202610140001_business_security.sql` against the audit. It enables RLS,
   replaces legacy business policies with explicit public-read/owner-write policies,
   revokes broad table AND column permissions, grants only safe columns for public
   reads, and adds an owner-only `hatti_my_business()` RPC. The RPC accepts no account
   ID, checks `auth.uid()`, uses a fixed empty search path, and is callable only by
   authenticated users. Clients cannot change `account_id` with UPDATE.
3. The migration adds a unique account index without modifying rows; duplicate
   owners cause an exception and full rollback. Review any existing function of the
   same name before applying (creation fails rather than overwriting it). Existing
   views/RPCs that expose owner IDs must also be addressed based on the actual audit;
   this migration does not guess which other objects are safe to remove.
4. Apply the reviewed migration in SQL Editor or your normal Supabase migration
   workflow. It is transaction-wrapped. Run `supabase/verify_phase1.sql` afterward.
5. Repeat the public API checks:

   ```powershell
   node --env-file=.env.local scripts/audit-supabase.mjs
   ```

Owner management will use `getUser()` to verify the current identity before writes,
plus RLS to enforce authorization. It must not rely on client-supplied account IDs.
Direct owner reads cannot use `select('*')` or filter by `account_id` because that
column is intentionally denied to the authenticated role. Use the bounded owner RPC.

## Two-account security verification (after migration)

Use two disposable test accounts **A** and **B** in a development project. Run each
case in a separate SQL Editor transaction with `ROLLBACK`, substituting actual test
UUIDs. SQL Editor's default administrator role bypasses RLS; always assume the
intended role before testing. For authenticated cases, start with:

```sql
begin;
select set_config('request.jwt.claims', '{"sub":"USER_A_UUID","role":"authenticated"}', true);
set local role authenticated;
-- Place one test statement below, then ROLLBACK.
```

Use `set local role anon` and no user claims for anonymous cases. After an expected
SQL error, execute `ROLLBACK` before the next case. Do not commit test writes.

| Case | SQL statement | Expected |
| --- | --- | --- |
| Anonymous safe read | `select id,name,description from public."Businesses" limit 1;` | Allowed |
| Anonymous and authenticated private read | `select account_id from public."Businesses";` | Permission denied |
| Anonymous private RPC | `select * from public.hatti_my_business();` | Permission denied |
| Anonymous create | `insert into public."Businesses" (id,name,description,account_id) values (gen_random_uuid(),'Test','Test','USER_A_UUID');` | Permission denied |
| A creates own business (A must have no existing business) | Same insert with A claims | Allowed; rolled back |
| A impersonates B on creation | Same insert with B account ID while claims remain A | RLS rejection |
| A creates a second business | Insert twice for A in one transaction | Unique violation |
| A reads private business | `select * from public.hatti_my_business();` | Only A's business, never B's |
| A edits own business | `update public."Businesses" set description='Test' where id='BUSINESS_A_UUID' returning id;` | One row; rolled back |
| A edits B's business | Same update with B business ID | Zero rows |
| A deletes B's business | `delete from public."Businesses" where id='BUSINESS_B_UUID' returning id;` | Zero rows |
| A transfers ownership | `update public."Businesses" set account_id='USER_B_UUID' where id='BUSINESS_A_UUID';` | Column permission denied |

Verify public API calls again with A and B sessions as well as anonymously. RLS
does not replace privileges, and returning columns from an insert must be explicit.
Products/order isolation checks belong to their subsequent schema phases.

## Local and manual validation

Automated checks in this session: 11 tests passed (including existing cart tests
and rendered auth/profile/guard checks). TypeScript/production build, ESLint, and
`git diff --check` passed. Database migration SQL has not been executed or tested
against PostgreSQL here; the live public API probes above were executed.

Run `npm test`, `npm run lint`, and `npm run build` (use `npm.cmd` in PowerShell if
script execution policy blocks `npm.ps1`). Node 24 supports the built-in TypeScript
stripping used by tests; the render test uses the already-installed Vite/React tools.

Before marking Phase 1 live-verified:

1. Browse Home/Farmers/produce/deals/cart anonymously. Add items and refresh.
2. Visit `/previous-orders` signed out: expect login with `next=/previous-orders`.
   Switching login/signup must preserve that destination.
3. Register with an email you control, confirm the email, and return to the intended
   page. Test mismatched passwords, wrong password, unconfirmed email, and API errors.
4. Refresh while logged in: Profile must retain the real account. Log out: personal
   information disappears, order history requires login, and the guest cart remains.
5. Test Google while disabled (inline unavailable message) and after configuring it
   (OAuth completes and returns to the intended page). Cancel OAuth and test an
   expired confirmation link; no false success or redirect loop should appear.
6. Check desktop and phone widths. No browser connection was available for automated
   visual inspection in this session; render tests are not a substitute for this check.

## Gate before Phase 2

The live products endpoint is unavailable; the full schema/grants audit, Phase 1
migration, two-account security tests, and live auth confirmation remain outstanding.
Do not switch the working static product UI to a nonexistent table. Apply/verify the
Phase 1 security work and confirm the auth flow before proceeding to Phase 2's
products migration and frontend integration. No later phase is claimed complete.
