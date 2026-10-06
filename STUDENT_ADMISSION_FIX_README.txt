STUDENT ADMISSION APPROVAL FLOW - INSTALL

1. Supabase Dashboard -> SQL Editor -> New query.
2. Open supabase/migrations/20261006_student_admission_approval_flow.sql and run the whole file.
3. Restart the frontend: npm install, then npm run dev.

Expected flow:
- Visitor opens Courses and selects a published course.
- Not logged in: Sign up & enroll keeps the selected course through signup/login.
- Logged-in Student: Enroll submits a pending admission.
- Pending student sees only the Waiting for admission approval screen.
- Student with no course sees Pick a course to start + Explore Courses.
- Admin and Manager both have Admissions.
- Approve creates/activates the enrollment automatically.
- Full Student portal unlocks after approval.
- Teacher ownership is automatic through courses.instructor_id; the approved enrollment makes the student visible to the teacher handling that course.

IMPORTANT: Make sure every published course has an instructor_id assigned to the correct Teacher.
