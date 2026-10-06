import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  FileText,
  Video,
  PlayCircle,
  CalendarDays,
  TrendingUp,
  GraduationCap,
  Briefcase,
  FileBadge,
  FolderKanban,
  MessageSquare,
  Bell,
  CreditCard,
  ShoppingCart,
  DollarSign,
  Award,
  Gift,
  ShoppingBag,
  User,
  Settings,
  HelpCircle,
  LogOut,
  X,
} from "lucide-react";

const sections = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        path: "/student/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Learning",
    items: [
      {
        label: "My Courses",
        path: "/student/courses",
        icon: BookOpen,
      },
      {
        label: "Assignments",
        path: "/student/assignments",
        icon: ClipboardList,
      },
      {
        label: "Study Materials",
        path: "/student/study-materials",
        icon: FileText,
      },
      {
        label: "Live Classes",
        path: "/student/live-classes",
        icon: Video,
      },
      {
        label: "Recorded Classes",
        path: "/student/recorded-classes",
        icon: PlayCircle,
      },
      {
        label: "Calendar",
        path: "/student/calendar",
        icon: CalendarDays,
      },
      {
        label: "Progress",
        path: "/student/progress",
        icon: TrendingUp,
      },
      {
        label: "Grades",
        path: "/student/grades",
        icon: GraduationCap,
      },
      {
        label: "Attendance",
        path: "/student/attendance",
        icon: CalendarDays,
      },
    ],
  },
  {
    title: "Career",
    items: [
      {
        label: "Internship",
        path: "/student/internship",
        icon: Briefcase,
      },
      {
        label: "Job Board",
        path: "/student/job-board",
        icon: Briefcase,
      },
      {
        label: "Resume",
        path: "/student/resume",
        icon: FileBadge,
      },
      {
        label: "Portfolio",
        path: "/student/portfolio",
        icon: FolderKanban,
      },
    ],
  },
  {
    title: "Community",
    items: [
      {
        label: "Messages",
        path: "/student/messages",
        icon: MessageSquare,
      },
      {
        label: "Notifications",
        path: "/student/notifications",
        icon: Bell,
      },
    ],
  },
  {
    title: "Achievements",
    items: [
      {
        label: "Certificates",
        path: "/student/certificates",
        icon: Award,
      },
      {
        label: "Referral",
        path: "/student/referral",
        icon: Gift,
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        label: "Payments",
        path: "/student/payments",
        icon: CreditCard,
      },
      {
        label: "Orders",
        path: "/student/orders",
        icon: ShoppingCart,
      },
      {
        label: "Earnings",
        path: "/student/earnings",
        icon: DollarSign,
      },
      {
        label: "Marketplace",
        path: "/student/marketplace",
        icon: ShoppingBag,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        label: "Profile",
        path: "/student/profile",
        icon: User,
      },
      {
        label: "Settings",
        path: "/student/settings",
        icon: Settings,
      },
      {
        label: "Help",
        path: "/student/help",
        icon: HelpCircle,
      },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col",
          "border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] text-white",
          "transition-transform duration-300 lg:sticky lg:top-0 lg:z-30 lg:h-screen",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--sidebar-border)] px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
              <GraduationCap size={20} />
            </div>

            <div>
              <p className="text-sm font-bold">EduVerse</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted)]">
                Student Portal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {sections.map((section) => (
            <div key={section.title} className="mb-6">
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                {section.title}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        [
                          "flex items-center gap-3 rounded-xl px-3 py-2.5",
                          "text-sm font-medium transition-all",
                          isActive
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-400 hover:bg-slate-900 hover:text-white",
                        ].join(" ")
                      }
                    >
                      <Icon size={18} strokeWidth={1.9} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-[var(--sidebar-border)] p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}