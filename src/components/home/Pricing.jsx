import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    description: "A simple way to start building practical skills.",
    price: "0",
    features: [
      "Access to selected courses",
      "Course previews",
      "Learning resources",
      "Community access",
      "Basic progress tracking",
    ],
    button: "Start Learning",
    popular: false,
  },
  {
    name: "Professional",
    description: "Everything you need to learn, practice and grow.",
    price: "29",
    features: [
      "Full course library",
      "Live instructor classes",
      "AI learning assistance",
      "Practical assignments",
      "Real-world projects",
      "Certificates",
      "Career resources",
    ],
    button: "Get Started",
    popular: true,
  },
  {
    name: "Career",
    description: "A complete path from learning to career preparation.",
    price: "59",
    features: [
      "Everything in Professional",
      "Internship opportunities",
      "Portfolio projects",
      "Career support",
      "Interview preparation",
      "Resume guidance",
      "Priority support",
    ],
    button: "Choose Career",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-[var(--background)] py-24 sm:py-28"
    >
      <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-2 text-sm font-medium text-indigo-300">
            <Sparkles className="h-4 w-4" />
            Simple pricing
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Choose the path that fits{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              your goals.
            </span>
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-400 sm:text-lg">
            Start learning at your own pace and upgrade when you are ready for
            deeper guidance, projects and career support.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className={`relative flex flex-col rounded-3xl border p-7 transition-shadow duration-300 ${
                plan.popular
                  ? "border-indigo-400/50 bg-gradient-to-b from-indigo-500/15 to-white/[0.04] shadow-[0_0_60px_rgba(99,102,241,0.12)]"
                  : "border-white/10 bg-white/[0.035] hover:border-white/20"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-xs font-bold text-white">
                  MOST POPULAR
                </div>
              )}

              <h3 className="text-xl font-bold text-white">{plan.name}</h3>

              <p className="mt-3 min-h-[48px] text-sm leading-6 text-slate-400">
                {plan.description}
              </p>

              <div className="mt-7 flex items-end gap-1">
                <span className="text-5xl font-bold text-white">
                  ${plan.price}
                </span>
                <span className="mb-2 text-sm text-slate-500">/ month</span>
              </div>

              <div className="my-7 h-px bg-white/10" />

              <ul className="flex-1 space-y-4">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-slate-300"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/15">
                      <Check className="h-3.5 w-3.5 text-indigo-400" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className={`mt-8 flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition-all ${
                  plan.popular
                    ? "bg-indigo-600 text-white hover:bg-indigo-500"
                    : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                {plan.button}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}