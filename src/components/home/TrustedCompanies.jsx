import { motion } from "framer-motion";

const companies = [
  "Microsoft",
  "Google",
  "Amazon",
  "Adobe",
  "IBM",
  "Meta",
  "Netflix",
  "Spotify",
];

export default function TrustedCompanies() {
  return (
    <section className="border-b border-white/[0.06] bg-[var(--surface)]">
      <div className="section-shell py-10 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.4,
          }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-sm font-medium text-slate-500">
            Trusted by ambitious learners and teams
          </p>

          <div className="mt-8 grid grid-cols-2 items-center gap-x-6 gap-y-6 sm:grid-cols-4 lg:grid-cols-8">
            {companies.map((company, index) => (
              <motion.div
                key={company}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.04,
                }}
                className="text-sm font-semibold tracking-tight text-slate-600 transition-colors duration-300 hover:text-slate-300 sm:text-base"
              >
                {company}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}