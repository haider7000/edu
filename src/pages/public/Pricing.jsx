import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "$0",
    description: "For learners exploring new skills.",
    features: [
      "Selected courses",
      "Learning resources",
      "Community access",
      "Basic progress tracking",
    ],
  },
  {
    name: "Professional",
    price: "$29",
    description: "For serious learners building practical skills.",
    features: [
      "Full course library",
      "Live classes",
      "AI learning assistance",
      "Assignments",
      "Projects",
      "Certificates",
    ],
    popular: true,
  },
  {
    name: "Career",
    price: "$59",
    description: "For learners preparing for professional opportunities.",
    features: [
      "Everything in Professional",
      "Internship opportunities",
      "Career support",
      "Portfolio guidance",
      "Interview preparation",
      "Priority support",
    ],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-5 pb-24 pt-32 text-[var(--foreground)] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-400">
            Pricing
          </p>

          <h1 className="mt-5 text-4xl font-bold sm:text-6xl">
            Invest in your{" "}
            <span className="text-gradient">next skill.</span>
          </h1>

          <p className="mt-5 leading-7 text-slate-400">
            Choose a plan that matches where you are today and where you want
            to go next.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-3xl border p-7 ${
                plan.popular
                  ? "border-indigo-500/50 bg-indigo-500/10"
                  : "border-white/10 bg-white/[0.035]"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-6 rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold">
                  RECOMMENDED
                </span>
              )}

              <h2 className="text-xl font-bold">{plan.name}</h2>

              <p className="mt-3 min-h-12 text-sm leading-6 text-slate-400">
                {plan.description}
              </p>

              <div className="mt-7 text-5xl font-bold">{plan.price}</div>

              <p className="mt-1 text-sm text-slate-500">per month</p>

              <div className="my-7 h-px bg-white/10" />

              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex gap-3 text-sm text-slate-300"
                  >
                    <Check className="h-5 w-5 shrink-0 text-green-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className={`mt-8 flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-semibold ${
                  plan.popular
                    ? "bg-indigo-600 hover:bg-indigo-500"
                    : "bg-white/10 hover:bg-white/15"
                }`}
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}