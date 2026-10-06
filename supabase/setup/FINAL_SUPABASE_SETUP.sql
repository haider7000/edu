-- EDU Platform FINAL DATABASE SETUP
-- Generated in migration order. Run once on a NEW/EMPTY Supabase project.
-- No demo/client data is inserted. Required RBAC roles only.

-- ==================================================================
-- SOURCE: supabase/migrations/20260814000000_core_auth_rbac.sql
-- ==================================================================
-- EDU Platform core identity + RBAC foundation.
-- MUST run before every other migration on a fresh Supabase project.
-- Safe to re-run: objects are created/seeded idempotently.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists roles_name_lower_unique
  on public.roles (lower(trim(name)));

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create index if not exists idx_user_roles_user_id on public.user_roles(user_id);
create index if not exists idx_user_roles_role_id on public.user_roles(role_id);

insert into public.roles (name) values
  ('Student'), ('Teacher'), ('Manager'), ('Admin')
on conflict do nothing;

-- Security-definer helper prevents RLS recursion when policies need role checks.
create or replace function public.has_role(role_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and lower(trim(r.name)) = lower(trim(role_name))
  );
$$;

revoke all on function public.has_role(text) from public;
grant execute on function public.has_role(text) to authenticated;

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;

drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile" on public.profiles
for select to authenticated using (id = auth.uid());

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles
for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Every authenticated user needs role names to resolve their own dashboard.
drop policy if exists "authenticated read roles" on public.roles;
create policy "authenticated read roles" on public.roles
for select to authenticated using (true);

drop policy if exists "users read own roles" on public.user_roles;
create policy "users read own roles" on public.user_roles
for select to authenticated using (user_id = auth.uid());

-- Keep profile updated_at reliable.
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();


-- ==================================================================
-- SOURCE: supabase/migrations/20260814230000_student_platform_backend.sql
-- ==================================================================
-- EDU Platform: Student learning, assessment, scheduling, payments,
-- certificates and referrals backend foundation.
-- Run this migration in Supabase SQL Editor or via Supabase CLI.
-- No demo/fake rows are inserted.

create extension if not exists pgcrypto;

-- ---------- Helpers ----------
create or replace function public.has_role(role_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and lower(r.name) = lower(role_name)
  );
$$;

grant execute on function public.has_role(text) to authenticated;

-- ---------- Courses ----------
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  description text,
  thumbnail text,
  instructor_id uuid references public.profiles(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  price numeric(12,2) not null default 0 check (price >= 0),
  duration_hours numeric(8,2) check (duration_hours is null or duration_hours >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('pending','active','completed','cancelled')),
  progress numeric(5,2) not null default 0 check (progress between 0 and 100),
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(course_id, student_id)
);

create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules(id) on delete cascade,
  title text not null,
  description text,
  content text,
  video_url text,
  duration_minutes integer check (duration_minutes is null or duration_minutes >= 0),
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(lesson_id, student_id)
);

-- ---------- Assignments ----------
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  instructions text,
  due_at timestamptz,
  max_marks numeric(8,2) not null default 100 check (max_marks >= 0),
  status text not null default 'published' check (status in ('draft','published','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  submission_text text,
  file_path text,
  submitted_at timestamptz not null default now(),
  status text not null default 'submitted' check (status in ('draft','submitted','graded','returned','late')),
  marks numeric(8,2),
  feedback text,
  graded_at timestamptz,
  unique(assignment_id, student_id)
);

create table if not exists public.study_materials (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  type text not null check (type in ('PDF','Slides','Notes','Resources','Assignments')),
  description text,
  file_path text,
  file_size bigint,
  created_at timestamptz not null default now()
);

-- ---------- Classes / attendance ----------
create table if not exists public.class_schedules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  meeting_url text,
  recording_url text,
  status text not null default 'scheduled' check (status in ('scheduled','live','completed','cancelled')),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.class_schedules(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('present','absent','late','excused')),
  marked_at timestamptz not null default now(),
  unique(class_id, student_id)
);

create table if not exists public.grades (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  assignment_id uuid references public.assignments(id) on delete set null,
  title text not null,
  marks numeric(8,2),
  max_marks numeric(8,2),
  feedback text,
  graded_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- Notifications / messaging ----------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'general',
  action_url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  subject text,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- Payments / orders ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'PKR',
  status text not null default 'pending' check (status in ('pending','paid','failed','refunded','cancelled')),
  provider text,
  provider_reference text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'PKR',
  status text not null default 'pending' check (status in ('pending','paid','failed','refunded')),
  provider text,
  provider_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

-- ---------- Certificates ----------
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  certificate_number text not null unique,
  issued_at timestamptz not null default now(),
  file_path text,
  verification_code text not null unique,
  unique(student_id, course_id)
);

-- ---------- Referrals ----------
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  referred_user_id uuid references public.profiles(id) on delete set null,
  referral_code text not null unique,
  status text not null default 'pending' check (status in ('pending','qualified','rewarded','cancelled')),
  reward_amount numeric(12,2) not null default 0 check (reward_amount >= 0),
  created_at timestamptz not null default now(),
  qualified_at timestamptz,
  rewarded_at timestamptz
);

-- ---------- Indexes ----------
create index if not exists idx_enrollments_student on public.enrollments(student_id);
create index if not exists idx_enrollments_course on public.enrollments(course_id);
create index if not exists idx_assignments_course on public.assignments(course_id);
create index if not exists idx_submissions_student on public.assignment_submissions(student_id);
create index if not exists idx_class_schedules_course on public.class_schedules(course_id);
create index if not exists idx_attendance_student on public.attendance(student_id);
create index if not exists idx_grades_student on public.grades(student_id);
create index if not exists idx_notifications_user on public.notifications(user_id, created_at desc);
create index if not exists idx_messages_recipient on public.messages(recipient_id, created_at desc);
create index if not exists idx_orders_student on public.orders(student_id, created_at desc);
create index if not exists idx_payments_student on public.payments(student_id, created_at desc);
create index if not exists idx_certificates_student on public.certificates(student_id);
create index if not exists idx_referrals_referrer on public.referrals(referrer_id);

-- ---------- RLS ----------

do $$
declare t text;
begin
  foreach t in array array[
    'courses','enrollments','course_modules','lessons','lesson_progress',
    'assignments','assignment_submissions','study_materials','class_schedules',
    'attendance','grades','notifications','messages','orders','payments',
    'certificates','referrals'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Publicly visible published course catalog; management policies are role based.
drop policy if exists "published courses are public" on public.courses;
create policy "published courses are public" on public.courses
for select using (status = 'published' or auth.uid() is not null and (instructor_id = auth.uid() or public.has_role('Manager') or public.has_role('Admin')));

drop policy if exists "students read own enrollments" on public.enrollments;
create policy "students read own enrollments" on public.enrollments for select using (student_id = auth.uid() or public.has_role('Manager') or public.has_role('Admin'));

drop policy if exists "students read enrolled modules" on public.course_modules;
create policy "students read enrolled modules" on public.course_modules for select using (
  exists (select 1 from public.enrollments e where e.course_id = course_modules.course_id and e.student_id = auth.uid() and e.status in ('active','completed'))
  or public.has_role('Teacher') or public.has_role('Manager') or public.has_role('Admin')
);

drop policy if exists "students read lessons in enrolled courses" on public.lessons;
create policy "students read lessons in enrolled courses" on public.lessons for select using (
  exists (
    select 1 from public.course_modules m
    join public.enrollments e on e.course_id = m.course_id
    where m.id = lessons.module_id and e.student_id = auth.uid() and e.status in ('active','completed')
  ) or public.has_role('Teacher') or public.has_role('Manager') or public.has_role('Admin')
);

drop policy if exists "students manage own lesson progress" on public.lesson_progress;
create policy "students manage own lesson progress" on public.lesson_progress for all using (student_id = auth.uid()) with check (student_id = auth.uid());

drop policy if exists "students read assignments for enrolled courses" on public.assignments;
create policy "students read assignments for enrolled courses" on public.assignments for select using (
  exists (select 1 from public.enrollments e where e.course_id = assignments.course_id and e.student_id = auth.uid() and e.status in ('active','completed'))
  or teacher_id = auth.uid() or public.has_role('Manager') or public.has_role('Admin')
);

drop policy if exists "students manage own submissions" on public.assignment_submissions;
create policy "students manage own submissions" on public.assignment_submissions for all using (student_id = auth.uid()) with check (student_id = auth.uid());

drop policy if exists "teachers review submissions" on public.assignment_submissions;
create policy "teachers review submissions" on public.assignment_submissions for select using (
  exists (select 1 from public.assignments a where a.id = assignment_submissions.assignment_id and a.teacher_id = auth.uid())
  or public.has_role('Manager') or public.has_role('Admin')
);

drop policy if exists "students read course materials" on public.study_materials;
create policy "students read course materials" on public.study_materials for select using (
  exists (select 1 from public.enrollments e where e.course_id = study_materials.course_id and e.student_id = auth.uid() and e.status in ('active','completed'))
  or public.has_role('Teacher') or public.has_role('Manager') or public.has_role('Admin')
);

drop policy if exists "students read class schedules" on public.class_schedules;
create policy "students read class schedules" on public.class_schedules for select using (
  exists (select 1 from public.enrollments e where e.course_id = class_schedules.course_id and e.student_id = auth.uid() and e.status in ('active','completed'))
  or teacher_id = auth.uid() or public.has_role('Manager') or public.has_role('Admin')
);

drop policy if exists "students read own attendance" on public.attendance;
create policy "students read own attendance" on public.attendance for select using (student_id = auth.uid() or public.has_role('Teacher') or public.has_role('Manager') or public.has_role('Admin'));

drop policy if exists "students read own grades" on public.grades;
create policy "students read own grades" on public.grades for select using (student_id = auth.uid() or public.has_role('Teacher') or public.has_role('Manager') or public.has_role('Admin'));

drop policy if exists "users read own notifications" on public.notifications;
create policy "users read own notifications" on public.notifications for select using (user_id = auth.uid());
drop policy if exists "users update own notifications" on public.notifications;
create policy "users update own notifications" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "users read their messages" on public.messages;
create policy "users read their messages" on public.messages for select using (sender_id = auth.uid() or recipient_id = auth.uid());
drop policy if exists "users send messages" on public.messages;
create policy "users send messages" on public.messages for insert with check (sender_id = auth.uid());
drop policy if exists "users update received messages" on public.messages;
create policy "users update received messages" on public.messages for update using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());

