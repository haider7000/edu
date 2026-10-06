import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  Loader2,
  X,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

const journey = [
  "Discover",
  "Learn",
  "Practice",
  "Build",
  "Grow",
];

function getPasswordStrength(password) {
  if (!password) {
    return {
      label: "",
      score: 0,
    };
  }

  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) {
    return {
      label: "Weak",
      score,
    };
  }

  if (score <= 3) {
    return {
      label: "Medium",
      score,
    };
  }

  return {
    label: "Strong",
    score,
  };
}

export default function Register() {
  const [searchParams] = useSearchParams();
  const selectedCourseId = searchParams.get("course");

  useEffect(() => {
    if (selectedCourseId) localStorage.setItem("edu_pending_course_id", selectedCourseId);
  }, [selectedCourseId]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordStrength = useMemo(
    () => getPasswordStrength(password),
    [password]
  );

  const friendlyRegisterError = (message = "") => {
    const text = message.toLowerCase();

    if (
      text.includes("already registered") ||
      text.includes("already exists") ||
      text.includes("user already registered")
    ) {
      return "An account with this email already exists. Try signing in instead.";
    }

    if (text.includes("invalid email")) {
      return "Please enter a valid email address.";
    }

    if (
      text.includes("password") &&
      (text.includes("weak") ||
        text.includes("characters") ||
        text.includes("at least"))
    ) {
      return "Your password must contain at least 8 characters.";
    }

    if (text.includes("rate limit")) {
      return "Too many registration attempts. Please wait a few minutes and try again.";
    }

    if (text.includes("network")) {
      return "We couldn't connect to the server. Please check your internet connection.";
    }

    return "We couldn't create your account. Please check your details and try again.";
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    setError("");

    const cleanName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      /*
       * IMPORTANT:
       * Role is intentionally NOT selectable by the user.
       *
       * The public registration flow only sends the user's name.
       * Your existing Supabase/profile/role system can assign the
       * default Student role through its existing logic.
       */

      const { data, error: authError } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
              ...(cleanPhone
                ? {
                    phone: cleanPhone,
                  }
                : {}),
            },
          },
        });

      if (authError) {
        setError(
          friendlyRegisterError(authError.message)
        );
        return;
      }

      if (!data?.user) {
        setError(
          "We couldn't complete your registration. Please try again."
        );
        return;
      }

      if (data.session && selectedCourseId) {
        const { error: admissionError } = await supabase.rpc("request_course_admission", { p_course_id: selectedCourseId });
        if (!admissionError) localStorage.removeItem("edu_pending_course_id");
      }

      /*
       * We don't automatically redirect to the dashboard.
       * Supabase may require email confirmation.
       */

      setSuccess(true);
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        "Something went wrong while creating your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50 sm:p-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.15,
                type: "spring",
                stiffness: 180,
              }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"
            >
              <CheckCircle2 size={32} />
            </motion.div>

            <h1 className="mt-7 text-3xl font-bold tracking-tight">
              Check your email
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
              We've sent a confirmation link to{" "}
              <strong className="text-slate-700">
                {email}
              </strong>
              . Confirm your email address to activate your
              account.
            </p>

            <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-left">
              <div className="flex gap-3">
                <Mail className="mt-0.5 shrink-0 text-blue-600" size={20} />

                <div>
                  <p className="font-semibold text-blue-900">
                    One more step
                  </p>
                  <p className="mt-1 text-sm leading-6 text-blue-700">
                    Open the confirmation email and click the
                    verification link. After confirmation, you
                    can sign in normally.
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/login"
              className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Back to Login
              <ArrowRight size={17} />
            </Link>

            <div className="mt-5">
              <Link
                to="/"
                className="text-sm font-medium text-slate-500 hover:text-slate-900"
              >
                Back to website
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* LEFT */}
        <section className="relative hidden overflow-hidden bg-[var(--sidebar)] lg:flex">
          <div className="absolute inset-0">
            <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
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
                <span className="text-blue-400">AI</span>
              </span>
            </Link>

            <div className="mx-auto w-full max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-slate-300">
                  <Sparkles size={15} className="text-blue-400" />
                  Build skills that create opportunities
                </div>

                <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-white xl:text-6xl">
                  Start building
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                    your future.
                  </span>
                </h1>

                <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
                  Join a growing community of learners developing
                  real-world skills with expert instructors,
                  practical projects and career-focused learning.
                </p>

                <div className="mt-10">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Your learning journey
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {journey.map((item, index) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-slate-300"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/20 text-xs font-bold text-blue-400">
                          {index + 1}
                        </span>

                        {item}
                      </div>
                    ))}
                  </div>
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
                className="absolute bottom-24 right-20 hidden rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl xl:block"
              >
                <GraduationCap
                  size={34}
                  className="text-blue-400"
                />
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute right-72 top-32 hidden rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl xl:block"
              >
                <BookOpen
                  size={27}
                  className="text-violet-400"
                />
              </motion.div>
            </div>

            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} EduVerse AI
            </p>
          </div>
        </section>

        {/* RIGHT */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="w-full max-w-md"
          >
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              Back to website
            </Link>

            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-[var(--foreground)]">
                  <Sparkles size={19} />
                </span>

                <span className="text-lg font-bold">
                  EduVerse{" "}
                  <span className="text-blue-600">AI</span>
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
              <div className="mb-7">
                <h2 className="text-3xl font-bold tracking-tight">
                  Create your account
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Start your learning journey today.
                </p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    role="alert"
                    className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                    <X size={18} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form
                onSubmit={handleRegister}
                noValidate
                className="space-y-4"
              >
                {/* NAME */}
                <div>
                  <label
                    htmlFor="register-name"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Full name
                  </label>

                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="register-name"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(event) =>
                        setFullName(event.target.value)
                      }
                      placeholder="Your full name"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="register-email"
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
                      id="register-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="you@example.com"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                {/* PHONE */}
                <div>
                  <label
                    htmlFor="register-phone"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Phone{" "}
                    <span className="font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>

                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="register-phone"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(event) =>
                        setPhone(event.target.value)
                      }
                      placeholder="+92 300 1234567"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <label
                    htmlFor="register-password"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="At least 8 characters"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((value) => !value)
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3"
                    >
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          Password strength
                        </span>

                        <span
                          className={
                            passwordStrength.label === "Strong"
                              ? "font-semibold text-emerald-600"
                              : passwordStrength.label ===
                                "Medium"
                              ? "font-semibold text-amber-600"
                              : "font-semibold text-red-600"
                          }
                        >
                          {passwordStrength.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 rounded-full transition-colors ${
                              level <= passwordStrength.score
                                ? passwordStrength.label ===
                                  "Strong"
                                  ? "bg-emerald-500"
                                  : passwordStrength.label ===
                                    "Medium"
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                                : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label
                    htmlFor="register-confirm-password"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Confirm password
                  </label>

                  <div className="relative">
                    <ShieldCheck
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="register-confirm-password"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      placeholder="Repeat your password"
                      className={`h-12 w-full rounded-xl border bg-white pl-11 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                        confirmPassword &&
                        confirmPassword !== password
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (value) => !value
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirmation password"
                          : "Show confirmation password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {confirmPassword &&
                    confirmPassword === password && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                        <Check size={14} />
                        Passwords match
                      </p>
                    )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                  <div className="flex gap-2">
                    <ShieldCheck
                      size={16}
                      className="mt-0.5 shrink-0 text-blue-600"
                    />
                    <span>
                      Your account will be created as a standard
                      student account. Administrator and staff
                      roles cannot be selected during public
                      registration.
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-7 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Lock size={13} />
              Secure authentication powered by Supabase
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}