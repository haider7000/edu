import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  CheckCircle2,
  Headphones,
  Laptop,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Expert instructors",
    description:
      "Learn from experienced professionals who understand both the theory and the realities of modern work.",
    size: "large",
  },
  {
    icon: Laptop,
    title: "Live learning",
    description:
      "Attend structured live classes and interact directly with instructors.",
    size: "small",
  },
  {
    icon: Brain,
    title: "AI learning assistance",
    description:
      "Get personalized study guidance, explanations, practice ideas, and learning support.",
    size: "small",
  },
  {
    icon: BookOpen,
    title: "Practical assignments",
    description:
      "Turn concepts into skills through structured assignments designed around real outcomes.",
    size: "small",
  },
  {
    icon: BriefcaseBusiness,
    title: "Real projects",
    description:
      "Build portfolio-ready projects that demonstrate what you can actually do.",
    size: "large",
  },
  {
    icon: Award,
    title: "Professional certificates",
    description:
      "Complete your learning journey with certificates that recognize your achievement.",
    size: "small",
  },
  {
    icon: Headphones,
    title: "Career support",
    description:
      "Prepare for interviews, portfolios, applications, and your next professional step.",
    size: "small",
  },
  {
    icon: CheckCircle2,
    title: "Internship opportunities",
    description:
      "Move beyond theory and gain experience through practical internship opportunities.",
    size: "small",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function WhyChooseUs() {
  return (
    <section
      id="why-us"
      className="relative overflow-hidden bg-[var(--card)] py-24 sm:py-28 lg:py-32"
    >
      <div className="pointer-events-none absolute left-0 top-1/3 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-violet-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <span className="mb-5 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
            Why EduVerse
          </span>

          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Everything you need to turn{" "}
            <span className="text-blue-600">learning into progress.</span>
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            We combine expert teaching, practical work, modern technology, and
            career support into one connected learning experience.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const large = feature.size === "large";

            return (
              <motion.article
                key={feature.title}
                variants={itemVariants}
                whileHover={{
                  y: -6,
                  transition: { duration: 0.25 },
                }}
                className={`group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-shadow duration-300 hover:shadow-xl ${
                  large ? "lg:col-span-2" : "lg:col-span-1"
                }`}
              >
                <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-blue-500/5 blur-2xl transition-all duration-500 group-hover:bg-blue-500/10" />

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Icon className="h-6 w-6" strokeWidth={1.8} />
                    </div>

                    <span className="text-xs font-medium text-slate-300">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="mt-7 text-xl font-semibold tracking-tight text-slate-950">
                    {feature.title}
                  </h3>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                    {feature.description}
                  </p>

                  <div className="mt-6 h-px w-full bg-slate-100" />

                  <div className="mt-5 flex items-center gap-2 text-sm font-medium text-blue-600">
                    <span>Designed for progress</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}