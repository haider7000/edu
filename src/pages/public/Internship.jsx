import { motion } from "framer-motion";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  FileBadge2,
  FolderKanban,
  GraduationCap,
  Laptop,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  {
    icon: FolderKanban,
    title: "Real Projects",
    text: "Work on practical projects that help you build evidence of your skills.",
  },
  {
    icon: Users,
    title: "Expert Mentorship",
    text: "Learn from experienced professionals and receive structured guidance.",
  },
  {
    icon: Laptop,
    title: "Remote Experience",
    text: "Build professional experience through flexible, project-based learning.",
  },
  {
    icon: FileBadge2,
    title: "Portfolio Building",
    text: "Turn your internship work into projects you can showcase to employers.",
  },
  {
    icon: GraduationCap,
    title: "Completion Certificate",
    text: "Receive a certificate after successfully completing your internship.",
  },
];

const tracks = [
  {
    title: "Web Development",
    description:
      "Build modern websites and applications using professional development workflows.",
    icon: Code2,
  },
  {
    title: "AI & Machine Learning",
    description:
      "Explore practical AI projects and learn how machine learning is applied in real products.",
    icon: Laptop,
  },
  {
    title: "Digital Marketing",
    description:
      "Work on campaigns, content strategy, analytics, and digital growth projects.",
    icon: BriefcaseBusiness,
  },
];

export default function Internship() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">

      {/* HERO */}
      <section className="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-28">

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">

          <div className="grid items-center gap-16 lg:grid-cols-2">

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >

              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300">
                <BriefcaseBusiness className="h-4 w-4" />
                Career-ready internships
              </span>

              <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Don't just learn it.
                <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Build it.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
                Put your skills into practice through guided projects,
                mentorship, professional workflows, and portfolio-ready
                experience.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                <Link
                  to="/admission"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold transition hover:bg-blue-500"
                >
                  Apply for Internship
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/courses"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 font-semibold transition hover:bg-white/[0.08]"
                >
                  Explore Courses
                </Link>

              </div>

            </motion.div>


            {/* VISUAL */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >

              <div className="relative mx-auto max-w-lg">

                <div className="absolute -inset-8 rounded-[40px] bg-blue-600/10 blur-3xl" />

                <div className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">

                  <div className="flex items-center justify-between border-b border-white/10 pb-5">

                    <div>
                      <p className="text-sm text-slate-400">
                        Internship Progress
                      </p>

                      <p className="mt-1 text-2xl font-bold">
                        72%
                      </p>
                    </div>

                    <div className="rounded-xl bg-green-500/10 p-3 text-green-400">
                      <CheckCircle2 />
                    </div>

                  </div>

                  <div className="mt-7 space-y-5">

                    {[
                      ["Orientation", true],
                      ["First Project", true],
                      ["Mentor Review", true],
                      ["Portfolio Project", false],
                      ["Final Evaluation", false],
                    ].map(([name, complete], index) => (

                      <div
                        key={name}
                        className="flex items-center gap-4"
                      >

                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full ${
                            complete
                              ? "bg-green-500/15 text-green-400"
                              : "bg-white/5 text-slate-500"
                          }`}
                        >
                          {complete ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <span className="text-xs font-bold">
                              {index + 1}
                            </span>
                          )}
                        </div>

                        <div className="flex-1">

                          <p className="text-sm font-medium">
                            {name}
                          </p>

                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">

                            <div
                              className={`h-full rounded-full ${
                                complete
                                  ? "w-full bg-green-500"
                                  : "w-1/3 bg-slate-600"
                              }`}
                            />

                          </div>

                        </div>

                      </div>

                    ))}

                  </div>

                </div>

              </div>

            </motion.div>

          </div>

        </div>

      </section>


      {/* BENEFITS */}
      <section className="border-y border-white/5 bg-white/[0.015] py-20">

        <div className="mx-auto max-w-7xl px-5 sm:px-8">

          <div className="max-w-2xl">

            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-400">
              What you get
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Experience designed around real growth.
            </h2>

          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-5">

            {benefits.map((benefit, index) => {

              const Icon = benefit.icon;

              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.05,
                  }}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-blue-400/30"
                >

                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="font-semibold">
                    {benefit.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {benefit.text}
                  </p>

                </motion.div>
              );

            })}

          </div>

        </div>

      </section>


      {/* TRACKS */}
      <section className="py-24">

        <div className="mx-auto max-w-7xl px-5 sm:px-8">

          <div className="mx-auto max-w-2xl text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-400">
              Internship tracks
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Choose where you want to grow.
            </h2>

            <p className="mt-4 text-slate-400">
              Start with a learning path and turn your knowledge into
              practical experience.
            </p>

          </div>


          <div className="mt-12 grid gap-6 md:grid-cols-3">

            {tracks.map((track, index) => {

              const Icon = track.icon;

              return (
                <motion.div
                  key={track.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                  }}
                  className="group rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition duration-300 hover:-translate-y-2 hover:border-blue-400/30 hover:bg-white/[0.05]"
                >

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Icon />
                  </div>

                  <h3 className="mt-6 text-xl font-semibold">
                    {track.title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-400">
                    {track.description}
                  </p>

                  <Link
                    to="/admission"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300"
                  >
                    Apply now
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </Link>

                </motion.div>
              );

            })}

          </div>

        </div>

      </section>


      {/* CTA */}
      <section className="pb-24">

        <div className="mx-auto max-w-7xl px-5 sm:px-8">

          <div className="relative overflow-hidden rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-600/15 via-indigo-600/10 to-purple-600/15 p-8 sm:p-12">

            <div className="relative z-10 max-w-2xl">

              <h2 className="text-3xl font-bold sm:text-4xl">
                Ready to turn your skills into experience?
              </h2>

              <p className="mt-4 text-slate-300">
                Apply for admission and take the next step toward a
                practical, career-focused learning journey.
              </p>

              <Link
                to="/admission"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Start Your Application
                <ArrowRight className="h-4 w-4" />
              </Link>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}