drop policy if exists "students read own orders" on public.orders;
create policy "students read own orders" on public.orders for select using (student_id = auth.uid() or public.has_role('Manager') or public.has_role('Admin'));
drop policy if exists "students read own payments" on public.payments;
create policy "students read own payments" on public.payments for select using (student_id = auth.uid() or public.has_role('Manager') or public.has_role('Admin'));

drop policy if exists "students read own certificates" on public.certificates;
create policy "students read own certificates" on public.certificates for select using (student_id = auth.uid() or public.has_role('Manager') or public.has_role('Admin'));

drop policy if exists "users read own referrals" on public.referrals;
create policy "users read own referrals" on public.referrals for select using (referrer_id = auth.uid() or referred_user_id = auth.uid() or public.has_role('Manager') or public.has_role('Admin'));

-- Management policies for content creation/update. Students never receive these rights.

drop policy if exists "teachers manage their courses" on public.courses;
create policy "teachers manage their courses" on public.courses for all using (
  instructor_id = auth.uid() or public.has_role('Manager') or public.has_role('Admin')
) with check (instructor_id = auth.uid() or public.has_role('Manager') or public.has_role('Admin'));

drop policy if exists "teachers manage assignments" on public.assignments;
create policy "teachers manage assignments" on public.assignments for all using (
  teacher_id = auth.uid() or public.has_role('Manager') or public.has_role('Admin')
) with check (teacher_id = auth.uid() or public.has_role('Manager') or public.has_role('Admin'));

-- Enrollment creation is intentionally restricted to managers/admins. Payment confirmation
-- should be performed by a trusted server/webhook, never by a browser using the anon key.
drop policy if exists "management manage enrollments" on public.enrollments;
create policy "management manage enrollments" on public.enrollments for all using (public.has_role('Manager') or public.has_role('Admin')) with check (public.has_role('Manager') or public.has_role('Admin'));

-- Updated-at trigger.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at before update on public.courses for each row execute function public.set_updated_at();
drop trigger if exists assignments_set_updated_at on public.assignments;
create trigger assignments_set_updated_at before update on public.assignments for each row execute function public.set_updated_at();


-- ==================================================================
-- SOURCE: supabase/migrations/20260815000000_phase4_teacher_portal.sql
-- ==================================================================
-- PHASE 4 — Teacher Portal additive backend requirements
-- Safe migration: creates only missing Phase 4 tables/policies.
-- It does NOT drop tables, users, roles, or existing policies.
-- Review in Supabase SQL Editor before applying.

-- 1) Teachers must be able to read enrollments belonging to their own courses.
create policy "teachers read own course enrollments"
on public.enrollments for select
using (
  exists (
    select 1 from public.courses c
    where c.id = enrollments.course_id and c.instructor_id = auth.uid()
  )
  or public.has_role('Manager') or public.has_role('Admin')
);

-- 2) Teachers need to see profiles of students enrolled in their courses.
create policy "teachers read own course student profiles"
on public.profiles for select
using (
  id = auth.uid()
  or exists (
    select 1
    from public.enrollments e
    join public.courses c on c.id = e.course_id
    where e.student_id = profiles.id
      and c.instructor_id = auth.uid()
  )
  or public.has_role('Manager') or public.has_role('Admin')
);

-- 3) Assignment review write access.
create policy "teachers update own assignment submissions"
on public.assignment_submissions for update
using (
  exists (
    select 1 from public.assignments a
    where a.id = assignment_submissions.assignment_id
      and a.teacher_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.assignments a
    where a.id = assignment_submissions.assignment_id
      and a.teacher_id = auth.uid()
  )
);

-- 4) Teacher grade management.
create policy "teachers insert own course grades"
on public.grades for insert
with check (
  exists (
    select 1 from public.courses c
    where c.id = grades.course_id and c.instructor_id = auth.uid()
  )
);

create policy "teachers update own course grades"
on public.grades for update
using (
  exists (
    select 1 from public.courses c
    where c.id = grades.course_id and c.instructor_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.courses c
    where c.id = grades.course_id and c.instructor_id = auth.uid()
  )
);

-- 5) Teacher attendance management.
create policy "teachers insert own class attendance"
on public.attendance for insert
with check (
  exists (
    select 1 from public.class_schedules cs
    where cs.id = attendance.class_id and cs.teacher_id = auth.uid()
  )
);

create policy "teachers update own class attendance"
on public.attendance for update
using (
  exists (
    select 1 from public.class_schedules cs
    where cs.id = attendance.class_id and cs.teacher_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.class_schedules cs
    where cs.id = attendance.class_id and cs.teacher_id = auth.uid()
  )
);

-- 6) Teacher-managed study materials.
create policy "teachers manage own course materials"
on public.study_materials for all
using (
  exists (
    select 1 from public.courses c
    where c.id = study_materials.course_id and c.instructor_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.courses c
    where c.id = study_materials.course_id and c.instructor_id = auth.uid()
  )
);

-- 7) Announcements (not present in the supplied student migration).
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  message text not null,
  audience text not null default 'course',
  status text not null default 'published' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.announcements enable row level security;

create policy "teachers manage own announcements"
on public.announcements for all
using (author_id = auth.uid() or public.has_role('Manager') or public.has_role('Admin'))
with check (author_id = auth.uid() or public.has_role('Manager') or public.has_role('Admin'));

create policy "students read published course announcements"
on public.announcements for select
using (
  status = 'published'
  and (
    exists (
      select 1 from public.enrollments e
      where e.student_id = auth.uid()
        and e.course_id = announcements.course_id
        and e.status in ('active','completed')
    )
    or author_id = auth.uid()
    or public.has_role('Manager') or public.has_role('Admin')
  )
);

-- 8) Daily teacher reports.
create table if not exists public.teacher_daily_reports (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  report_date date not null,
  classes_conducted integer not null default 0 check (classes_conducted >= 0),
  topics_covered text,
  students_attended integer not null default 0 check (students_attended >= 0),
  assignments_checked integer not null default 0 check (assignments_checked >= 0),
  issues text,
  additional_notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_teacher_daily_reports_teacher_date
on public.teacher_daily_reports(teacher_id, report_date desc);
alter table public.teacher_daily_reports enable row level security;

create policy "teachers manage own daily reports"
on public.teacher_daily_reports for all
using (teacher_id = auth.uid() or public.has_role('Manager') or public.has_role('Admin'))
with check (teacher_id = auth.uid() or public.has_role('Manager') or public.has_role('Admin'));

-- 9) Internship opportunities. This is intentionally read-only for teachers.
create table if not exists public.internships (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  position text not null,
  skills text,
  duration text,
  deadline date,
  description text,
  apply_url text,
  status text not null default 'open' check (status in ('open','closed','draft')),
  created_at timestamptz not null default now()
);
alter table public.internships enable row level security;

create policy "authenticated users read open internships"
on public.internships for select
using (status = 'open' or public.has_role('Manager') or public.has_role('Admin'));

-- Optional Storage setup for teacher-uploaded files.
-- Only run this section if you want real uploads from the browser:
-- insert into storage.buckets (id,name,public)
-- values ('teacher-materials','teacher-materials',false)
-- on conflict (id) do nothing;
--
-- Then add Storage RLS policies that restrict object ownership/paths
-- to authenticated teachers. Do not make the bucket public merely
-- to simplify uploads.


-- ==================================================================
-- SOURCE: supabase/migrations/20260822000000_phase5_manager_portal.sql
-- ==================================================================
-- PHASE 5 — Manager Portal additive security policies.
-- Safe: does not drop tables, users, roles, RLS, or existing policies.
-- Apply only after reviewing the existing Supabase policies.

-- Managers may manage class schedules. The application still performs conflict checks.
drop policy if exists "managers manage class schedules" on public.class_schedules;
create policy "managers manage class schedules"
on public.class_schedules for all
using (public.has_role('Manager') or public.has_role('Admin'))
with check (public.has_role('Manager') or public.has_role('Admin'));

-- Managers may create certificates only for completed enrollments at 100% progress.
drop policy if exists "managers issue completed course certificates" on public.certificates;
create policy "managers issue completed course certificates"
on public.certificates for insert
with check (
  (public.has_role('Manager') or public.has_role('Admin'))
  and exists (
    select 1 from public.enrollments e
    where e.student_id = certificates.student_id
      and e.course_id = certificates.course_id
      and e.status = 'completed'
      and e.progress >= 100
  )
);

-- Managers may manage internship records. Existing authenticated read policy remains intact.
drop policy if exists "managers manage internships" on public.internships;
create policy "managers manage internships"
on public.internships for all
using (public.has_role('Manager') or public.has_role('Admin'))
with check (public.has_role('Manager') or public.has_role('Admin'));

