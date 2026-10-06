import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Menu,
  X,
  Zap,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Admission", href: "/admission" },
{ label: "Internships", href: "/internships" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href) => {
    if (href === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(href);
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 0.65,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`fixed inset-x-0 top-0 z-[100] transition-all duration-500 ${
          scrolled
            ? "border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-2xl"
            : "bg-transparent"
        }`}
      >
        <nav
          aria-label="Main navigation"
          className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10"
        >
          <Link
            to="/"
            className="group flex items-center gap-3"
            aria-label="EduVerse AI home"
          >
            <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 shadow-lg shadow-blue-600/20">
              <Zap
                size={18}
                strokeWidth={2.5}
                className="relative z-10 text-white"
              />

              <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </span>

            <span className="text-[17px] font-semibold tracking-[-0.02em] text-white">
              EduVerse{" "}
              <span className="text-blue-400">AI</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navigation.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`relative rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                    active
                      ? "text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {item.label}

                  {active && (
                    <motion.span
                      layoutId="navbar-active"
                      className="absolute inset-x-3 -bottom-[1px] h-px bg-blue-400"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle compact />
            <Link
              to="/login"
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-blue-600/30"
            >
              Get Started

              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <div className="mr-1 md:hidden"><ThemeToggle compact /></div>

          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((value) => !value)}
            className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-white transition-colors hover:bg-white/[0.08] md:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-[var(--background)]/95 backdrop-blur-2xl md:hidden"
          >
            <motion.div
              initial={{ y: -15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex min-h-screen flex-col px-6 pb-8 pt-24"
            >
              <div className="flex flex-col">
                {navigation.map((item, index) => {
                  const active = isActive(item.href);

                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: index * 0.035,
                      }}
                    >
                      <Link
                        to={item.href}
                        className={`flex items-center justify-between border-b border-white/[0.07] py-4 text-lg font-medium ${
                          active
                            ? "text-white"
                            : "text-slate-400"
                        }`}
                      >
                        {item.label}

                        {active && (
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-auto space-y-3">
                <Link
                  to="/login"
                  className="flex h-12 items-center justify-center rounded-xl border border-white/10 text-sm font-semibold text-white"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="flex h-12 items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}