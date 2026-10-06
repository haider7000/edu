import {
  Menu,
  Search,
  Bell,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

export default function Topbar({ onMenuClick }) {
  const { user, profile, role } = useAuth();

  const fullName =
    profile?.full_name ||
    profile?.name ||
    user?.user_metadata?.full_name ||
    "Student";

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--card)]/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl p-2 text-[var(--muted)] hover:bg-[var(--surface-hover)] lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={21} />
        </button>

        <div className="relative hidden sm:block">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            placeholder="Search your learning..."
            className="h-10 w-64 rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-9 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-[var(--card)] focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        <div className="sm:hidden">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Student Portal
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle compact />
        <button
          type="button"
          className="relative rounded-xl p-2.5 text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
          aria-label="Messages"
        >
          <MessageSquare size={19} />
        </button>

        <button
          type="button"
          className="relative rounded-xl p-2.5 text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
          aria-label="Notifications"
        >
          <Bell size={19} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </button>

        <div className="hidden h-7 w-px bg-slate-200 sm:block" />

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            {initials || "ST"}
          </div>

          <div className="hidden leading-tight sm:block">
            <p className="max-w-[140px] truncate text-sm font-semibold text-[var(--foreground)]">
              {fullName}
            </p>

            <p className="text-[11px] font-medium text-[var(--muted)]">
              {role || "Student"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}