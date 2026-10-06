import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import PublicLayout from "../layouts/PublicLayout";
import StudentLayout from "../layouts/StudentLayout";
import TeacherLayout from "../layouts/TeacherLayout";
import ManagerLayout from "../layouts/ManagerLayout";
import AdminLayout from "../layouts/AdminLayout";

// Authentication
import ProtectedRoute from "../components/auth/ProtectedRoute";

// Public Pages
import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Courses from "../pages/public/Courses";
import CourseDetails from "../pages/public/CourseDetails";
import Pricing from "../pages/public/Pricing";
import Admission from "../pages/public/Admission";
import Internship from "../pages/public/Internship";
import FAQ from "../pages/public/FAQ";
import Contact from "../pages/public/Contact";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import AccessDenied from "../pages/public/AccessDenied";

// Student Pages
import StudentDashboard from "../pages/student/Dashboard";
import MyCourses from "../pages/student/MyCourses";
import CourseDetailsStudent from "../pages/student/CourseDetails";
import LiveClasses from "../pages/student/LiveClasses";
import RecordedClasses from "../pages/student/RecordedClasses";
import Assignments from "../pages/student/Assignments";
import AssignmentDetails from "../pages/student/AssignmentDetails";
import Grades from "../pages/student/Grades";
import Attendance from "../pages/student/Attendance";
import Progress from "../pages/student/Progress";
import StudyMaterials from "../pages/student/StudyMaterials";
import Calendar from "../pages/student/Calendar";
import Certificates from "../pages/student/Certificates";
import Messages from "../pages/student/Messages";
import Notifications from "../pages/student/Notifications";
import Portfolio from "../pages/student/Portfolio";
import Resume from "../pages/student/Resume";
import InternshipStudent from "../pages/student/Internship";
import JobBoard from "../pages/student/JobBoard";
import Marketplace from "../pages/student/Marketplace";
import Orders from "../pages/student/Orders";
import Payments from "../pages/student/Payments";
import Earnings from "../pages/student/Earnings";
import Referral from "../pages/student/Referral";
import Help from "../pages/student/Help";
import Profile from "../pages/student/Profile";
import Settings from "../pages/student/Settings";
import Applications from "../pages/student/Applications";

// Teacher
import TeacherDashboard from "../pages/teacher/Dashboard";
import TeacherCourses from "../pages/teacher/MyCourses";
import TeacherStudents from "../pages/teacher/MyStudents";
import TeacherStudentDetails from "../pages/teacher/StudentDetails";
import TeacherAssignments from "../pages/teacher/Assignments";
import TeacherAssignmentReview from "../pages/teacher/AssignmentReview";
import TeacherGrades from "../pages/teacher/Grades";
import TeacherAttendance from "../pages/teacher/Attendance";
import TeacherLiveClasses from "../pages/teacher/LiveClasses";
import TeacherRecordedLectures from "../pages/teacher/RecordedLectures";
import TeacherStudyMaterials from "../pages/teacher/StudyMaterials";
import TeacherCalendar from "../pages/teacher/Calendar";
import TeacherAnnouncements from "../pages/teacher/Announcements";
import TeacherMessages from "../pages/teacher/Messages";
import TeacherNotifications from "../pages/teacher/Notifications";
import TeacherDailyReport from "../pages/teacher/DailyReport";
import TeacherInternship from "../pages/teacher/Internship";
import TeacherProfile from "../pages/teacher/Profile";
import TeacherSettings from "../pages/teacher/Settings";
import LiveClassRoom from "../components/common/LiveClassRoom";

// Manager
import ManagerDashboard from "../pages/manager/Dashboard";
import ManagerAdmissions from "../pages/manager/Admissions";
import ManagerStudents from "../pages/manager/Students";
import ManagerTeachers from "../pages/manager/Teachers";
import ManagerCourses from "../pages/manager/Courses";
import ManagerSchedules from "../pages/manager/Schedules";
import ManagerCalendar from "../pages/manager/Calendar";
import ManagerAttendance from "../pages/manager/Attendance";
import ManagerLiveClasses from "../pages/manager/LiveClasses";
import ManagerPayments from "../pages/manager/Payments";
import ManagerCertificates from "../pages/manager/Certificates";
import ManagerInternships from "../pages/manager/Internships";
import ManagerMarketplace from "../pages/manager/Marketplace";
import ManagerReferralReports from "../pages/manager/ReferralReports";
import ManagerTeacherReports from "../pages/manager/TeacherReports";
import ManagerAnalytics from "../pages/manager/Analytics";
import ManagerMessages from "../pages/manager/Messages";
import ManagerNotifications from "../pages/manager/Notifications";
import ManagerProfile from "../pages/manager/Profile";
import ManagerSettings from "../pages/manager/Settings";
import ManagerTeacherAttendance from "../pages/manager/TeacherAttendance";
import ManagerEvents from "../pages/manager/Events";
import ManagerMeetings from "../pages/manager/Meetings";
import ManagerUsers from "../pages/manager/Users";
import MeetingRoom from "../pages/manager/MeetingRoom";

