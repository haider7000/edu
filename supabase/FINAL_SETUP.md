# EDU Platform — Final Supabase Setup

## 1. Database
For a new Supabase project, open SQL Editor and run:

`supabase/setup/FINAL_SUPABASE_SETUP.sql`

The setup creates the production schema, RLS, roles and required permissions. It does not insert demo students, teachers, courses, payments, meetings or content.

If an earlier V3/V4 setup partially ran, this V5 file is designed to repair the settings columns and re-apply the relevant policies safely. Run the full V5 file again.

## 2. Environment
Copy `.env.example` to `.env` and set the new project's URL and anon/publishable key. Never put the service-role key in the frontend `.env`.

## 3. Deploy secure user-creation function
Admin/Manager user creation uses a server-side Supabase Edge Function so the service-role secret never reaches the browser.

From the project folder after linking Supabase CLI:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy create-user
```

Supabase automatically provides `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` to hosted Edge Functions.

Admin can create Student, Teacher, Manager and Admin users. Manager can create Student and Teacher users only.

## 4. First Admin
Create the first user in Authentication, then assign the Admin role with the SQL already provided for your chosen email, or use a trusted database administrator workflow.

## 5. Final checks
Run `npm install`, `npm run build`, then test login and permissions with one Admin, Manager, Teacher and Student account. Test private meetings with two browser profiles/devices and allow camera/microphone access.
