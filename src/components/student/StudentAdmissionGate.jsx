import { useCallback, useEffect, useState } from "react";
import { Navigate, Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Compass,
  HelpCircle,
  LogOut,
  Mail,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { getMyAdmissionState } from "../../services/studentService";

export default function StudentAdmissionGate({ children }) {
  const { user, profile } = useAuth();
  const location = useLocation();
  const [state, setState] = useState({ loading: true, kind: "loading", admission: null });

  const load = useCallback(async () => {
    if (!user?.id) return;
    setState((current) => ({ ...current, loading: true }));
    try {
      const next = await getMyAdmissionState();
      setState({ ...next, loading: false });
    } catch (error) {
      console.error("Admission gate error:", error);
      setState({ loading: false, kind: "error", error });
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (state.loading) {
    return (
      <PublicAccountShell profile={profile} user={user}>
        <div className="flex min-h-[55vh] items-center justify-center">
          <div className="text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
            <p className="mt-4 text-sm text-slate-500">Preparing your account…</p>
          </div>
        </div>
      </PublicAccountShell>
    );
  }

  if (state.kind === "approved") return children;

  // A student without an approved enrollment may keep using the public/account
  // experience, but cannot open private academic routes by typing their URLs.
  if (location.pathname !== "/student/dashboard") {
    return <Navigate to="/student/dashboard" replace />;
  }

  if (state.kind === "pending" || state.kind === "interview") {
    return (
      <PendingStudentPortal
        profile={profile}
        user={user}
        admission={state.admission}
        onRefresh={load}
      />
    );
  }

  if (state.kind === "rejected") {
    return (
      <PublicAccountShell profile={profile} user={user}>
        <section className="mx-auto max-w-4xl py-8 sm:py-12">
          <div className="rounded-3xl border border-red-100 bg-white p-7 shadow-sm sm:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <BookOpen size={24} />
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[.18em] text-red-600">Application update</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Choose another course</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Your previous admission request was not approved. Your account is still active and you can continue browsing the academy and apply for another published course.
            </p>
            <Link to="/courses" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
              <Compass size={17} /> Explore Courses
            </Link>
          </div>
        </section>
      </PublicAccountShell>
    );
  }

  if (state.kind === "error") {
    return (
      <PublicAccountShell profile={profile} user={user}>
        <section className="mx-auto max-w-3xl py-12 text-center">
          <h1 className="text-2xl font-bold text-slate-900">We couldn't load your application</h1>
          <p className="mt-3 text-sm text-slate-500">{state.error?.message || "Please try again."}</p>
          <button onClick={load} className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white">Try again</button>
        </section>
      </PublicAccountShell>
    );
  }

  return <NoCoursePortal profile={profile} user={user} />;
}

function PendingStudentPortal({ profile, user, admission, onRefresh }) {
  const firstName = getDisplayName(profile, user).split(" ")[0];
  const courseName = admission?.course_name || "Selected course";
  const submitted = formatDate(admission?.created_at);

  return (
    <PublicAccountShell profile={profile} user={user}>
      <div className="space-y-6 py-5 sm:py-8">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1.4fr_.6fr]">
            <div className="p-6 sm:p-9">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                <Clock3 size={14} /> Application under review
              </div>
              <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Welcome, {firstName}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                We received your application for <strong className="text-slate-900">{courseName}</strong>. You can manage your account and explore public academy information while an Admin or Manager reviews your admission.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/courses" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
                  <Compass size={17} /> Explore Courses
                </Link>
                <button onClick={onRefresh} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <RefreshCw size={16} /> Refresh Status
                </button>
              </div>
            </div>
            <div className="border-t border-slate-100 bg-slate-50 p-6 sm:p-9 lg:border-l lg:border-t-0">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-slate-500">Admission status</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"><Clock3 size={21} /></div>
                <div><p className="font-bold text-slate-900">Pending Review</p><p className="text-xs text-slate-500">No action required right now</p></div>
              </div>
              <dl className="mt-7 space-y-4 text-sm">
                <InfoRow label="Course" value={courseName} />
                <InfoRow label="Submitted" value={submitted} />
                <InfoRow label="Account" value={user?.email || profile?.email || "Active"} />
              </dl>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <ProgressStep done number="1" title="Account Created" text="Your student account is active." />
          <ProgressStep done number="2" title="Course Selected" text={courseName} />
          <ProgressStep active number="3" title="Admission Review" text="Admin or Manager review." />
          <ProgressStep number="4" title="Course Access" text="Unlocks automatically." />
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <AccountCard icon={UserRound} title="My Account" description="Your personal account information.">
            <div className="mt-5 space-y-3 text-sm">
              <InfoRow label="Name" value={getDisplayName(profile, user)} />
              <InfoRow label="Email" value={user?.email || profile?.email || "—"} />
              {profile?.phone ? <InfoRow label="Phone" value={profile.phone} /> : null}
            </div>
          </AccountCard>

          <AccountCard icon={BookOpen} title="Selected Course" description="Public information about your application.">
            <p className="mt-5 font-semibold text-slate-900">{courseName}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">Lessons, assignments, live classes and private learning materials become available after approval.</p>
            <Link to="/courses" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700">View public courses <ArrowRight size={15} /></Link>
          </AccountCard>

          <AccountCard icon={HelpCircle} title="Need Help?" description="You can still use the public academy website.">
            <p className="mt-5 text-sm leading-6 text-slate-500">Browse course information or contact the academy if you need help with your application.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/courses" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Courses</Link>
              <Link to="/contact" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Contact</Link>
            </div>
          </AccountCard>
        </section>

        <section className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 shrink-0 text-emerald-700" size={21} />
            <div>
              <h2 className="font-bold text-emerald-950">Your account stays useful while you wait</h2>
              <p className="mt-1 text-sm leading-6 text-emerald-800/80">Public course pages and your own account/application information remain available. Private student data, lessons, assignments, classroom access, progress and certificates stay protected until admission is approved.</p>
            </div>
          </div>
        </section>
      </div>
    </PublicAccountShell>
  );
}

function NoCoursePortal({ profile, user }) {
  const firstName = getDisplayName(profile, user).split(" ")[0];
  return (
    <PublicAccountShell profile={profile} user={user}>
      <section className="mx-auto max-w-5xl py-8 sm:py-14">
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><BookOpen size={24} /></div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[.18em] text-indigo-600">Student account ready</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Welcome, {firstName}. Pick a course to start.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">Your account is active. Explore the academy's published courses and choose the program you want to join. Your admission review starts only after you enroll in a course.</p>
          <Link to="/courses" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"><Compass size={17} /> Explore Courses</Link>
        </div>
      </section>
    </PublicAccountShell>
  );
}

function PublicAccountShell({ profile, user, children }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-bold text-slate-950">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white"><BookOpen size={18} /></div>
            <span className="hidden sm:inline">Student Account</span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link to="/" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950">Home</Link>
            <Link to="/courses" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950">Courses</Link>
            <Link to="/contact" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950 sm:block">Contact</Link>
            <button onClick={handleLogout} className="ml-1 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><LogOut size={15} /><span className="hidden sm:inline">Logout</span></button>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">{children}</main>
      <footer className="mt-8 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>Signed in as {getDisplayName(profile, user)}</span>
          <span className="inline-flex items-center gap-1.5"><Mail size={13} /> {user?.email || profile?.email || "Student account"}</span>
        </div>
      </footer>
    </div>
  );
}

function ProgressStep({ done = false, active = false, number, title, text }) {
  return (
    <div className={`rounded-2xl border p-5 ${active ? "border-amber-200 bg-amber-50" : done ? "border-emerald-100 bg-white" : "border-slate-200 bg-white"}`}>
      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-emerald-100 text-emerald-700" : active ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
        {done ? <CheckCircle2 size={17} /> : number}
      </div>
      <h3 className="mt-4 text-sm font-bold text-slate-900">{title}</h3>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{text}</p>
    </div>
  );
}

function AccountCard({ icon: Icon, title, description, children }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><Icon size={19} /></div>
      <h2 className="mt-4 font-bold text-slate-950">{title}</h2>
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      {children}
    </article>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="max-w-[65%] text-right font-medium text-slate-900">{value || "—"}</dd>
    </div>
  );
}

function getDisplayName(profile, user) {
  return profile?.full_name || profile?.name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";
}

function formatDate(value) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