-- Allow a user to edit only their own profile fields through the frontend.
-- This does not expose role, user ID, or authentication credentials.
drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

-- Optional index to keep Manager analytics responsive as attendance grows.
create index if not exists idx_class_schedules_teacher_time
on public.class_schedules(teacher_id, starts_at, ends_at);


-- ==================================================================
-- SOURCE: supabase/migrations/20260822100000_admissions_backend.sql
-- ==================================================================
-- EDU Platform — Admissions backend
-- Public applications are created through a restricted RPC.
-- Managers/Admins can review and update application status through RLS.

create table if not exists public.admissions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  city text,
  education text,
  institution text,
  experience text,
  course_id uuid references public.courses(id) on delete set null,
  course_name text not null,
  learning_goal text,
  message text,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected','interview','enrolled')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_admissions_status_created
  on public.admissions(status, created_at desc);
create index if not exists idx_admissions_email
  on public.admissions(lower(email));
create index if not exists idx_admissions_profile
  on public.admissions(profile_id);

create or replace function public.set_admissions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_admissions_updated_at on public.admissions;
create trigger trg_admissions_updated_at
before update on public.admissions
for each row execute function public.set_admissions_updated_at();

alter table public.admissions enable row level security;

drop policy if exists "managers and admins read admissions" on public.admissions;
create policy "managers and admins read admissions"
on public.admissions for select
to authenticated
using (public.has_role('Manager') or public.has_role('Admin'));

drop policy if exists "managers and admins update admissions" on public.admissions;
create policy "managers and admins update admissions"
on public.admissions for update
to authenticated
using (public.has_role('Manager') or public.has_role('Admin'))
with check (public.has_role('Manager') or public.has_role('Admin'));

-- Do not expose direct INSERT on admissions to anon/authenticated clients.
-- The RPC only accepts the fields required by the public form and derives
-- profile_id from auth.uid(), so a public caller cannot assign another user.
create or replace function public.create_admission_application(
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text default null,
  p_city text default null,
  p_education text default null,
  p_institution text default null,
  p_experience text default null,
  p_course_name text default null,
  p_learning_goal text default null,
  p_message text default null
)
returns public.admissions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admission public.admissions;
  v_email text := lower(trim(p_email));
begin
  if coalesce(trim(p_first_name), '') = '' then
    raise exception 'First name is required';
  end if;
  if coalesce(trim(p_last_name), '') = '' then
    raise exception 'Last name is required';
  end if;
  if v_email = '' or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'A valid email address is required';
  end if;
  if coalesce(trim(p_course_name), '') = '' then
    raise exception 'Course selection is required';
  end if;

  insert into public.admissions (
    profile_id,
    first_name,
    last_name,
    email,
    phone,
    city,
    education,
    institution,
    experience,
    course_name,
    learning_goal,
    message
  ) values (
    (select p.id from public.profiles p where p.id = auth.uid()),
    trim(p_first_name),
    trim(p_last_name),
    v_email,
    nullif(trim(p_phone), ''),
    nullif(trim(p_city), ''),
    nullif(trim(p_education), ''),
    nullif(trim(p_institution), ''),
    nullif(trim(p_experience), ''),
    trim(p_course_name),
    nullif(trim(p_learning_goal), ''),
    nullif(trim(p_message), '')
  )
  returning * into v_admission;

  return v_admission;
end;
$$;

grant execute on function public.create_admission_application(
  text,text,text,text,text,text,text,text,text,text,text
) to anon, authenticated;

-- Prevent clients from bypassing the RPC with direct INSERT.
revoke insert on public.admissions from anon, authenticated;
revoke delete on public.admissions from anon, authenticated;


-- ==================================================================
-- SOURCE: supabase/migrations/20260823000000_phase6_admin_portal.sql
-- ==================================================================
-- EDU Platform — Phase 6 Admin Portal database contract
-- REVIEW AND APPLY IN SUPABASE SQL EDITOR.
-- Additive only: no tables are dropped, RLS is not disabled, and no existing
-- policies are removed. All policies are restricted to the authenticated Admin role.

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','roles','user_roles','courses','course_modules','lessons',
    'assignments','enrollments','class_schedules','attendance','certificates',
    'internships','orders','payments','study_materials','assignment_submissions',
    'grades','announcements','teacher_daily_reports','admissions'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Admin profile/user visibility.
drop policy if exists "admins read all profiles" on public.profiles;
create policy "admins read all profiles" on public.profiles
for select to authenticated
using (public.has_role('Admin'));

-- Admin can update profile fields only; auth identity and role are not stored here.
drop policy if exists "admins update profiles" on public.profiles;
create policy "admins update profiles" on public.profiles
for update to authenticated
using (public.has_role('Admin'))
with check (public.has_role('Admin'));

-- RBAC management. Keep the roles themselves system-controlled; Admins can
-- read them and assign an existing role to a user.
drop policy if exists "admins read roles" on public.roles;
create policy "admins read roles" on public.roles
for select to authenticated
using (public.has_role('Admin'));

drop policy if exists "admins read user roles" on public.user_roles;
create policy "admins read user roles" on public.user_roles
for select to authenticated
using (public.has_role('Admin'));

drop policy if exists "admins manage user roles" on public.user_roles;
create policy "admins manage user roles" on public.user_roles
for all to authenticated
using (public.has_role('Admin'))
with check (public.has_role('Admin'));

-- Academic/content administration.
do $$
declare t text;
begin
  foreach t in array array[
    'courses','course_modules','lessons','assignments','class_schedules',
    'study_materials','announcements','teacher_daily_reports','internships'
  ] loop
    execute format('drop policy if exists "admins manage %I" on public.%I', t, t);
    execute format(
      'create policy "admins manage %I" on public.%I for all to authenticated using (public.has_role(''Admin'')) with check (public.has_role(''Admin''))',
      t, t
    );
  end loop;
end $$;

-- Operational/financial records. Admin access is intentionally explicit.
do $$
declare t text;
begin
  foreach t in array array[
    'enrollments','attendance','certificates','orders','payments',
    'assignment_submissions','grades','admissions'
  ] loop
    execute format('drop policy if exists "admins manage %I" on public.%I', t, t);
    execute format(
      'create policy "admins manage %I" on public.%I for all to authenticated using (public.has_role(''Admin'')) with check (public.has_role(''Admin''))',
      t, t
    );
  end loop;
end $$;

-- Certificate issuance remains completion-aware at the database layer.
-- The existing Manager/Admin insert policy in Phase 5 should remain in place;
-- do not replace it with a broad insert policy if completion enforcement is
-- required for your deployment. If your existing policy already enforces
-- completion, leave it unchanged.

-- NOTE:
-- 1. auth.users last_sign_in_at is not exposed by the browser client through
--    the profiles schema, so the Admin UI does not fabricate "last login".
-- 2. Audit logs, products, invoices, quizzes/exams, blog, media, website
--    settings, AI settings, and system settings require their own backend
--    contracts before they can be made writable.


-- ==================================================================
-- SOURCE: supabase/migrations/20260823230000_permissions_system.sql
-- ==================================================================
-- Phase 6: normalized fine-grained permissions.
-- Additive migration: keeps existing roles/user_roles and existing data.

create table if not exists public.permissions (
  id bigint generated by default as identity primary key,
  name text not null unique,
  description text,
  category text not null default 'general',
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  id bigint generated by default as identity primary key,
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id bigint not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint role_permissions_role_permission_unique unique (role_id, permission_id)
);

create index if not exists idx_permissions_category on public.permissions(category);
create index if not exists idx_role_permissions_role_id on public.role_permissions(role_id);
create index if not exists idx_role_permissions_permission_id on public.role_permissions(permission_id);

insert into public.permissions (name, description, category) values
('users.view','View platform users','users'),('users.create','Create new users','users'),('users.update','Update user information','users'),('users.delete','Delete or deactivate users','users'),
('roles.view','View available roles','roles'),('roles.manage','Manage roles','roles'),
('permissions.view','View role permissions','permissions'),('permissions.manage','Assign and remove permissions from roles','permissions'),
('courses.view','View courses','courses'),('courses.create','Create courses','courses'),('courses.update','Update courses','courses'),('courses.delete','Delete or archive courses','courses'),
('students.view','View students','students'),('students.create','Create students','students'),('students.update','Update student information','students'),('students.delete','Delete or deactivate students','students'),
('teachers.view','View teachers','teachers'),('teachers.create','Create teachers','teachers'),('teachers.update','Update teacher information','teachers'),('teachers.delete','Delete or deactivate teachers','teachers'),('teachers.manage','Manage teacher assignments and settings','teachers'),
('managers.view','View managers','managers'),('managers.create','Create managers','managers'),('managers.update','Update managers','managers'),('managers.delete','Delete or deactivate managers','managers'),
('admissions.view','View admissions','admissions'),('admissions.create','Create admissions','admissions'),('admissions.update','Update admissions','admissions'),('admissions.delete','Delete admissions','admissions'),('admissions.manage','Manage admissions','admissions'),
('enrollments.view','View enrollments','enrollments'),('enrollments.create','Create enrollments','enrollments'),('enrollments.update','Update enrollments','enrollments'),('enrollments.delete','Delete enrollments','enrollments'),
('assignments.view','View assignments','assignments'),('assignments.create','Create assignments','assignments'),('assignments.update','Update assignments','assignments'),('assignments.delete','Delete assignments','assignments'),('assignments.grade','Grade assignments','assignments'),
('classes.view','View live classes','classes'),('classes.create','Create live classes','classes'),('classes.update','Update live classes','classes'),('classes.delete','Delete live classes','classes'),
('schedules.view','View schedules','schedules'),('schedules.create','Create schedules','schedules'),('schedules.update','Update schedules','schedules'),('schedules.delete','Delete schedules','schedules'),
('progress.view','View progress','progress'),('progress.update','Update progress','progress'),
('certificates.view','View certificates','certificates'),('certificates.issue','Issue certificates','certificates'),('certificates.revoke','Revoke certificates','certificates'),
('internships.view','View internships','internships'),('internships.create','Create internships','internships'),('internships.update','Update internships','internships'),('internships.delete','Delete internships','internships'),('internships.manage','Manage internships','internships'),
('reports.view','View reports','reports'),('reports.export','Export reports','reports'),
('settings.view','View settings','settings'),('settings.manage','Manage settings','settings'),('audit.view','View audit information','audit')
on conflict (name) do update set description=excluded.description, category=excluded.category;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select exists (select 1 from public.user_roles ur join public.roles r on r.id=ur.role_id where ur.user_id=auth.uid() and lower(trim(r.name))='admin'); $$;

