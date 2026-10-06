import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-[var(--background)] px-5 py-24 sm:px-8 sm:py-32">
      <div className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] px-6 py-14 text-center shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:px-12 sm:py-20"
      >
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/15">
          <Sparkles className="h-6 w-6 text-indigo-400" />
        </div>

        <h2 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Your next opportunity starts with what you{" "}
          <span className="text-gradient">learn today.</span>
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
          Build practical skills, work on meaningful projects and take the
          next step toward the career you want.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/courses"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Start Learning
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            to="/courses"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Explore Courses
          </Link>
        </div>
      </motion.div>
    </section>
  );
}