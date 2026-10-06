import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Target,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const values = [
  {
    icon: Target,
    title: "Practical learning",
    text: "We focus on skills learners can actually use in projects, internships and professional environments.",
  },
  {
    icon: Brain,
    title: "Technology with purpose",
    text: "AI and modern technology are used to make learning more personalized and useful.",
  },
  {
    icon: Users,
    title: "Learn with people",
    text: "Students learn from instructors, mentors and peers instead of studying in isolation.",
  },
  {
    icon: Briefcase,
    title: "Career focused",
    text: "Learning should create progress beyond the classroom through projects and career preparation.",
  },
];

const stats = [
  ["10K+", "Students"],
  ["250+", "Courses"],
  ["100+", "Expert Teachers"],
  ["500+", "Projects"],
];

export default function About() {
  return (
    <main className="bg-[var(--background)] text-[var(--foreground)]">
      {/* Hero */}
      <section className="relative overflow-hidden px-5 pb-20 pt-28 sm:px-8 sm:pt-36 lg:pb-28">
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-2 text-sm font-medium text-indigo-300">
              About EduVerse AI
            </span>

            <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Education designed for the{" "}
              <span className="text-gradient">real world.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
              We are building a modern learning platform that connects
              education, technology, practical experience and career
              development.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-400">
              Our mission
            </p>

            <h2 className="text-3xl font-bold sm:text-5xl">
              Make useful education accessible to ambitious people.
            </h2>

            <p className="mt-6 leading-8 text-slate-400">
              Traditional education can make it difficult to connect theory
              with the skills companies actually need. EduVerse AI is designed
              around practical learning.
            </p>

            <p className="mt-4 leading-8 text-slate-400">
              Students can learn from experts, practice through assignments,
              build projects and prepare for professional opportunities.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-white/10 bg-white/[0.035] p-8"
          >
            <GraduationCap className="h-10 w-10 text-indigo-400" />

            <h3 className="mt-6 text-2xl font-bold">
              Learning should lead somewhere.
            </h3>

            <p className="mt-4 leading-7 text-slate-400">
              Every learning experience should help students become more
              capable, confident and prepared for their next opportunity.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Learn practical skills",
                "Practice through projects",
                "Build a professional portfolio",
                "Prepare for opportunities",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-400" />
                  <span className="text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/10 bg-white/[0.02] px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map(([number, label], index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-[var(--foreground)] sm:text-4xl">
                {number}
              </div>
              <div className="mt-2 text-sm text-slate-500">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-400">
              Our values
            </p>

            <h2 className="text-3xl font-bold sm:text-5xl">
              How we think about learning.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {values.map((value, index) => {
              const Icon = value.icon;

              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -5 }}
                  className="rounded-3xl border border-white/10 bg-white/[0.035] p-7"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10">
                    <Icon className="h-5 w-5 text-indigo-400" />
                  </div>

                  <h3 className="mt-6 text-xl font-semibold">
                    {value.title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-400">
                    {value.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/20 to-purple-600/10 p-8 text-center sm:p-14">
          <h2 className="text-3xl font-bold sm:text-5xl">
            Ready to start learning?
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-slate-400">
            Explore practical courses and find the learning path that fits
            your goals.
          </p>

          <Link
            to="/courses"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold text-white transition hover:bg-indigo-500"
          >
            Explore Courses
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}