create or replace function public.has_permission(requested_permission text)
returns boolean language sql stable security definer set search_path=public
as $$ select public.is_admin() or exists (select 1 from public.user_roles ur join public.role_permissions rp on rp.role_id=ur.role_id join public.permissions p on p.id=rp.permission_id where ur.user_id=auth.uid() and p.name=requested_permission); $$;

revoke all on function public.is_admin() from public;
revoke all on function public.has_permission(text) from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.has_permission(text) to authenticated;

alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;

drop policy if exists "Authenticated users can view permissions" on public.permissions;
create policy "Authenticated users can view permissions" on public.permissions for select to authenticated using (true);
drop policy if exists "Admins can manage permissions" on public.permissions;
create policy "Admins can manage permissions" on public.permissions for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Authenticated users can view role permissions" on public.role_permissions;
create policy "Authenticated users can view role permissions" on public.role_permissions for select to authenticated using (true);
drop policy if exists "Admins can manage role permissions" on public.role_permissions;
create policy "Admins can manage role permissions" on public.role_permissions for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select, insert, update, delete on public.permissions to authenticated;
grant select, insert, update, delete on public.role_permissions to authenticated;
grant usage, select on sequence public.permissions_id_seq to authenticated;
grant usage, select on sequence public.role_permissions_id_seq to authenticated;

-- Default assignments. Admin gets all permissions; other roles get least-privilege defaults.
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p where lower(trim(r.name))='admin'
on conflict (role_id,permission_id) do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.name in (
'courses.view','courses.create','courses.update','courses.delete','students.view','students.create','students.update','teachers.view','teachers.update','teachers.manage',
'admissions.view','admissions.create','admissions.update','admissions.manage','enrollments.view','enrollments.create','enrollments.update','assignments.view','assignments.create','assignments.update',
'classes.view','classes.create','classes.update','classes.delete','schedules.view','schedules.create','schedules.update','schedules.delete','progress.view','progress.update',
'certificates.view','certificates.issue','internships.view','internships.create','internships.update','internships.delete','internships.manage','reports.view','reports.export')
where lower(trim(r.name))='manager' on conflict (role_id,permission_id) do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.name in (
'courses.view','students.view','teachers.view','enrollments.view','assignments.view','assignments.create','assignments.update','assignments.grade',
'classes.view','classes.create','classes.update','schedules.view','progress.view','progress.update','certificates.view','internships.view')
where lower(trim(r.name))='teacher' on conflict (role_id,permission_id) do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.name in (
'courses.view','students.view','enrollments.view','assignments.view','classes.view','schedules.view','progress.view','certificates.view','internships.view')
where lower(trim(r.name))='student' on conflict (role_id,permission_id) do nothing;


-- ==================================================================
-- SOURCE: supabase/migrations/20260824000000_admin_extended_backend.sql
-- ==================================================================
-- EDU Platform — Admin extended backend contract
-- Additive and idempotent. Requires roles/user_roles and has_role/is_admin helpers.

create extension if not exists pgcrypto;

-- ===================== ACADEMIC =====================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.courses add column if not exists category_id uuid references public.categories(id) on delete set null;

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.courses add column if not exists department_id uuid references public.departments(id) on delete set null;

