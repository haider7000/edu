import { motion } from "framer-motion";
import {
  Award,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Rocket,
  UserRound,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Choose a course",
    description:
      "Find a learning path that matches your interests, goals, and current skill level.",
    icon: UserRound,
  },
  {
    number: "02",
    title: "Learn with experts",
    description:
      "Follow structured lessons and learn from instructors with practical industry experience.",
    icon: GraduationCap,
  },
  {
    number: "03",
    title: "Complete assignments",
    description:
      "Practice concepts through guided assignments that reinforce what you learn.",
    icon: ClipboardCheck,
  },
  {
    number: "04",
    title: "Build real projects",
    description:
      "Apply your skills by creating projects you can confidently discuss and showcase.",
    icon: Rocket,
  },
  {
    number: "05",
    title: "Join an internship",
    description:
      "Gain practical experience and learn how professional teams approach real work.",
    icon: BriefcaseBusiness,
  },
  {
    number: "06",
    title: "Earn your certificate",
    description:
      "Complete your learning journey and receive recognition for your achievement.",
    icon: Award,
  },
  {
    number: "07",
    title: "Prepare for your career",
    description:
      "Build your portfolio, improve interview skills, and prepare for your next opportunity.",
    icon: CheckCircle2,
  },
];

export default function LearningJourney() {
  return (
    <section
      id="learning-journey"
      className="relative overflow-hidden bg-white py-24 sm:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="mb-5 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
            Your learning journey
          </span>

          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            From your first lesson to your{" "}
            <span className="text-blue-600">next opportunity.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            A structured path designed to help you move from learning
            fundamentals to applying skills in the real world.
          </p>
        </motion.div>

        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="absolute left-5 top-0 h-full w-px bg-gradient-to-b from-blue-200 via-slate-200 to-blue-200 md:left-1/2 md:-translate-x-1/2" />

          <div className="space-y-10 md:space-y-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isRight = index % 2 === 1;

              return (
                <motion.div
                  key={step.number}
                  initial={{
                    opacity: 0,
                    x: isRight ? 40 : -40,
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.2,
                  }}
                  transition={{
                    duration: 0.65,
                    delay: 0.05,
                  }}
                  className="relative md:grid md:grid-cols-2 md:gap-16"
                >
                  <div
                    className={`pl-14 md:pl-0 ${
                      isRight
                        ? "md:col-start-2 md:text-left"
                        : "md:col-start-1 md:text-right"
                    }`}
                  >
                    <div
                      className={`rounded-3xl border border-slate-200 bg-slate-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-lg ${
                        isRight ? "md:ml-0" : "md:mr-0"
                      }`}
                    >
                      <div
                        className={`flex items-start gap-4 ${
                          !isRight ? "md:flex-row-reverse" : ""
                        }`}
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-200">
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="flex-1">
                          <div
                            className={`flex items-center gap-3 ${
                              !isRight
                                ? "md:justify-end"
                                : "md:justify-start"
                            }`}
                          >
                            <span className="text-xs font-bold tracking-[0.18em] text-blue-600">
                              {step.number}
                            </span>

                            <div className="h-px w-8 bg-slate-200" />
                          </div>

                          <h3 className="mt-2 text-lg font-semibold text-slate-950 sm:text-xl">
                            {step.title}
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute left-0 top-5 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-[10px] font-bold text-white shadow-md md:left-1/2 md:-translate-x-1/2">
                    {index + 1}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}