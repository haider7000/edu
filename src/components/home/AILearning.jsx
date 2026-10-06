import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Brain,
  CheckCircle2,
  FileText,
  Lightbulb,
  MessageCircle,
  Sparkles,
  Target,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "AI Assignment Review",
    description: "Get instant guidance on structure, clarity, and improvement areas.",
  },
  {
    icon: Lightbulb,
    title: "Study Recommendations",
    description: "Discover what to review next based on your learning progress.",
  },
  {
    icon: Target,
    title: "AI Quiz Generation",
    description: "Create practice questions to test your understanding.",
  },
  {
    icon: Sparkles,
    title: "Progress Analysis",
    description: "Understand your strengths and identify areas that need more work.",
  },
  {
    icon: MessageCircle,
    title: "Interview Preparation",
    description: "Practice professional questions and improve your answers.",
  },
];

const messages = [
  {
    type: "user",
    text: "Can you help me understand why my React component is re-rendering?",
  },
  {
    type: "ai",
    text: "Absolutely. Let's look at the most common causes first: state changes, parent re-renders, and changing object references.",
  },
  {
    type: "user",
    text: "What should I check first?",
  },
  {
    type: "ai",
    text: "Start by checking which state or props change before the render. Then we can optimize only where it actually helps.",
  },
];

export default function AILearning() {
  const [visibleMessages, setVisibleMessages] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleMessages((current) => {
        if (current >= messages.length) {
          return 1;
        }

        return current + 1;
      });
    }, 3200);

    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="ai-learning"
      className="relative overflow-hidden bg-slate-950 py-24 text-white sm:py-28 lg:py-32"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7 }}
          >
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">
              <Brain className="h-3.5 w-3.5" />
              AI-powered learning
            </span>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Your personal{" "}
              <span className="text-blue-400">AI learning companion.</span>
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
              AI can make learning more personal by helping you understand
              difficult concepts, practice consistently, and identify what to
              focus on next.
            </p>

            <div className="mt-9 space-y-5">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.07,
                    }}
                    className="flex gap-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-blue-400">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-white">
                        {feature.title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -inset-5 rounded-[2rem] bg-blue-500/10 blur-3xl" />

            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[var(--surface)] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      EduVerse AI
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                      <span className="text-[11px] text-slate-500">
                        Learning assistant
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="AI assistant options"
                  className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>

              <div className="min-h-[420px] space-y-5 p-5 sm:p-7">
                {messages.slice(0, visibleMessages).map((message, index) => (
                  <motion.div
                    key={`${message.type}-${index}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className={`flex ${
                      message.type === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                        message.type === "user"
                          ? "rounded-br-md bg-blue-600 text-white"
                          : "rounded-bl-md border border-white/10 bg-white/[0.045] text-slate-300"
                      }`}
                    >
                      {message.text}
                    </div>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-xs text-slate-500"
                >
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400 [animation-delay:300ms]" />
                  </div>
                  AI is preparing guidance
                </motion.div>
              </div>

              <div className="border-t border-white/10 p-4">
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <span className="flex-1 text-sm text-slate-600">
                    Ask your learning assistant...
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-white/10 bg-[var(--surface)] p-4 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-xs font-semibold text-white">
                    Learning progress
                  </p>
                  <p className="text-xs text-slate-500">
                    Personalized guidance
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