create table if not exists public.teacher_departments (
  teacher_id uuid primary key references public.profiles(id) on delete cascade,
  department_id uuid not null references public.departments(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ===================== QUIZZES =====================
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  duration_minutes integer,
  passing_score numeric(5,2) not null default 50,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question text not null,
  options jsonb not null default '[]'::jsonb,
  correct_answer text,
  marks numeric(8,2) not null default 1,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  score numeric(8,2),
  status text not null default 'submitted' check (status in ('in_progress','submitted','graded')),
  answers jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  submitted_at timestamptz
);

-- ===================== EXAMS =====================
create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  duration_minutes integer,
  status text not null default 'draft' check (status in ('draft','scheduled','published','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table if not exists public.exam_questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  question text not null,
  options jsonb not null default '[]'::jsonb,
  correct_answer text,
  marks numeric(8,2) not null default 1,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  score numeric(8,2),
  status text not null default 'submitted' check (status in ('in_progress','submitted','graded')),
  answers jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  submitted_at timestamptz
);

-- ===================== BILLING / MARKETPLACE =====================
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  student_id uuid references public.profiles(id) on delete set null,
  invoice_number text not null unique,
  subtotal numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  currency text not null default 'PKR',
  status text not null default 'issued' check (status in ('draft','issued','paid','void','overdue')),
  issued_at timestamptz not null default now(),
  due_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  description text,
  sku text unique,
  price numeric(12,2) not null default 0 check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_orders (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','paid','cancelled','refunded')),
  total numeric(12,2) not null default 0,
  currency text not null default 'PKR',
  created_at timestamptz not null default now()
);

create table if not exists public.product_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.product_orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

-- ===================== CONTENT =====================
create table if not exists public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.blog_categories(id) on delete set null,
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  slug text unique,
  excerpt text,
  content text,
  featured_image text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.website_settings (
  id bigint generated by default as identity primary key,
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  description text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
,
  created_at timestamptz not null default now());

create table if not exists public.ai_settings (
  id bigint generated by default as identity primary key,
  feature text not null unique,
  enabled boolean not null default false,
  model text,
  daily_limit integer,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
,
  created_at timestamptz not null default now());

create table if not exists public.system_settings (
  id bigint generated by default as identity primary key,
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  description text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
,
  created_at timestamptz not null default now());

create table if not exists public.security_settings (
  id bigint generated by default as identity primary key,
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  description text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
,
  created_at timestamptz not null default now());

-- ===================== AUDIT =====================
create table if not exists public.audit_logs (
  id bigint generated by default as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  module text not null,
  target_type text,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);
create index if not exists idx_audit_logs_actor on public.audit_logs(actor_id);

create or replace function public.write_admin_audit()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if public.is_admin() then
    insert into public.audit_logs(actor_id, action, module, target_type, target_id, metadata)
    values (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      TG_TABLE_NAME,
      coalesce((case when TG_OP='DELETE' then OLD.id else NEW.id end)::text, ''),
      jsonb_build_object('source','admin_trigger')
    );
  end if;
  return coalesce(NEW, OLD);
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['courses','categories','departments','quizzes','exams','products','blog_posts','website_settings','ai_settings','system_settings','security_settings','invoices'] loop
    execute format('drop trigger if exists trg_admin_audit_%I on public.%I', t, t);
    execute format('create trigger trg_admin_audit_%I after insert or update or delete on public.%I for each row execute function public.write_admin_audit()', t, t);
  end loop;
end $$;

-- ===================== STORAGE =====================
insert into storage.buckets (id, name, public)
values ('admin-media','admin-media',false)
on conflict (id) do update set public=false;

-- ===================== RLS =====================
do $$
declare t text;
begin
  foreach t in array array['categories','departments','teacher_departments','quizzes','quiz_questions','quiz_attempts','exams','exam_questions','exam_attempts','invoices','products','product_orders','product_order_items','blog_categories','blog_posts','website_settings','ai_settings','system_settings','security_settings'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "admins manage %I" on public.%I', t, t);
    execute format('create policy "admins manage %I" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t, t);
  end loop;
  alter table public.audit_logs enable row level security;
  drop policy if exists "admins read audit logs" on public.audit_logs;
  create policy "admins read audit logs" on public.audit_logs for select to authenticated using (public.is_admin());
end $$;

-- Certificates/attendance schema compatibility for generic admin tables.
alter table public.certificates add column if not exists created_at timestamptz not null default now();
alter table public.attendance add column if not exists created_at timestamptz not null default now();

-- Admin read access for certificate/attendance is already supplied by Phase 6,
-- but make it explicit and idempotent here.
drop policy if exists "admins read certificates" on public.certificates;
create policy "admins read certificates" on public.certificates for select to authenticated using (public.is_admin());
drop policy if exists "admins read attendance" on public.attendance;
create policy "admins read attendance" on public.attendance for select to authenticated using (public.is_admin());

-- Storage: Admin-only private media bucket.
drop policy if exists "Admins can read admin media" on storage.objects;
create policy "Admins can read admin media" on storage.objects for select to authenticated using (bucket_id='admin-media' and public.is_admin());
drop policy if exists "Admins can upload admin media" on storage.objects;
create policy "Admins can upload admin media" on storage.objects for insert to authenticated with check (bucket_id='admin-media' and public.is_admin());
drop policy if exists "Admins can update admin media" on storage.objects;
create policy "Admins can update admin media" on storage.objects for update to authenticated using (bucket_id='admin-media' and public.is_admin()) with check (bucket_id='admin-media' and public.is_admin());
drop policy if exists "Admins can delete admin media" on storage.objects;
create policy "Admins can delete admin media" on storage.objects for delete to authenticated using (bucket_id='admin-media' and public.is_admin());

-- Minimal report view for Admin reporting.
create or replace view public.admin_financial_summary as
select
  count(*)::bigint as order_count,
  coalesce(sum(case when status='paid' then amount else 0 end),0)::numeric as paid_amount,
  coalesce(sum(case when status='pending' then amount else 0 end),0)::numeric as pending_amount,
  coalesce(sum(case when status='refunded' then amount else 0 end),0)::numeric as refunded_amount
from public.orders;

revoke all on public.admin_financial_summary from public;
grant select on public.admin_financial_summary to authenticated;

-- Seed useful settings without secrets.
-- ==================================================================
-- SOURCE: supabase/migrations/20260828000000_manager_operations.sql
-- ==================================================================
-- EDU Platform — Manager Operations + Internal Meetings
-- Additive migration. Run this file in Supabase SQL Editor after existing migrations.
-- Gives Managers backend support for:
-- courses, teacher assignment, student course changes, teacher attendance,
-- events, marketplace products, all-user messaging, and browser-native meetings.

-- ============================================================
-- 1. MANAGER COURSE + ENROLLMENT POLICIES
-- ============================================================

alter table public.courses enable row level security;
alter table public.enrollments enable row level security;

drop policy if exists "managers manage courses" on public.courses;
create policy "managers manage courses"
on public.courses for all
using (public.has_role('Manager') or public.has_role('Admin'))
with check (public.has_role('Manager') or public.has_role('Admin'));

drop policy if exists "managers manage enrollments" on public.enrollments;
create policy "managers manage enrollments"
on public.enrollments for all
using (public.has_role('Manager') or public.has_role('Admin'))
with check (public.has_role('Manager') or public.has_role('Admin'));

-- Manager needs to see every profile when selecting teachers/students/users.
alter table public.profiles enable row level security;
drop policy if exists "managers read all profiles" on public.profiles;
create policy "managers read all profiles"
on public.profiles for select
using (public.has_role('Manager') or public.has_role('Admin'));

-- ============================================================
-- 2. TEACHER ATTENDANCE
-- ============================================================

create table if not exists public.teacher_attendance (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  attendance_date date not null default current_date,
  status text not null default 'present'
    check (status in ('present','absent','late','leave','half_day')),
  check_in timestamptz,
  check_out timestamptz,
  notes text,
  marked_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (teacher_id, attendance_date)
);

create index if not exists idx_teacher_attendance_teacher_date
on public.teacher_attendance(teacher_id, attendance_date desc);

alter table public.teacher_attendance enable row level security;

drop policy if exists "managers manage teacher attendance" on public.teacher_attendance;
create policy "managers manage teacher attendance"
on public.teacher_attendance for all
using (public.has_role('Manager') or public.has_role('Admin'))
with check (public.has_role('Manager') or public.has_role('Admin'));

drop policy if exists "teachers read own teacher attendance" on public.teacher_attendance;
create policy "teachers read own teacher attendance"
on public.teacher_attendance for select
using (teacher_id = auth.uid());

drop trigger if exists teacher_attendance_set_updated_at on public.teacher_attendance;
create trigger teacher_attendance_set_updated_at
before update on public.teacher_attendance
for each row execute function public.set_updated_at();

-- ============================================================
-- 3. MANAGER EVENTS
-- ============================================================

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_type text not null default 'general'
    check (event_type in ('general','academic','meeting','holiday','workshop','exam','orientation')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text,
  meeting_room_id uuid,
  audience text not null default 'all'
    check (audience in ('all','students','teachers','managers')),
  status text not null default 'published'
    check (status in ('draft','published','cancelled','completed')),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists idx_events_start on public.events(starts_at);
create index if not exists idx_events_audience_status on public.events(audience, status);

alter table public.events enable row level security;

drop policy if exists "authenticated users read published events" on public.events;
create policy "authenticated users read published events"
on public.events for select
using (
  auth.uid() is not null
  and (
    (status = 'published' and (audience = 'all' or
      (audience = 'students' and public.has_role('Student')) or
      (audience = 'teachers' and public.has_role('Teacher')) or
      (audience = 'managers' and public.has_role('Manager'))))
    or public.has_role('Manager')
    or public.has_role('Admin')
  )
);

drop policy if exists "managers manage events" on public.events;
create policy "managers manage events"
on public.events for all
using (public.has_role('Manager') or public.has_role('Admin'))
with check (public.has_role('Manager') or public.has_role('Admin'));

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

-- ============================================================
-- 4. MARKETPLACE PRODUCTS
-- ============================================================

alter table public.products enable row level security;

drop policy if exists "authenticated users read active products" on public.products;
create policy "authenticated users read active products"
on public.products for select
using (is_active = true or public.has_role('Manager') or public.has_role('Admin'));

drop policy if exists "managers manage products" on public.products;
create policy "managers manage products"
on public.products for all
using (public.has_role('Manager') or public.has_role('Admin'))
with check (public.has_role('Manager') or public.has_role('Admin'));

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- ============================================================
-- 5. MANAGER CAN SEE ALL USERS' MESSAGES
-- ============================================================

alter table public.messages enable row level security;

drop policy if exists "managers read all messages" on public.messages;
create policy "managers read all messages"
on public.messages for select
using (public.has_role('Manager') or public.has_role('Admin'));

drop policy if exists "managers send messages to users" on public.messages;
create policy "managers send messages to users"
on public.messages for insert
with check (
  (public.has_role('Manager') or public.has_role('Admin'))
  and sender_id = auth.uid()
);

drop policy if exists "managers mark messages read" on public.messages;
create policy "managers mark messages read"
on public.messages for update
using (public.has_role('Manager') or public.has_role('Admin'))
with check (public.has_role('Manager') or public.has_role('Admin'));

-- ============================================================
-- 6. INTERNAL BROWSER-TO-BROWSER MEETINGS
-- Uses WebRTC in the website. Supabase only stores the room
-- and WebRTC signaling messages; no Zoom/Meet/Teams link is needed.
-- ============================================================

create table if not exists public.meeting_rooms (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  manager_id uuid not null references public.profiles(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  status text not null default 'scheduled'
    check (status in ('scheduled','live','ended','cancelled')),
  created_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);

create index if not exists idx_meeting_rooms_teacher
on public.meeting_rooms(teacher_id, starts_at desc);

create index if not exists idx_meeting_rooms_manager
on public.meeting_rooms(manager_id, starts_at desc);

create table if not exists public.meeting_signals (
  id bigint generated by default as identity primary key,
  room_id uuid not null references public.meeting_rooms(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  signal_type text not null
    check (signal_type in ('offer','answer','ice-candidate','leave')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_meeting_signals_room_created
on public.meeting_signals(room_id, created_at);

alter table public.meeting_rooms enable row level security;
alter table public.meeting_signals enable row level security;

drop policy if exists "meeting participants read rooms" on public.meeting_rooms;
create policy "meeting participants read rooms"
on public.meeting_rooms for select
using (
  manager_id = auth.uid()
  or teacher_id = auth.uid()
  or public.has_role('Admin')
);

drop policy if exists "managers create meeting rooms" on public.meeting_rooms;
create policy "managers create meeting rooms"
on public.meeting_rooms for insert
with check (
  (public.has_role('Manager') or public.has_role('Admin'))
  and manager_id = auth.uid()
);

drop policy if exists "managers update meeting rooms" on public.meeting_rooms;
create policy "managers update meeting rooms"
on public.meeting_rooms for update
using (manager_id = auth.uid() or public.has_role('Admin'))
with check (manager_id = auth.uid() or public.has_role('Admin'));

drop policy if exists "meeting participants read signals" on public.meeting_signals;
create policy "meeting participants read signals"
on public.meeting_signals for select
using (
  sender_id = auth.uid()
  or recipient_id = auth.uid()
  or exists (
    select 1 from public.meeting_rooms r
    where r.id = meeting_signals.room_id
      and (r.manager_id = auth.uid() or r.teacher_id = auth.uid() or public.has_role('Admin'))
  )
);

drop policy if exists "meeting participants send signals" on public.meeting_signals;
create policy "meeting participants send signals"
on public.meeting_signals for insert
with check (
  sender_id = auth.uid()
  and exists (
    select 1 from public.meeting_rooms r
    where r.id = meeting_signals.room_id
      and (
        (r.manager_id = auth.uid() and r.teacher_id = meeting_signals.recipient_id)
        or
        (r.teacher_id = auth.uid() and r.manager_id = meeting_signals.recipient_id)
        or public.has_role('Admin')
      )
  )
);

-- Enable Postgres Changes for WebRTC signaling when the publication is available.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'meeting_signals'
     ) then
    execute 'alter publication supabase_realtime add table public.meeting_signals';
  end if;
end $$;

-- Helpful indexes.
create index if not exists idx_courses_instructor on public.courses(instructor_id);
create index if not exists idx_enrollments_student on public.enrollments(student_id, enrolled_at desc);


-- ==================================================================
-- SOURCE: supabase/migrations/20260828100000_teacher_live_classroom.sql
-- ==================================================================
-- EDU Platform — Teacher live classroom, student attendance hardening and recordings
-- Additive migration. Run after the existing Manager/Phase 4 migrations.

-- ============================================================
-- 1. TEACHER ATTENDANCE / STUDENT VISIBILITY
-- ============================================================
-- Keep attendance rows scoped to the teacher who owns the class.
DROP POLICY IF EXISTS "teachers read own class attendance" ON public.attendance;
CREATE POLICY "teachers read own class attendance"
ON public.attendance FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.class_schedules cs
    WHERE cs.id = attendance.class_id
      AND cs.teacher_id = auth.uid()
  )
  OR public.has_role('Manager') OR public.has_role('Admin')
);

DROP POLICY IF EXISTS "teachers insert own class attendance" ON public.attendance;
CREATE POLICY "teachers insert own class attendance"
ON public.attendance FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.class_schedules cs
    JOIN public.enrollments e ON e.course_id=cs.course_id
    WHERE cs.id=attendance.class_id AND cs.teacher_id=auth.uid()
      AND e.student_id=attendance.student_id AND e.status IN ('active','completed')
  )
);

DROP POLICY IF EXISTS "teachers update own class attendance" ON public.attendance;
CREATE POLICY "teachers update own class attendance"
ON public.attendance FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.class_schedules cs WHERE cs.id=attendance.class_id AND cs.teacher_id=auth.uid()))
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.class_schedules cs
    JOIN public.enrollments e ON e.course_id=cs.course_id
    WHERE cs.id=attendance.class_id AND cs.teacher_id=auth.uid()
      AND e.student_id=attendance.student_id AND e.status IN ('active','completed')
  )
);

