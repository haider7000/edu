import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const questions = [
  {
    question: "How do courses work?",
    answer:
      "Choose a course, enroll and follow the learning path at your own pace. Courses can include lessons, practical assignments, projects and additional learning resources.",
  },
  {
    question: "Are classes live?",
    answer:
      "Selected programs include live instructor-led sessions. Your course information will show whether live classes are included.",
  },
  {
    question: "Do I receive certificates?",
    answer:
      "Eligible courses provide a certificate after you complete the required learning activities and successfully finish the course.",
  },
  {
    question: "Can I join internships?",
    answer:
      "Internship opportunities are available for eligible learners and can help you turn your learning into practical project experience.",
  },
  {
    question: "How does AI help students?",
    answer:
      "The platform is designed to provide AI-powered learning assistance such as study recommendations, assignment guidance, quizzes and progress insights.",
  },
  {
    question: "What payment methods are supported?",
    answer:
      "Available payment methods can vary by program and location. The checkout process will show the payment options available to you.",
  },
  {
    question: "Can I switch courses?",
    answer:
      "Course switching depends on the program and enrollment conditions. Contact support if you need help choosing a different learning path.",
  },
  {
    question: "Is there a refund policy?",
    answer:
      "Refund eligibility depends on the specific course or program. Please review the applicable terms before completing your purchase.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section
      id="faq"
      className="relative bg-[var(--background)] py-24 sm:py-28"
    >
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            <HelpCircle className="h-4 w-4 text-indigo-400" />
            Frequently asked questions
          </div>

          <h2 className="text-3xl font-bold text-white sm:text-5xl">
            Questions,{" "}
            <span className="text-gradient">answered.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            Everything you need to know before starting your learning journey.
          </p>
        </motion.div>

        <div className="space-y-3">
          {questions.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={item.question}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.4, delay: index * 0.04 }}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left transition-colors hover:bg-white/[0.035] sm:px-6"
                >
                  <span className="font-semibold text-white">
                    {item.question}
                  </span>

                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0"
                  >
                    <ChevronDown className="h-5 w-5 text-indigo-400" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="border-t border-white/10 px-5 pb-5 pt-4 text-sm leading-7 text-slate-400 sm:px-6">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}