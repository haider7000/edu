import { motion } from "framer-motion";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  FolderKanban,
  GraduationCap,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  {
    icon: FolderKanban,
    title: "Real projects",
    description: "Work on practical tasks that turn learning into portfolio evidence.",
  },
  {
    icon: Users,
    title: "Mentorship",
    description: "Learn how experienced professionals approach problems and decisions.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Experience",
    description: "Build familiarity with professional workflows and expectations.",
  },
  {
    icon: GraduationCap,
    title: "Career-ready skills",
    description: "Develop the confidence to apply your skills beyond the classroom.",
  },
  {
    icon: CheckCircle2,
    title: "Completion certificate",
    description: "Document your internship journey and the work you completed.",
  },
];

export default function InternshipSection() {
  return (
    <section
      id="internships"
      className="relative overflow-hidden bg-slate-950 py-24 text-white sm:py-28 lg:py-32"
    >
      <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">
              Career experience
            </span>

            <h2 className="max-w-xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Don't just learn it.{" "}
              <span className="text-blue-400">Build it.</span>
            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
              Learning becomes more valuable when you have something real to
              show for it. Our internship experience is designed to help
              learners apply their skills in practical environments.
            </p>

            <div className="mt-9 grid gap-5 sm:grid-cols-2">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;

                return (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.06,
                    }}
                    className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.05]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="mt-4 font-semibold text-white">
                      {benefit.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {benefit.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            <Link
              to="/admission"
              className="mt-9 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Explore Internships
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Internship progress
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Frontend Development Track
                  </p>
                </div>

                <span className="rounded-full bg-green-400/10 px-3 py-1 text-xs font-medium text-green-400">
                  In progress
                </span>
              </div>

              <div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-white">72%</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Overall completion
                    </p>
                  </div>

                  <p className="text-xs text-slate-500">18 / 25 tasks</p>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "72%" }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 1.2,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="h-full rounded-full bg-blue-500"
                  />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-2xl font-bold text-white">04</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Projects completed
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-2xl font-bold text-white">12</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Mentor sessions
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-2xl font-bold text-white">08</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Portfolio pieces
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-2xl font-bold text-white">01</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Final review
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-start gap-4 rounded-2xl border border-blue-400/10 bg-blue-400/5 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                  <Users className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-medium leading-6 text-slate-300">
                    "The best part was being able to turn the concepts from my
                    course into something I could actually demonstrate."
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    — Internship participant
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}