-- ============================================================
-- 2. LIVE CLASS SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.live_class_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL UNIQUE REFERENCES public.class_schedules(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','live','ended','cancelled')),
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_live_class_sessions_teacher ON public.live_class_sessions(teacher_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_class_sessions_status ON public.live_class_sessions(status);
ALTER TABLE public.live_class_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teachers manage own live sessions" ON public.live_class_sessions;
CREATE POLICY "teachers manage own live sessions"
ON public.live_class_sessions FOR ALL
USING (teacher_id = auth.uid() OR public.has_role('Manager') OR public.has_role('Admin'))
WITH CHECK (
  (teacher_id = auth.uid() AND EXISTS (SELECT 1 FROM public.class_schedules cs WHERE cs.id = class_id AND cs.teacher_id = auth.uid()))
  OR public.has_role('Manager') OR public.has_role('Admin')
);

DROP POLICY IF EXISTS "enrolled students read live sessions" ON public.live_class_sessions;
CREATE POLICY "enrolled students read live sessions"
ON public.live_class_sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.class_schedules cs
    JOIN public.enrollments e ON e.course_id = cs.course_id
    WHERE cs.id = live_class_sessions.class_id
      AND e.student_id = auth.uid()
      AND e.status IN ('active','completed')
  )
  OR teacher_id = auth.uid()
  OR public.has_role('Manager') OR public.has_role('Admin')
);

-- ============================================================
-- 3. LIVE CLASS PARTICIPANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.live_class_participants (
  session_id uuid NOT NULL REFERENCES public.live_class_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, user_id)
);
ALTER TABLE public.live_class_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "live participants read" ON public.live_class_participants;
CREATE POLICY "live participants read"
ON public.live_class_participants FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.live_class_sessions s WHERE s.id = session_id AND (s.teacher_id = auth.uid() OR EXISTS (SELECT 1 FROM public.class_schedules cs JOIN public.enrollments e ON e.course_id=cs.course_id WHERE cs.id=s.class_id AND e.student_id=auth.uid() AND e.status IN ('active','completed'))))
  OR public.has_role('Manager') OR public.has_role('Admin')
);
DROP POLICY IF EXISTS "live participants join leave" ON public.live_class_participants;
CREATE POLICY "live participants join leave"
ON public.live_class_participants FOR ALL
USING (user_id = auth.uid() OR public.has_role('Manager') OR public.has_role('Admin'))
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.live_class_sessions s
    WHERE s.id = session_id AND (s.teacher_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.class_schedules cs JOIN public.enrollments e ON e.course_id=cs.course_id
      WHERE cs.id=s.class_id AND e.student_id=auth.uid() AND e.status IN ('active','completed')
    ))
  )
);

-- ============================================================
-- 4. WEBRTC SIGNALING
-- ============================================================
CREATE TABLE IF NOT EXISTS public.live_class_signals (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES public.live_class_sessions(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  signal_type text NOT NULL CHECK (signal_type IN ('offer','answer','ice-candidate','leave')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_live_class_signals_session ON public.live_class_signals(session_id, created_at);
ALTER TABLE public.live_class_signals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "live signals participants read" ON public.live_class_signals;
CREATE POLICY "live signals participants read"
ON public.live_class_signals FOR SELECT
USING (
  sender_id = auth.uid() OR recipient_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.live_class_sessions s WHERE s.id=session_id AND (s.teacher_id=auth.uid() OR public.has_role('Manager') OR public.has_role('Admin')))
);
DROP POLICY IF EXISTS "live signals participants send" ON public.live_class_signals;
CREATE POLICY "live signals participants send"
ON public.live_class_signals FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.live_class_sessions s
    WHERE s.id=session_id AND (s.teacher_id=auth.uid() OR EXISTS (
      SELECT 1 FROM public.class_schedules cs JOIN public.enrollments e ON e.course_id=cs.course_id
      WHERE cs.id=s.class_id AND e.student_id=auth.uid() AND e.status IN ('active','completed')
    ))
  )
  AND EXISTS (SELECT 1 FROM public.live_class_participants p WHERE p.session_id=live_class_signals.session_id AND p.user_id=live_class_signals.recipient_id)
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname='supabase_realtime') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='live_class_signals') THEN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.live_class_signals';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='live_class_participants') THEN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.live_class_participants';
    END IF;
  END IF;
END $$;

-- ============================================================
-- 5. RECORDINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.live_class_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.live_class_sessions(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path text NOT NULL UNIQUE,
  mime_type text NOT NULL DEFAULT 'video/webm',
  file_size bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_live_class_recordings_session ON public.live_class_recordings(session_id, created_at DESC);
ALTER TABLE public.live_class_recordings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teachers manage own recordings" ON public.live_class_recordings;
CREATE POLICY "teachers manage own recordings"
ON public.live_class_recordings FOR ALL
USING (teacher_id=auth.uid() OR public.has_role('Manager') OR public.has_role('Admin'))
WITH CHECK (teacher_id=auth.uid() OR public.has_role('Manager') OR public.has_role('Admin'));

DROP POLICY IF EXISTS "enrolled students read recordings" ON public.live_class_recordings;
CREATE POLICY "enrolled students read recordings"
ON public.live_class_recordings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.live_class_sessions s
    JOIN public.class_schedules cs ON cs.id=s.class_id
    JOIN public.enrollments e ON e.course_id=cs.course_id
    WHERE s.id=live_class_recordings.session_id AND e.student_id=auth.uid() AND e.status IN ('active','completed')
  )
  OR teacher_id=auth.uid() OR public.has_role('Manager') OR public.has_role('Admin')
);

-- Private Storage bucket. Existing installations can safely re-run this.
INSERT INTO storage.buckets (id, name, public)
VALUES ('class-recordings', 'class-recordings', false)
ON CONFLICT (id) DO UPDATE SET public=false;

DROP POLICY IF EXISTS "teachers upload class recordings" ON storage.objects;
CREATE POLICY "teachers upload class recordings" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id='class-recordings' AND public.has_role('Teacher'));
DROP POLICY IF EXISTS "authenticated read own class recordings" ON storage.objects;
CREATE POLICY "authenticated read authorized class recordings" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id='class-recordings'
  AND (
    public.has_role('Manager') OR public.has_role('Admin')
    OR EXISTS (SELECT 1 FROM public.live_class_recordings r WHERE r.storage_path = name AND r.teacher_id = auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.live_class_recordings r
      JOIN public.live_class_sessions s ON s.id=r.session_id
      JOIN public.class_schedules cs ON cs.id=s.class_id
      JOIN public.enrollments e ON e.course_id=cs.course_id
      WHERE r.storage_path=name AND e.student_id=auth.uid() AND e.status IN ('active','completed')
    )
  )
);
DROP POLICY IF EXISTS "teachers delete class recordings" ON storage.objects;
CREATE POLICY "teachers delete class recordings" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id='class-recordings' AND public.has_role('Teacher'));


-- ==================================================================
-- SOURCE: supabase/migrations/20260828110000_teacher_instant_live_classes.sql
-- ==================================================================
-- Teacher instant live classes: a teacher can start a class at any time for any course they own.
ALTER TABLE public.live_class_sessions ADD COLUMN IF NOT EXISTS course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.live_class_sessions ALTER COLUMN class_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_live_class_sessions_course ON public.live_class_sessions(course_id, status, created_at DESC);

ALTER TABLE public.live_class_sessions DROP CONSTRAINT IF EXISTS live_class_sessions_class_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS live_class_sessions_one_live_per_course
  ON public.live_class_sessions(course_id)
  WHERE status = 'live' AND course_id IS NOT NULL;

DROP POLICY IF EXISTS "teachers manage own live sessions" ON public.live_class_sessions;
CREATE POLICY "teachers manage own live sessions"
ON public.live_class_sessions FOR ALL
USING (teacher_id = auth.uid() OR public.has_role('Manager') OR public.has_role('Admin'))
WITH CHECK (
  (teacher_id = auth.uid() AND (
    EXISTS (SELECT 1 FROM public.class_schedules cs WHERE cs.id = class_id AND cs.teacher_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.instructor_id = auth.uid())
  ))
  OR public.has_role('Manager') OR public.has_role('Admin')
);

