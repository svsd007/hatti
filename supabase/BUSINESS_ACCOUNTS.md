# Business accounts — approval required

The reviewed database has RLS enabled on `Businesses` and `products`, public SELECT policies, no owner write policies, no ownership helper functions, and no storage policies. The ten businesses with NULL account IDs remain public demos.

Review `business_accounts.proposed.sql` before running it as project administrator. It supersedes the older `migrations/202610150001_business_listings.sql`; do not run both. The proposal contains only permissions, ownership helper functions, and RLS policies. It does not change table schemas, create indexes, or modify existing rows. It has NOT been applied.

The proposal grants public product details (including `further_description`), authenticated business registration, owner-only product create/update/delete, and image uploads to the authenticated user's UUID folder. It never grants business updates or deletes, so NULL-account demos cannot be claimed. Product IDs, creation timestamps and business IDs cannot be changed through client updates. Owner UUIDs are not exposed by the helper functions. Unknown marketplace write policies cause the transaction to abort for review.

Existing personal users visit `/business` to register. New owners use `/business/signup`, confirm their email when required, then register their business. `/business/login` uses the same Supabase Auth account; no separate passwords or role metadata grant ownership. The existing unique account_id constraint permits one business per account.

Configure Supabase Auth's site URL and allowed redirect URLs for `/auth/callback` on your deployed domain and development host. Keep email confirmation enabled as appropriate. No service-role key belongs in the browser.

After approval, verify with two disposable test accounts (not demo data): each can create a business and manage only its own products; foreign IDs and NULL-account demos reject writes; account_id and business_id changes reject; unauthenticated writes reject; public reads still work. Verify image uploads and a full create/edit/delete lifecycle. These live write tests have not been performed because they would change database data.

Product deletion requires confirmation and retains uploaded images. Replacement images also leave previous images intact, avoiding accidental deletion of shared assets. A failed save attempts to remove only the newly uploaded, unused image.
