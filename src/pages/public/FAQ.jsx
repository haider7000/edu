import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  HelpCircle,
  Search,
} from "lucide-react";

const faqs = [
  {
    category: "Courses",
    question: "How do courses work?",
    answer:
      "Courses combine structured lessons, practical exercises and projects. Each course provides its own learning path and requirements.",
  },
  {
    category: "Courses",
    question: "Can I switch courses?",
    answer:
      "Course switching depends on the program and enrollment conditions. Contact support if you need assistance.",
  },
  {
    category: "Classes",
    question: "Are classes live?",
    answer:
      "Selected programs include live instructor-led sessions. Course details will show whether live classes are included.",
  },
  {
    category: "Certificates",
    question: "Do I receive certificates?",
    answer:
      "Eligible learners receive a certificate after completing the required course activities.",
  },
  {
    category: "Internships",
    question: "Can I join internships?",
    answer:
      "Eligible learners can access internship opportunities designed to provide practical experience.",
  },
  {
    category: "AI",
    question: "How does AI help students?",
    answer:
      "The platform is designed to use AI for learning guidance, study recommendations, quizzes and progress insights.",
  },
  {
    category: "Payments",
    question: "What payment methods are supported?",
    answer:
      "Available payment methods depend on the program and location. Available options will be shown during checkout.",
  },
  {
    category: "Payments",
    question: "Is there a refund policy?",
    answer:
      "Refund eligibility depends on the specific program and its terms. Please review the applicable conditions before purchase.",
  },
];

export default function FAQ() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [open, setOpen] = useState(null);

  const categories = ["All", ...new Set(faqs.map((item) => item.category))];

  const filtered = useMemo(() => {
    return faqs.filter((item) => {
      const categoryMatch =
        activeCategory === "All" || item.category === activeCategory;

      const searchMatch =
        item.question.toLowerCase().includes(query.toLowerCase()) ||
        item.answer.toLowerCase().includes(query.toLowerCase());

      return categoryMatch && searchMatch;
    });
  }, [activeCategory, query]);

  return (
    <main className="min-h-screen bg-[var(--background)] px-5 pb-24 pt-32 text-[var(--foreground)] sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <HelpCircle className="mx-auto h-10 w-10 text-indigo-400" />

          <h1 className="mt-6 text-4xl font-bold sm:text-6xl">
            Frequently asked{" "}
            <span className="text-gradient">questions.</span>
          </h1>

          <p className="mt-5 text-slate-400">
            Find answers about courses, classes, certificates and learning.
          </p>
        </div>

        <div className="relative mt-10">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search questions..."
            className="w-full rounded-2xl border border-white/10 bg-white/[0.035] py-4 pl-12 pr-4 text-white outline-none focus:border-indigo-500"
          />
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
                activeCategory === category
                  ? "bg-indigo-600 text-white"
                  : "bg-white/5 text-slate-400"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-3">
          {filtered.map((item, index) => {
            const id = `${item.question}-${index}`;
            const isOpen = open === id;

            return (
              <div
                key={id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                >
                  <div>
                    <span className="text-xs text-indigo-400">
                      {item.category}
                    </span>

                    <p className="mt-1 font-semibold">
                      {item.question}
                    </p>
                  </div>

                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                  >
                    <ChevronDown className="h-5 w-5 text-slate-500" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <p className="border-t border-white/10 px-5 pb-5 pt-4 text-sm leading-7 text-slate-400">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}