DROP POLICY IF EXISTS "enrolled students read live sessions" ON public.live_class_sessions;
CREATE POLICY "enrolled students read live sessions"
ON public.live_class_sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.course_id = COALESCE(live_class_sessions.course_id, (SELECT cs.course_id FROM public.class_schedules cs WHERE cs.id = live_class_sessions.class_id))
      AND e.student_id = auth.uid()
      AND e.status IN ('active','completed')
  )
  OR teacher_id = auth.uid()
  OR public.has_role('Manager') OR public.has_role('Admin')
);

DROP POLICY IF EXISTS "live participants read" ON public.live_class_participants;
CREATE POLICY "live participants read" ON public.live_class_participants FOR SELECT
USING (EXISTS (SELECT 1 FROM public.live_class_sessions s WHERE s.id = session_id AND (s.teacher_id = auth.uid() OR public.has_role('Manager') OR public.has_role('Admin') OR EXISTS (SELECT 1 FROM public.enrollments e WHERE e.course_id = COALESCE(s.course_id, (SELECT cs.course_id FROM public.class_schedules cs WHERE cs.id=s.class_id)) AND e.student_id=auth.uid() AND e.status IN ('active','completed')))));

DROP POLICY IF EXISTS "live participants join leave" ON public.live_class_participants;
CREATE POLICY "live participants join leave" ON public.live_class_participants FOR ALL
USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.live_class_sessions s WHERE s.id=session_id AND (s.teacher_id=auth.uid() OR EXISTS (SELECT 1 FROM public.enrollments e WHERE e.course_id=COALESCE(s.course_id,(SELECT cs.course_id FROM public.class_schedules cs WHERE cs.id=s.class_id)) AND e.student_id=auth.uid() AND e.status IN ('active','completed')))))
WITH CHECK (user_id=auth.uid() AND EXISTS (SELECT 1 FROM public.live_class_sessions s WHERE s.id=session_id AND (s.teacher_id=auth.uid() OR EXISTS (SELECT 1 FROM public.enrollments e WHERE e.course_id=COALESCE(s.course_id,(SELECT cs.course_id FROM public.class_schedules cs WHERE cs.id=s.class_id)) AND e.student_id=auth.uid() AND e.status IN ('active','completed')))));

DROP POLICY IF EXISTS "live signals participants read" ON public.live_class_signals;
CREATE POLICY "live signals participants read" ON public.live_class_signals FOR SELECT
USING (recipient_id=auth.uid() OR sender_id=auth.uid() OR EXISTS (SELECT 1 FROM public.live_class_sessions s WHERE s.id=session_id AND (s.teacher_id=auth.uid() OR public.has_role('Manager') OR public.has_role('Admin'))));

DROP POLICY IF EXISTS "live signals participants send" ON public.live_class_signals;
CREATE POLICY "live signals participants send" ON public.live_class_signals FOR INSERT
WITH CHECK (sender_id=auth.uid() AND EXISTS (SELECT 1 FROM public.live_class_sessions s WHERE s.id=session_id AND (s.teacher_id=auth.uid() OR EXISTS (SELECT 1 FROM public.enrollments e WHERE e.course_id=COALESCE(s.course_id,(SELECT cs.course_id FROM public.class_schedules cs WHERE cs.id=s.class_id)) AND e.student_id=auth.uid() AND e.status IN ('active','completed'))) AND EXISTS (SELECT 1 FROM public.live_class_participants p WHERE p.session_id=live_class_signals.session_id AND p.user_id=live_class_signals.recipient_id)));


-- ==================================================================
-- SOURCE: supabase/migrations/20260828120000_teacher_course_attendance.sql
-- ==================================================================
-- EDU Platform — Teacher instant live classes + course-level attendance
-- Safe follow-up migration for existing installations.
-- Supports both scheduled class sessions and instant course sessions.

-- ============================================================
-- 1. LIVE SESSION SCHEMA
-- ============================================================

ALTER TABLE public.live_class_sessions
  ADD COLUMN IF NOT EXISTS course_id uuid
  REFERENCES public.courses(id)
  ON DELETE CASCADE;

ALTER TABLE public.live_class_sessions
  ALTER COLUMN class_id DROP NOT NULL;

ALTER TABLE public.live_class_sessions
  DROP CONSTRAINT IF EXISTS live_class_sessions_class_id_key;

CREATE INDEX IF NOT EXISTS idx_live_class_sessions_course_status
  ON public.live_class_sessions(course_id, status, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS live_class_sessions_one_live_per_course
  ON public.live_class_sessions(course_id)
  WHERE status = 'live' AND course_id IS NOT NULL;


-- ============================================================
-- 2. ATTENDANCE: COURSE-BASED, NOT CLASS-BASED
-- ============================================================

ALTER TABLE public.attendance
  ADD COLUMN IF NOT EXISTS course_id uuid
  REFERENCES public.courses(id)
  ON DELETE CASCADE;

ALTER TABLE public.attendance
  ADD COLUMN IF NOT EXISTS attendance_date date;

-- Backfill course_id from legacy scheduled classes.
UPDATE public.attendance a
SET course_id = cs.course_id
FROM public.class_schedules cs
WHERE cs.id = a.class_id
  AND a.course_id IS NULL;

-- Backfill the date from the existing timestamp.
UPDATE public.attendance
SET attendance_date = COALESCE((marked_at AT TIME ZONE 'UTC')::date, CURRENT_DATE)
WHERE attendance_date IS NULL;

ALTER TABLE public.attendance
  ALTER COLUMN course_id SET NOT NULL;

ALTER TABLE public.attendance
  ALTER COLUMN attendance_date SET DEFAULT CURRENT_DATE;

ALTER TABLE public.attendance
  ALTER COLUMN attendance_date SET NOT NULL;

-- class_id remains nullable for instant/course-level attendance.
ALTER TABLE public.attendance
  ALTER COLUMN class_id DROP NOT NULL;

-- Remove the old class-only uniqueness rule.
ALTER TABLE public.attendance
  DROP CONSTRAINT IF EXISTS attendance_class_id_student_id_key;

-- Existing databases can have more than one scheduled attendance row
-- for the same student/course/day. Keep the latest row before adding
-- the course/day uniqueness rule.
DELETE FROM public.attendance older
USING public.attendance newer
WHERE older.course_id = newer.course_id
  AND older.student_id = newer.student_id
  AND older.attendance_date = newer.attendance_date
  AND older.id <> newer.id
  AND (
    older.marked_at < newer.marked_at
    OR (older.marked_at = newer.marked_at AND older.id::text < newer.id::text)
  );

CREATE UNIQUE INDEX IF NOT EXISTS attendance_course_student_date_key
  ON public.attendance(course_id, student_id, attendance_date);

CREATE INDEX IF NOT EXISTS idx_attendance_course_date
  ON public.attendance(course_id, attendance_date, marked_at DESC);


-- ============================================================
-- 3. ATTENDANCE RLS
-- ============================================================

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teachers read own class attendance" ON public.attendance;
DROP POLICY IF EXISTS "teachers insert own class attendance" ON public.attendance;
DROP POLICY IF EXISTS "teachers update own class attendance" ON public.attendance;
DROP POLICY IF EXISTS "teachers manage course attendance" ON public.attendance;

CREATE POLICY "teachers manage course attendance"
ON public.attendance
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.courses c
    WHERE c.id = attendance.course_id
      AND c.instructor_id = auth.uid()
  )
  OR public.has_role('Manager')
  OR public.has_role('Admin')
)
WITH CHECK (
  (
    EXISTS (
      SELECT 1
      FROM public.courses c
      WHERE c.id = attendance.course_id
        AND c.instructor_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.enrollments e
      WHERE e.course_id = attendance.course_id
        AND e.student_id = attendance.student_id
        AND e.status IN ('active', 'completed')
    )
  )
  OR public.has_role('Manager')
  OR public.has_role('Admin')
);


-- ============================================================
-- 4. LIVE SESSION RLS
-- ============================================================

DROP POLICY IF EXISTS "teachers manage own live sessions" ON public.live_class_sessions;

CREATE POLICY "teachers manage own live sessions"
ON public.live_class_sessions
FOR ALL
USING (
  teacher_id = auth.uid()
  OR public.has_role('Manager')
  OR public.has_role('Admin')
)
WITH CHECK (
  (
    teacher_id = auth.uid()
    AND (
      EXISTS (
        SELECT 1
        FROM public.class_schedules cs
        WHERE cs.id = class_id
          AND cs.teacher_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1
        FROM public.courses c
        WHERE c.id = course_id
          AND c.instructor_id = auth.uid()
      )
    )
  )
  OR public.has_role('Manager')
  OR public.has_role('Admin')
);

DROP POLICY IF EXISTS "enrolled students read live sessions" ON public.live_class_sessions;

CREATE POLICY "enrolled students read live sessions"
ON public.live_class_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.enrollments e
    WHERE e.course_id = COALESCE(
      live_class_sessions.course_id,
      (
        SELECT cs.course_id
        FROM public.class_schedules cs
        WHERE cs.id = live_class_sessions.class_id
      )
    )
    AND e.student_id = auth.uid()
    AND e.status IN ('active', 'completed')
  )
  OR teacher_id = auth.uid()
  OR public.has_role('Manager')
  OR public.has_role('Admin')
);


-- ============================================================
-- 5. PARTICIPANTS RLS
-- ============================================================

DROP POLICY IF EXISTS "live participants read" ON public.live_class_participants;

