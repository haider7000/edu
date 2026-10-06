import { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  Layers3,
  Sparkles,
  Users,
} from "lucide-react";
import { useRef } from "react";

const statistics = [
  {
    value: 10000,
    display: "10,000+",
    label: "Students",
    icon: Users,
  },
  {
    value: 250,
    display: "250+",
    label: "Courses",
    icon: BookOpen,
  },
  {
    value: 100,
    display: "100+",
    label: "Expert Teachers",
    icon: GraduationCap,
  },
  {
    value: 500,
    display: "500+",
    label: "Projects",
    icon: Layers3,
  },
  {
    value: 95,
    display: "95%",
    label: "Student Satisfaction",
    icon: Sparkles,
  },
];

function Counter({ target, suffix }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);

  const inView = useInView(ref, {
    once: true,
    amount: 0.5,
  });

  useEffect(() => {
    if (!inView) return;

    let start;
    let frame;

    const duration = 1300;

    const update = (timestamp) => {
      if (!start) {
        start = timestamp;
      }

      const progress = Math.min(
        (timestamp - start) / duration,
        1
      );

      const eased =
        1 - Math.pow(1 - progress, 3);

      setValue(
        Math.round(target * eased)
      );

      if (progress < 1) {
        frame = requestAnimationFrame(update);
      }
    };

    frame = requestAnimationFrame(update);

    return () => {
      if (frame) {
        cancelAnimationFrame(frame);
      }
    };
  }, [inView, target]);

  return (
    <span ref={ref}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section className="relative border-b border-white/[0.06] bg-[var(--background)]">
      <div className="section-shell py-16 sm:py-20">
        <div className="grid grid-cols-2 divide-x divide-y divide-white/[0.07] border-y border-white/[0.07] lg:grid-cols-5 lg:divide-y-0">
          {statistics.map((item, index) => {
            const Icon = item.icon;

            const suffix = item.display.includes("%")
              ? "%"
              : "+";

            return (
              <motion.div
                key={item.label}
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.35,
                }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.05,
                }}
                className={`group px-5 py-8 sm:px-8 lg:py-10 ${
                  index === 4
                    ? "col-span-2 lg:col-span-1"
                    : ""
                }`}
              >
                <Icon
                  size={19}
                  className="text-blue-400/80 transition-transform duration-300 group-hover:-translate-y-0.5"
                />

                <div className="mt-5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  <Counter
                    target={item.value}
                    suffix={suffix}
                  />
                </div>

                <p className="mt-1.5 text-sm text-slate-500">
                  {item.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}