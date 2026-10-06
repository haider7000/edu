import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  Cloud,
  Code2,
  Languages,
  Palette,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  {
    title: "Web Development",
    description:
      "Build modern websites, applications, and scalable digital products.",
    courses: "42 courses",
    icon: Code2,
  },
  {
    title: "AI & Machine Learning",
    description:
      "Learn data, automation, machine learning, and practical AI workflows.",
    courses: "28 courses",
    icon: Sparkles,
  },
  {
    title: "Digital Marketing",
    description:
      "Master content, SEO, analytics, paid campaigns, and growth strategy.",
    courses: "31 courses",
    icon: BarChart3,
  },
  {
    title: "UI/UX Design",
    description:
      "Create thoughtful interfaces, prototypes, systems, and experiences.",
    courses: "24 courses",
    icon: Palette,
  },
  {
    title: "Business",
    description:
      "Develop practical skills for entrepreneurship, management, and growth.",
    courses: "36 courses",
    icon: BriefcaseBusiness,
  },
  {
    title: "Cyber Security",
    description:
      "Understand security fundamentals, networks, threats, and protection.",
    courses: "21 courses",
    icon: ShieldCheck,
  },
  {
    title: "Cloud Computing",
    description:
      "Work with cloud infrastructure, deployment, architecture, and DevOps.",
    courses: "19 courses",
    icon: Cloud,
  },
  {
    title: "English & Communication",
    description:
      "Improve professional communication, confidence, interviews, and writing.",
    courses: "17 courses",
    icon: Languages,
  },
];

export default function Categories() {
  return (
    <section className="section-space relative overflow-hidden bg-[var(--surface)]">
      <div className="pointer-events-none absolute right-0 top-20 h-72 w-72 rounded-full bg-blue-600/[0.06] blur-[100px]" />

      <div className="section-shell">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <span className="eyebrow">
              Explore learning
            </span>

            <h2 className="section-title max-w-3xl">
              Learn skills that move your career forward.
            </h2>

            <p className="section-description">
              Focus on practical knowledge that helps
              you build, create, communicate, and grow
              in the real world.
            </p>
          </div>

          <Link
            to="/courses"
            className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-blue-400 transition-colors hover:text-blue-300"
          >
            Browse all courses

            <ArrowUpRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.07] sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => {
            const Icon = category.icon;

            return (
              <motion.div
                key={category.title}
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.04,
                }}
                className="group relative bg-[var(--surface)] p-6 transition-colors duration-300 hover:bg-[var(--surface-hover)] sm:p-7"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-blue-400 transition-all duration-300 group-hover:border-blue-400/20 group-hover:bg-blue-500/10">
                    <Icon size={20} />
                  </div>

                  <ArrowUpRight
                    size={17}
                    className="text-slate-700 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-400"
                  />
                </div>

                <h3 className="mt-7 text-base font-semibold tracking-tight text-white">
                  {category.title}
                </h3>

                <p className="mt-2 min-h-[66px] text-sm leading-6 text-slate-500">
                  {category.description}
                </p>

                <div className="mt-6 text-xs font-medium text-slate-600">
                  {category.courses}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}