// Admin
import AdminDashboard from "../pages/admin/Dashboard";
import AdminUsers from "../pages/admin/Users";
import AdminAdmissions from "../pages/manager/Admissions";
import AdminRoles from "../pages/admin/Roles";
import AdminPermissions from "../pages/admin/Permissions";
import AdminCourses from "../pages/admin/Courses";
import AdminCategories from "../pages/admin/Categories";
import AdminDepartments from "../pages/admin/Departments";
import AdminModules from "../pages/admin/Modules";
import AdminLessons from "../pages/admin/Lessons";
import AdminQuizzes from "../pages/admin/Quizzes";
import AdminAssignments from "../pages/admin/Assignments";
import AdminExams from "../pages/admin/Exams";
import AdminCertificates from "../pages/admin/Certificates";
import AdminInternships from "../pages/admin/Internships";
import AdminAttendance from "../pages/admin/Attendance";
import AdminLiveClasses from "../pages/admin/LiveClasses";
import AdminPayments from "../pages/admin/Payments";
import AdminOrders from "../pages/admin/Orders";
import AdminInvoices from "../pages/admin/Invoices";
import AdminMarketplace from "../pages/admin/Marketplace";
import AdminProducts from "../pages/admin/Products";
import AdminAnalytics from "../pages/admin/Analytics";
import AdminReports from "../pages/admin/Reports";
import AdminAuditLogs from "../pages/admin/AuditLogs";
import AdminBlog from "../pages/admin/Blog";
import AdminMediaLibrary from "../pages/admin/MediaLibrary";
import AdminWebsite from "../pages/admin/Website";
import AdminAISettings from "../pages/admin/AISettings";
import AdminSecurity from "../pages/admin/Security";
import AdminSystemSettings from "../pages/admin/SystemSettings";
import AdminProfile from "../pages/admin/Profile";