CREATE POLICY "live participants read"
ON public.live_class_participants
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.live_class_sessions s
    WHERE s.id = session_id
      AND (
        s.teacher_id = auth.uid()
        OR public.has_role('Manager')
        OR public.has_role('Admin')
        OR EXISTS (
          SELECT 1
          FROM public.enrollments e
          WHERE e.course_id = COALESCE(
            s.course_id,
            (
              SELECT cs.course_id
              FROM public.class_schedules cs
              WHERE cs.id = s.class_id
            )
          )
          AND e.student_id = auth.uid()
          AND e.status IN ('active', 'completed')
        )
      )
  )
);

DROP POLICY IF EXISTS "live participants join leave" ON public.live_class_participants;

CREATE POLICY "live participants join leave"
ON public.live_class_participants
FOR ALL
USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.live_class_sessions s
    WHERE s.id = session_id
      AND (
        s.teacher_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.enrollments e
          WHERE e.course_id = COALESCE(
            s.course_id,
            (
              SELECT cs.course_id
              FROM public.class_schedules cs
              WHERE cs.id = s.class_id
            )
          )
          AND e.student_id = auth.uid()
          AND e.status IN ('active', 'completed')
        )
      )
  )
)
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.live_class_sessions s
    WHERE s.id = session_id
      AND (
        s.teacher_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.enrollments e
          WHERE e.course_id = COALESCE(
            s.course_id,
            (
              SELECT cs.course_id
              FROM public.class_schedules cs
              WHERE cs.id = s.class_id
            )
          )
          AND e.student_id = auth.uid()
          AND e.status IN ('active', 'completed')
        )
      )
  )
);


-- ============================================================
-- 6. SIGNALING RLS
-- ============================================================

DROP POLICY IF EXISTS "live signals participants read" ON public.live_class_signals;

CREATE POLICY "live signals participants read"
ON public.live_class_signals
FOR SELECT
USING (
  recipient_id = auth.uid()
  OR sender_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.live_class_sessions s
    WHERE s.id = session_id
      AND (
        s.teacher_id = auth.uid()
        OR public.has_role('Manager')
        OR public.has_role('Admin')
      )
  )
);

DROP POLICY IF EXISTS "live signals participants send" ON public.live_class_signals;

CREATE POLICY "live signals participants send"
ON public.live_class_signals
FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.live_class_sessions s
    WHERE s.id = session_id
      AND (
        s.teacher_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.enrollments e
          WHERE e.course_id = COALESCE(
            s.course_id,
            (
              SELECT cs.course_id
              FROM public.class_schedules cs
              WHERE cs.id = s.class_id
            )
          )
          AND e.student_id = auth.uid()
          AND e.status IN ('active', 'completed')
        )
      )
  )
  AND EXISTS (
    SELECT 1
    FROM public.live_class_participants p
    WHERE p.session_id = live_class_signals.session_id
      AND p.user_id = live_class_signals.recipient_id
  )
);


-- ==================================================================
-- SOURCE: supabase/migrations/20261002000000_public_signup_student_bootstrap.sql
-- ==================================================================
-- EDU Platform — make public sign-up usable on a fresh academy database.
-- Assumes the existing core RBAC tables used by the frontend:
-- public.profiles(id, full_name, email, phone), public.roles(id, name),
-- public.user_roles(user_id, role_id).
-- Public users never choose their own privileged role: every new auth user is
-- assigned Student only. Admin/Manager/Teacher promotion stays an admin action.

create or replace function public.handle_academy_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  student_role_id uuid;
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone', '')), '')
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    email = coalesce(excluded.email, public.profiles.email),
    phone = coalesce(excluded.phone, public.profiles.phone);

  select id into student_role_id
  from public.roles
  where lower(trim(name)) = 'student'
  order by id
  limit 1;

  if student_role_id is null then
    raise exception 'Student role is missing from public.roles';
  end if;

  insert into public.user_roles (user_id, role_id)
  values (new.id, student_role_id)
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_academy_auth_user_created on auth.users;
create trigger on_academy_auth_user_created
after insert on auth.users
for each row execute function public.handle_academy_new_user();

revoke all on function public.handle_academy_new_user() from public, anon, authenticated;



-- ==================================================================
-- FINAL PRODUCTION REPAIR PATCH (V5)
-- Safe for databases where earlier setup stopped part-way through.
-- ==================================================================

-- Settings pages: older partial schemas did not include created_at.
alter table if exists public.website_settings add column if not exists created_at timestamptz not null default now();
alter table if exists public.ai_settings add column if not exists created_at timestamptz not null default now();
alter table if exists public.system_settings add column if not exists created_at timestamptz not null default now();
alter table if exists public.security_settings add column if not exists created_at timestamptz not null default now();

-- Ensure all four production roles exist. These are system configuration, not demo data.
insert into public.roles(name) values ('Student'),('Teacher'),('Manager'),('Admin') on conflict(name) do nothing;

-- Admin and Manager need profile visibility for user creation and private meeting selection.
drop policy if exists "admins and managers read all profiles" on public.profiles;
create policy "admins and managers read all profiles" on public.profiles for select
using (public.has_role('Admin') or public.has_role('Manager') or id = auth.uid());

-- Admin may create/manage private browser meetings too. teacher_id is retained as a legacy
-- column name but now represents the one specifically selected participant (any role).
drop policy if exists "meeting participants read rooms" on public.meeting_rooms;
create policy "meeting participants read rooms" on public.meeting_rooms for select
using (manager_id = auth.uid() or teacher_id = auth.uid());

drop policy if exists "managers create meeting rooms" on public.meeting_rooms;
create policy "admins managers create meeting rooms" on public.meeting_rooms for insert
with check ((public.has_role('Manager') or public.has_role('Admin')) and manager_id = auth.uid() and teacher_id <> auth.uid());

drop policy if exists "managers update meeting rooms" on public.meeting_rooms;
create policy "admins managers update meeting rooms" on public.meeting_rooms for update
using ((public.has_role('Manager') or public.has_role('Admin')) and manager_id = auth.uid())
with check ((public.has_role('Manager') or public.has_role('Admin')) and manager_id = auth.uid());

-- No demo application records are inserted by this setup. Only required roles/permissions
-- are seeded. Real users, courses, classes, payments and content start empty.


-- ==================================================================
-- 2026-10-06 STUDENT ADMISSION APPROVAL FLOW
-- ==================================================================
-- EDU Platform: Student course admission approval flow
-- Run once in Supabase SQL Editor.

drop policy if exists "students read own admissions" on public.admissions;
create policy "students read own admissions" on public.admissions for select to authenticated
using (profile_id = auth.uid());

create or replace function public.request_course_admission(p_course_id uuid)
returns public.admissions
language plpgsql security definer set search_path = public
as $$
declare
  v_profile public.profiles;
  v_course public.courses;
  v_existing public.admissions;
  v_email text;
  v_first text;
  v_last text;
begin
  if auth.uid() is null then raise exception 'You must be signed in to enroll.'; end if;
  if not public.has_role('Student') then raise exception 'Only Student accounts can request course admission.'; end if;

  select * into v_course from public.courses where id = p_course_id and status = 'published';
  if not found then raise exception 'This course is not available for enrollment.'; end if;

  select * into v_profile from public.profiles where id = auth.uid();
  select email into v_email from auth.users where id = auth.uid();

  if exists (select 1 from public.enrollments where student_id=auth.uid() and course_id=p_course_id and status in ('active','completed')) then
    raise exception 'You are already enrolled in this course.';
  end if;

  select * into v_existing from public.admissions
  where profile_id=auth.uid() and course_id=p_course_id and status in ('pending','approved','interview')
  order by created_at desc limit 1;
  if found then return v_existing; end if;

  v_first := split_part(coalesce(nullif(trim(v_profile.full_name),''),'Student'),' ',1);
  v_last := nullif(trim(substr(coalesce(v_profile.full_name,''),length(v_first)+1)),'');
  if v_last is null then v_last := '-'; end if;

  insert into public.admissions(profile_id,first_name,last_name,email,phone,course_id,course_name,status)
  values(auth.uid(),v_first,v_last,coalesce(v_profile.email,v_email),v_profile.phone,v_course.id,v_course.title,'pending')
  returning * into v_existing;
  return v_existing;
end;
$$;
grant execute on function public.request_course_admission(uuid) to authenticated;

create or replace function public.review_course_admission(p_admission_id uuid,p_status text)
returns public.admissions
language plpgsql security definer set search_path = public
as $$
declare v_admission public.admissions;
begin
  if not (public.has_role('Admin') or public.has_role('Manager')) then raise exception 'Only Admin or Manager can review admissions.'; end if;
  if p_status not in ('approved','rejected','interview') then raise exception 'Invalid admission status.'; end if;

  select * into v_admission from public.admissions where id=p_admission_id for update;
  if not found then raise exception 'Admission not found.'; end if;
  if v_admission.profile_id is null then raise exception 'This application is not linked to a student account.'; end if;
  if v_admission.course_id is null then raise exception 'This application is not linked to a course.'; end if;

  update public.admissions set status=p_status,reviewed_by=auth.uid(),reviewed_at=now(),updated_at=now()
  where id=p_admission_id returning * into v_admission;

  if p_status='approved' then
    insert into public.enrollments(course_id,student_id,status,progress,enrolled_at)
    values(v_admission.course_id,v_admission.profile_id,'active',0,now())
    on conflict(course_id,student_id) do update set status='active',completed_at=null;
  elsif p_status='rejected' then
    update public.enrollments set status='cancelled'
    where course_id=v_admission.course_id and student_id=v_admission.profile_id and status='pending';
  end if;
  return v_admission;
end;
$$;
grant execute on function public.review_course_admission(uuid,text) to authenticated;

