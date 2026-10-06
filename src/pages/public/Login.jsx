import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  Sparkles,
  Loader2,
  KeyRound,
  X,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

const features = [
  "Live classes with expert instructors",
  "Practical projects and assignments",
  "Career-focused learning paths",
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    signIn,
    user,
    role,
    dashboardPath,
    loading: authLoading,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");

  /*
   * ------------------------------------------------------------
   * FRIENDLY AUTH ERRORS
   * ------------------------------------------------------------
   */

  const friendlyAuthError = (message = "") => {
    const text = String(message).toLowerCase();

    if (
      text.includes("invalid login credentials") ||
      text.includes("invalid credentials") ||
      text.includes("invalid email or password")
    ) {
      return "Invalid email or password. Please check your details and try again.";
    }

    if (text.includes("email not confirmed")) {
      return "Please confirm your email address before signing in.";
    }

    if (text.includes("rate limit")) {
      return "Too many attempts. Please wait a few minutes and try again.";
    }

    if (
      text.includes("network") ||
      text.includes("fetch")
    ) {
      return "We couldn't connect to the server. Please check your internet connection.";
    }

    return "We couldn't sign you in. Please check your details and try again.";
  };

  /*
   * ------------------------------------------------------------
   * ROLE BASED REDIRECT
   * ------------------------------------------------------------
   *
   * IMPORTANT:
   *
   * Login does NOT decide whether the user is a student,
   * teacher, manager or admin.
   *
   * AuthContext decides that.
   *
   * Example:
   *
   * Student -> /student/dashboard
   * Teacher -> /teacher/dashboard
   * Manager -> /manager/dashboard
   * Admin   -> /admin/dashboard
   */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      return;
    }

    if (!role) {
      setSuccess("Signed in successfully. Loading your account...");
      return;
    }

    if (!dashboardPath) {
      console.error("LOGIN: dashboard path missing", {
        userId: user.id,
        email: user.email,
        role,
        dashboardPath,
      });

      setError(
        `Your role "${role}" does not have a dashboard configured.`
      );

      return;
    }

    /*
     * If already on the correct dashboard,
     * do nothing.
     */
    if (location.pathname === dashboardPath) {
      return;
    }

    setSuccess(`Signed in as ${role}. Redirecting...`);

    /*
     * Small delay gives AuthContext state time to settle
     * and prevents navigation racing with auth initialization.
     */
    const timer = setTimeout(() => {
      navigate(dashboardPath, {
        replace: true,
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [
    authLoading,
    user,
    role,
    dashboardPath,
    location.pathname,
    navigate,
  ]);

  /*
   * ------------------------------------------------------------
   * LOGIN
   * ------------------------------------------------------------
   */

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {

      const data = await signIn(cleanEmail, password);

      if (!data?.user || !data?.session) {
        setError(
          "Your account could not be signed in. Please try again."
        );
        return;
      }

      const pendingCourseId = localStorage.getItem("edu_pending_course_id");
      if (pendingCourseId) {
        const { error: admissionError } = await supabase.rpc("request_course_admission", { p_course_id: pendingCourseId });
        if (!admissionError || String(admissionError.message || "").toLowerCase().includes("already")) {
          localStorage.removeItem("edu_pending_course_id");
        } else {
          console.error("Pending course admission error:", admissionError);
        }
      }

      /*
       * DO NOT NAVIGATE HERE.
       *
       * AuthContext now loads:
       *
       * user
       * ↓
       * profile
       * ↓
       * user_roles
       * ↓
       * roles
       * ↓
       * role
       *
       * The useEffect above redirects after role is available.
       */

      setSuccess(
        "Signed in successfully. Checking your account..."
      );
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      setError(
        friendlyAuthError(err?.message)
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ------------------------------------------------------------
   * FORGOT PASSWORD
   * ------------------------------------------------------------
   */

  const handleForgotPassword = async (event) => {
    event.preventDefault();

    setForgotError("");
    setForgotMessage("");

    const cleanEmail = forgotEmail.trim();

    if (!cleanEmail) {
      setForgotError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setForgotError("Please enter a valid email address.");
      return;
    }

    setForgotLoading(true);

    try {
      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(
          cleanEmail,
          {
            redirectTo: `${window.location.origin}/login`,
          }
        );

      if (resetError) {
        const message =
          String(resetError.message).toLowerCase();

        if (message.includes("rate limit")) {
          setForgotError(
            "Too many requests. Please wait a few minutes and try again."
          );
        } else {
          setForgotError(
            "We couldn't send the reset email. Please try again."
          );
        }

        return;
      }

      setForgotMessage(
        "Password reset instructions have been sent to your email."
      );
    } catch (err) {
      console.error("PASSWORD RESET ERROR:", err);

      setForgotError(
        "Something went wrong. Please try again."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  /*
   * ------------------------------------------------------------
   * UI
   * ------------------------------------------------------------
   */

  const isBusy = loading || authLoading;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* =====================================================
            LEFT SIDE
        ====================================================== */}

        <section className="relative hidden overflow-hidden bg-[var(--sidebar)] lg:flex">
          <div className="absolute inset-0">
            <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

            <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
          </div>

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-16">

            <Link
              to="/"
              className="inline-flex w-fit items-center gap-3 text-white"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                <Sparkles size={19} />
              </span>

              <span className="text-lg font-bold">
                EduVerse{" "}
                <span className="text-blue-400">
                  AI
                </span>
              </span>
            </Link>

            <div className="relative mx-auto w-full max-w-xl">

              <motion.div
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.7,
                }}
              >

                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  Your learning journey continues here
                </div>

                <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-white xl:text-6xl">
                  Learn today.
                  <br />

                  <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                    Lead tomorrow.
                  </span>
                </h1>

                <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
                  Access your courses, live classes,
                  assignments, progress and career
                  opportunities from one powerful
                  learning platform.
                </p>

                <div className="mt-8 space-y-4">
                  {features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 text-sm text-slate-300"
                    >
                      <CheckCircle2
                        size={18}
                        className="shrink-0 text-blue-400"
                      />

                      {feature}
                    </div>
                  ))}
                </div>

              </motion.div>

              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 1, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -right-4 -top-20 hidden rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-2xl backdrop-blur-xl xl:block"
              >
                <GraduationCap
                  size={30}
                  className="text-blue-400"
                />
              </motion.div>

              <motion.div
                animate={{
                  y: [0, 10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-20 right-10 hidden rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-2xl backdrop-blur-xl xl:block"
              >
                <BookOpen
                  size={28}
                  className="text-violet-400"
                />
              </motion.div>

            </div>

            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} EduVerse AI.
              Learn. Build. Grow.
            </p>

          </div>
        </section>

        {/* =====================================================
            RIGHT SIDE
        ====================================================== */}

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.55,
            }}
            className="w-full max-w-md"
          >

            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              Back to website
            </Link>

            {/* Mobile logo */}

            <div className="mb-8 lg:hidden">
              <div className="mb-4 flex items-center gap-3">

                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-[var(--foreground)]">
                  <Sparkles size={19} />
                </span>

                <span className="text-lg font-bold">
                  EduVerse{" "}
                  <span className="text-blue-600">
                    AI
                  </span>
                </span>

              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">

              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in to continue your learning journey.
                </p>
              </div>

              <AnimatePresence mode="wait">

                {error && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                    }}
                    role="alert"
                    className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                    <X
                      size={18}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                    }}
                    role="status"
                    className="mb-5 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
                  >
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{success}</span>
                  </motion.div>
                )}

              </AnimatePresence>

              {/* FORM */}

              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >

                {/* EMAIL */}

                <div>
                  <label
                    htmlFor="login-email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Email address
                  </label>

                  <div className="relative">

                    <Mail
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="you@example.com"
                      disabled={isBusy}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                    />

                  </div>
                </div>

                {/* PASSWORD */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="login-password"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setForgotOpen(true);
                        setForgotEmail(email);
                        setForgotError("");
                        setForgotMessage("");
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Forgot password?
                    </button>

                  </div>

                  <div className="relative">

                    <Lock
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="login-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Enter your password"
                      disabled={isBusy}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      onClick={() =>
                        setShowPassword(
                          (value) => !value
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>

                {/* REMEMBER */}

                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-500">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(
                        event.target.checked
                      )
                    }
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  Remember me

                </label>

                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  disabled={isBusy}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {isBusy ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      {authLoading
                        ? "Checking account..."
                        : "Signing in..."}
                    </>
                  ) : (
                    <>
                      Sign In

                      <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}

                </button>

              </form>

              <p className="mt-7 text-center text-sm text-slate-500">
                Don't have an account?{" "}

                <Link
                  to="/register"
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  Create an account
                </Link>
              </p>

            </div>

          </motion.div>

        </section>
      </div>

      {/* =======================================================
          FORGOT PASSWORD MODAL
      ======================================================== */}

      <AnimatePresence>

        {forgotOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/50 p-5 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget
              ) {
                setForgotOpen(false);
              }
            }}
          >

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 10,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 10,
              }}
              className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl"
            >

              <div className="mb-6 flex items-start justify-between">

                <div>

                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <KeyRound size={21} />
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900">
                    Reset your password
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Enter your email and we'll send you a secure
                    password reset link.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setForgotOpen(false)
                  }
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close"
                >
                  <X size={19} />
                </button>

              </div>

              {forgotError && (
                <div
                  role="alert"
                  className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {forgotError}
                </div>
              )}

              {forgotMessage && (
                <div
                  role="status"
                  className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
                >
                  {forgotMessage}
                </div>
              )}

              <form
                onSubmit={handleForgotPassword}
                className="space-y-4"
              >

                <div>

                  <label
                    htmlFor="forgot-email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Email address
                  </label>

                  <input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(event) =>
                      setForgotEmail(
                        event.target.value
                      )
                    }
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >

                  {forgotLoading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}

                </button>

              </form>

            </motion.div>

          </motion.div>
        )}

      </AnimatePresence>
    </main>
  );
}