export default function AppRoutes() {
  return (
    <Routes>

      {/* =====================================================
          PUBLIC WEBSITE
      ====================================================== */}

      <Route element={<PublicLayout />}>

        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />} />

        <Route path="/courses" element={<Courses />} />

        <Route
          path="/courses/:id"
          element={<CourseDetails />}
        />

        <Route path="/pricing" element={<Pricing />} />

        <Route
          path="/admission"
          element={<Admission />}
        />

        <Route
          path="/internships"
          element={<Internship />}
        />

        <Route path="/faq" element={<FAQ />} />

        <Route path="/contact" element={<Contact />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

      </Route>


      {/* =====================================================
          ACCESS DENIED
      ====================================================== */}

      <Route
        path="/access-denied"
        element={<AccessDenied />}
      />


      {/* =====================================================
          STUDENT PORTAL
          Only Student role can access
      ====================================================== */}

      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={["Student"]}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >

        <Route
          index
          element={<Navigate to="dashboard" replace />}
        />

        <Route
          path="dashboard"
          element={<StudentDashboard />}
        />
        <Route
          path="courses"
          element={<MyCourses />}
        />

        <Route
          path="courses/:id"
          element={<CourseDetailsStudent />}
        />

        <Route
          path="live-classes"
          element={<LiveClasses />}
        />

        <Route
          path="live-class/:sessionId"
          element={<LiveClassRoom />}
        />

        <Route
          path="recorded-classes"
          element={<RecordedClasses />}
        />

        <Route
          path="assignments"
          element={<Assignments />}
        />
        <Route
          path="assignments/:id"
          element={<AssignmentDetails />}
        />

        <Route
          path="grades"
          element={<Grades />}
        />

        <Route
          path="attendance"
          element={<Attendance />}
        />

        <Route
          path="progress"
          element={<Progress />}
        />

        <Route
          path="study-materials"
          element={<StudyMaterials />}
        />

        <Route
          path="calendar"
          element={<Calendar />}
        />

        <Route
          path="certificates"
          element={<Certificates />}
        />

        <Route
          path="messages"
          element={<Messages />}
        />

        <Route
          path="notifications"
          element={<Notifications />}
        />

        <Route
          path="portfolio"
          element={<Portfolio />}
        />

        <Route
          path="resume"
          element={<Resume />}
        />

        <Route
          path="internship"
          element={<InternshipStudent />}
        />

        <Route
          path="job-board"
          element={<JobBoard />}
        />

        <Route
          path="marketplace"
          element={<Marketplace />}
        />

        <Route
          path="orders"
          element={<Orders />}
        />

        <Route
          path="payments"
          element={<Payments />}
        />

        <Route
          path="earnings"
          element={<Earnings />}
        />

        <Route
          path="referral"
          element={<Referral />}
        />

        <Route
          path="applications"
          element={<Applications />}
        />

        <Route
          path="profile"
          element={<Profile />}
        />

        <Route
          path="settings"
          element={<Settings />}
        />

        <Route
          path="help"
          element={<Help />}
        />

      </Route>


      {/* =====================================================
          TEACHER PORTAL
          Only Teacher role can access
      ====================================================== */}

      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={["Teacher"]}>
            <TeacherLayout />
          </ProtectedRoute>
        }
      >

        <Route
          index
          element={<Navigate to="dashboard" replace />}
        />

        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="courses" element={<TeacherCourses />} />
        <Route path="students" element={<TeacherStudents />} />
        <Route path="students/:id" element={<TeacherStudentDetails />} />
        <Route path="assignments" element={<TeacherAssignments />} />
        <Route path="assignments/review" element={<TeacherAssignmentReview />} />
        <Route path="assignment-review" element={<TeacherAssignmentReview />} />
        <Route path="grades" element={<TeacherGrades />} />
        <Route path="attendance" element={<TeacherAttendance />} />
        <Route path="live-classes" element={<TeacherLiveClasses />} />
        <Route path="live-class/:sessionId" element={<LiveClassRoom teacherMode />} />
        <Route path="recorded-lectures" element={<TeacherRecordedLectures />} />
        <Route path="study-materials" element={<TeacherStudyMaterials />} />
        <Route path="calendar" element={<TeacherCalendar />} />
        <Route path="announcements" element={<TeacherAnnouncements />} />
        <Route path="messages" element={<TeacherMessages />} />
        <Route path="notifications" element={<TeacherNotifications />} />
        <Route path="daily-report" element={<TeacherDailyReport />} />
        <Route path="internship" element={<TeacherInternship />} />
        <Route path="profile" element={<TeacherProfile />} />
        <Route path="settings" element={<TeacherSettings />} />
      </Route>


      {/* =====================================================
          MANAGER PORTAL
          Only Manager role can access
      ====================================================== */}

      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRoles={["Manager"]}>
            <ManagerLayout />
          </ProtectedRoute>
        }
      >

        <Route
          index
          element={<Navigate to="dashboard" replace />}
        />

        <Route
          path="dashboard"
          element={<ManagerDashboard />}
        />

        <Route path="admissions" element={<ManagerAdmissions />} />
        <Route path="users" element={<ManagerUsers />} />
        <Route path="students" element={<ManagerStudents />} />
        <Route path="teachers" element={<ManagerTeachers />} />
        <Route path="courses" element={<ManagerCourses />} />
        <Route path="schedules" element={<ManagerSchedules />} />
        <Route path="calendar" element={<ManagerCalendar />} />
        <Route path="events" element={<ManagerEvents />} />
        <Route path="meetings" element={<ManagerMeetings />} />
        <Route path="attendance" element={<ManagerAttendance />} />
        <Route path="teacher-attendance" element={<ManagerTeacherAttendance />} />
        <Route path="live-classes" element={<ManagerLiveClasses />} />
        <Route path="payments" element={<ManagerPayments />} />
        <Route path="certificates" element={<ManagerCertificates />} />
        <Route path="internships" element={<ManagerInternships />} />
        <Route path="marketplace" element={<ManagerMarketplace />} />
        <Route path="referral-reports" element={<ManagerReferralReports />} />
        <Route path="teacher-reports" element={<ManagerTeacherReports />} />
        <Route path="analytics" element={<ManagerAnalytics />} />
        <Route path="messages" element={<ManagerMessages />} />
        <Route path="notifications" element={<ManagerNotifications />} />
        <Route path="profile" element={<ManagerProfile />} />
        <Route path="settings" element={<ManagerSettings />} />

      </Route>


      {/* =====================================================
          INTERNAL VIDEO MEETING
          Access is enforced again by meeting-room RLS.
      ====================================================== */}
      <Route
        path="/meetings/:roomId"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Manager", "Teacher", "Student"]}>
            <MeetingRoom />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          ADMIN PORTAL
          Only Admin role can access
      ====================================================== */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >

        <Route
          index
          element={<Navigate to="dashboard" replace />}
        />

        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="admissions" element={<AdminAdmissions />} />
        <Route path="roles" element={<AdminRoles />} />
        <Route path="meetings" element={<ManagerMeetings />} />
        <Route path="permissions" element={<AdminPermissions />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="departments" element={<AdminDepartments />} />
        <Route path="modules" element={<AdminModules />} />
        <Route path="lessons" element={<AdminLessons />} />
        <Route path="quizzes" element={<AdminQuizzes />} />
        <Route path="assignments" element={<AdminAssignments />} />
        <Route path="exams" element={<AdminExams />} />
        <Route path="certificates" element={<AdminCertificates />} />
        <Route path="internships" element={<AdminInternships />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="live-classes" element={<AdminLiveClasses />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="invoices" element={<AdminInvoices />} />
        <Route path="marketplace" element={<AdminMarketplace />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="blog" element={<AdminBlog />} />
        <Route path="media-library" element={<AdminMediaLibrary />} />
        <Route path="website" element={<AdminWebsite />} />
        <Route path="ai-settings" element={<AdminAISettings />} />
        <Route path="security" element={<AdminSecurity />} />
        <Route path="system-settings" element={<AdminSystemSettings />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>


      {/* =====================================================
          FALLBACK
      ====================================================== */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}