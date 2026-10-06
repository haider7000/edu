import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  ArrowRight,
  Play,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import Hero3D from "./Hero3D";

const stats = [
  {
    value: "10K+",
    label: "Learners",
  },
  {
    value: "250+",
    label: "Courses",
  },
  {
    value: "95%",
    label: "Success Rate",
  },
];

function AnimatedNumber({ target, suffix = "" }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const numericTarget = Number(target);

    if (!Number.isFinite(numericTarget)) {
      setValue(target);
      return;
    }

    let startTime;
    const duration = 1200;

    const animate = (time) => {
      if (!startTime) {
        startTime = time;
      }

      const progress = Math.min(
        (time - startTime) / duration,
        1
      );

      const eased =
        1 - Math.pow(1 - progress, 3);

      setValue(
        Math.round(numericTarget * eased)
      );

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [target]);

  return (
    <>
      {value}
      {suffix}
    </>
  );
}

export default function Hero() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, {
    stiffness: 80,
    damping: 20,
  });

  const smoothY = useSpring(mouseY, {
    stiffness: 80,
    damping: 20,
  });

  const handleMouseMove = (event) => {
    if (window.innerWidth < 1024) {
      return;
    }

    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      (event.clientX - rect.left) /
        rect.width -
      0.5;

    const y =
      (event.clientY - rect.top) /
        rect.height -
      0.5;

    mouseX.set(x * 12);
    mouseY.set(y * 12);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      className="relative min-h-[720px] overflow-hidden border-b border-white/[0.06] pt-28 sm:pt-32 lg:min-h-[820px] lg:pt-36"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="pointer-events-none absolute inset-0 bg-hero-grid bg-[size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />

      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/[0.09] blur-[130px]" />

      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-violet-600/[0.07] blur-[100px]" />

      <div className="section-shell relative z-10">
        <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative z-20"
          >
            <div className="eyebrow">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
              </span>

              AI-Powered Learning Platform
            </div>

            <h1 className="max-w-4xl font-display text-[3rem] font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-[4.4rem] lg:text-[5.2rem]">
              Learn Skills.
              <br />
              Build Your{" "}
              <span className="text-gradient">
                Future.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
              Master practical skills with expert
              instructors, AI-powered learning,
              live classes, real-world projects,
              internships, and professional
              certificates.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/courses"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-xl shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-blue-600/30"
              >
                Start Learning

                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/courses"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.025] px-6 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.07]"
              >
                <Play
                  size={15}
                  fill="currentColor"
                />

                Explore Courses
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-2 text-sm text-slate-500">
              <Users size={16} />

              <span>
                Join thousands of learners
                building their future.
              </span>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 border-t border-white/[0.08] pt-7">
              {stats.map((stat, index) => {
                const numeric =
                  stat.value === "10K+"
                    ? 10
                    : stat.value === "250+"
                      ? 250
                      : 95;

                const suffix =
                  stat.value === "95%"
                    ? "%"
                    : "K+";

                return (
                  <div
                    key={stat.label}
                    className={`${
                      index !== 0
                        ? "border-l border-white/[0.08] pl-5 sm:pl-7"
                        : ""
                    }`}
                  >
                    <div className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                      <AnimatedNumber
                        target={numeric}
                        suffix={suffix}
                      />
                    </div>

                    <div className="mt-1 text-xs text-slate-500 sm:text-sm">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            style={{
              x: smoothX,
              y: smoothY,
            }}
            initial={{
              opacity: 0,
              scale: 0.94,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 1,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative min-h-[420px] lg:min-h-[600px]"
          >
            <Hero3D />

            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute left-0 top-10 hidden rounded-2xl border border-white/10 bg-[var(--surface)]/80 p-4 shadow-2xl backdrop-blur-xl sm:block"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <Sparkles size={17} />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    AI Learning
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-white">
                    Personalized for you
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{
                y: [0, 10, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-14 right-0 hidden rounded-2xl border border-white/10 bg-[var(--surface)]/80 p-4 shadow-2xl backdrop-blur-xl sm:block"
            >
              <p className="text-xs text-slate-500">
                Learning progress
              </p>

              <div className="mt-2 flex items-center gap-3">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
                </div>

                <span className="text-sm font-semibold text-white">
                  82%
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-1/2 h-px w-full max-w-6xl -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}