import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock3,
  Star,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const courses = [
  {
    id: "full-stack-bootcamp",
    category: "Web Development",
    title: "Full-Stack Web Development Bootcamp",
    instructor: "Daniel Carter",
    rating: "4.9",
    students: "2.8K",
    duration: "16 weeks",
    price: "$149",
    accent: "from-blue-600/40 via-indigo-500/20 to-slate-900",
    icon: "</>",
  },
  {
    id: "machine-learning-az",
    category: "AI & ML",
    title: "Machine Learning A–Z",
    instructor: "Dr. Sarah Mitchell",
    rating: "4.9",
    students: "1.9K",
    duration: "12 weeks",
    price: "$179",
    accent: "from-violet-600/40 via-purple-500/20 to-slate-900",
    icon: "AI",
  },
  {
    id: "ui-ux-masterclass",
    category: "UI/UX Design",
    title: "UI/UX Product Design Masterclass",
    instructor: "Maya Thompson",
    rating: "4.8",
    students: "1.4K",
    duration: "10 weeks",
    price: "$129",
    accent: "from-fuchsia-600/30 via-violet-500/20 to-slate-900",
    icon: "UX",
  },
  {
    id: "digital-marketing-2026",
    category: "Marketing",
    title: "Digital Marketing Strategy 2026",
    instructor: "James Wilson",
    rating: "4.8",
    students: "1.7K",
    duration: "8 weeks",
    price: "$99",
    accent: "from-cyan-600/30 via-blue-500/20 to-slate-900",
    icon: "MKT",
  },
  {
    id: "cloud-architecture",
    category: "Cloud",
    title: "Modern Cloud Architecture",
    instructor: "Alex Morgan",
    rating: "4.9",
    students: "980",
    duration: "14 weeks",
    price: "$189",
    accent: "from-sky-600/30 via-cyan-500/20 to-slate-900",
    icon: "CLOUD",
  },
  {
    id: "cybersecurity-fundamentals",
    category: "Cyber Security",
    title: "Cybersecurity Fundamentals",
    instructor: "Michael Brooks",
    rating: "4.8",
    students: "1.2K",
    duration: "10 weeks",
    price: "$139",
    accent: "from-emerald-600/30 via-teal-500/20 to-slate-900",
    icon: "SEC",
  },
];

function CourseVisual({ course }) {
  return (
    <div
      className={`relative h-48 overflow-hidden bg-gradient-to-br ${course.accent}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,.14),transparent_25%)]" />

      <div className="absolute left-6 top-6 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300 backdrop-blur-md">
        {course.category}
      </div>

      <div className="absolute bottom-6 left-6">
        <div className="text-4xl font-bold tracking-[-0.06em] text-white/90">
          {course.icon}
        </div>
      </div>

      <div className="absolute -bottom-16 -right-10 h-40 w-40 rounded-full border border-white/10" />

      <div className="absolute -right-4 top-14 h-28 w-28 rounded-full border border-white/10" />
    </div>
  );
}

export default function FeaturedCourses() {
  return (
    <section className="section-space relative bg-[var(--background)]">
      <div className="section-shell">
        <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
          <div>
            <span className="eyebrow">
              Featured courses
            </span>

            <h2 className="section-title">
              Learn from courses built for real work.
            </h2>

            <p className="section-description">
              Carefully structured programs designed to
              help you develop skills you can actually use.
            </p>
          </div>

          <Link
            to="/courses"
            className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300"
          >
            View all courses

            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, index) => (
            <motion.article
              key={course.id}
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
                amount: 0.15,
              }}
              transition={{
                duration: 0.55,
                delay: index * 0.05,
              }}
              whileHover={{
                y: -6,
              }}
              className="group overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025] transition-shadow duration-500 hover:border-white/[0.13] hover:shadow-2xl hover:shadow-blue-950/20"
            >
              <CourseVisual course={course} />

              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-medium text-blue-400">
                    {course.category}
                  </span>

                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Star
                      size={13}
                      fill="currentColor"
                      className="text-amber-400"
                    />
                    {course.rating}
                  </div>
                </div>

                <h3 className="mt-3 min-h-[52px] text-lg font-semibold leading-7 tracking-[-0.02em] text-white">
                  {course.title}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  by {course.instructor}
                </p>

                <div className="mt-5 flex flex-wrap gap-4 border-t border-white/[0.07] pt-5 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Users size={14} />
                    {course.students}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 size={14} />
                    {course.duration}
                  </span>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-600">
                      Course price
                    </span>

                    <div className="mt-0.5 text-xl font-semibold text-white">
                      {course.price}
                    </div>
                  </div>

                  <Link
                    to={`/courses/${course.id}`}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-white transition-all duration-300 hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-300"
                  >
                    View Course
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}