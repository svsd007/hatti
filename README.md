# hatti
A marketplace for buying fresh food directly from local farmers

## Development

Use Node 24, run `npm install`, then `npm run dev`. Keep the project's public
`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env.local`.
Never put service-role keys or secrets in frontend environment variables.

Checks: `npm test`, `npm run lint`, and `npm run build`.

Authentication implementation, live audit findings, dashboard setup, unapplied
security migration, and verification steps: [Phase 1 report](docs/phase-1.md).
