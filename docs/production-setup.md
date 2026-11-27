# NEXORA production setup

## Required services
1. Create a Supabase project and configure its URL, anon key, and service-role key in the deployment environment.
2. Apply every SQL migration in `supabase/migrations` in filename order.
3. Configure a Replicate API token for the models enabled in the catalog.
4. Set `NEXT_PUBLIC_APP_URL` to the final HTTPS domain.
5. Configure optional OpenAI-compatible assistant/image endpoints only when the corresponding GPU services are deployed and tested.

## Admin bootstrap
After the first account has signed in and its profile row exists, promote the intended operator explicitly in Supabase SQL:

```sql
update public.profiles
set role = 'admin', updated_at = now()
where id = 'THE_AUTH_USER_UUID';
```

Do not expose the service-role key in browser code. Admin adjustments are recorded in the credit ledger with a reason and an idempotency key.

## Credits
The current generation application reserves credits transactionally and refunds failed provider jobs. The repository currently documents operator-granted credits; do not advertise card checkout until a verified payment checkout and webhook flow are implemented and tested end to end.

## Deployment
The Render Blueprint targets the `main` branch and uses the Pro web-service plan. Add the required secret values in Render before syncing the Blueprint. The health check uses `/api/config`, which reports public readiness flags without exposing credentials. Replicate and GPU inference usage may incur separate usage charges.

## Verification
GitHub Actions runs install, TypeScript type-check, lint, and production build. A passing CI build does not replace live tests for Supabase auth, storage, Replicate model compatibility, fashion GPU jobs, and credit accounting.
