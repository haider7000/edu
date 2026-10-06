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
