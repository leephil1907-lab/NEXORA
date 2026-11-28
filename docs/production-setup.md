# NEXORA production setup

## Required services

1. Create a Supabase project and configure its URL, anon key, and service-role key in the Render environment.
2. Apply every SQL migration in supabase/migrations in filename order.
3. Configure GEMINI_API_KEY for a Google AI project with paid-tier image/video generation access and billing enabled.
4. Set GEMINI_MODEL to the supported hosted text model used for creative chat.
5. Set NEXT_PUBLIC_APP_URL to the final HTTPS domain.
6. Configure OMEGA_API_KEY or VENICE_API_KEY only if you want optional hosted chat fallbacks. These do not power image or video generation.

## Admin bootstrap

After the first account has signed in and its profile row exists, promote the intended operator explicitly in Supabase SQL:

~~~sql
update public.profiles
set role = 'admin', updated_at = now()
where id = 'THE_AUTH_USER_UUID';
~~~

Do not expose the service-role key in browser code. Admin adjustments are recorded in the credit ledger with a reason and an idempotency key.

## Credits

The generation application reserves credits transactionally and refunds failed provider jobs. Credits are operator-granted. Do not advertise card checkout until a verified payment checkout and webhook flow are implemented and tested end to end.

## Deployment

The Render service deploys the main branch using the Pro web-service plan. Add the required secret values in Render before deployment. The health check endpoint is /api/config and reports readiness flags without exposing credentials.

## Age assurance

The studio requires an 18+ date-of-birth self-declaration. The server calculates the age and stores only the verification timestamp and method, not the date of birth. This is not independent identity verification; select and configure a specialist age-assurance provider before representing the flow as third-party verified.

## Verification

GitHub Actions runs install, TypeScript type-check, lint, and production build. A passing CI build does not replace live tests for Supabase authentication, private storage, Gemini generation, video download and credit accounting.
