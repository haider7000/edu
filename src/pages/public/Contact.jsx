import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock3,
  Mail,
  MessageSquare,
  Phone,
} from "lucide-react";

export default function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-5 pb-24 pt-32 text-[var(--foreground)] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="text-center">
          <span className="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-2 text-sm text-indigo-300">
            Contact us
          </span>

          <h1 className="mt-6 text-4xl font-bold sm:text-6xl">
            Let's start a{" "}
            <span className="text-gradient">conversation.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">
            Have a question about courses, admissions or learning? Send us a
            message and our team can help.
          </p>
        </section>

        <div className="mt-14 grid gap-8 lg:grid-cols-[.7fr_1.3fr]">
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <InfoCard
              icon={Mail}
              title="Email"
              value="Support email is configured by the administrator"
            />

            <InfoCard
              icon={Phone}
              title="Phone"
              value="Support available through the platform"
            />

            <InfoCard
              icon={Clock3}
              title="Support hours"
              value="Monday – Friday, 9:00 AM – 6:00 PM"
            />

            <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7">
              <MessageSquare className="h-6 w-6 text-indigo-400" />

              <h3 className="mt-5 text-xl font-bold">
                Need help choosing a course?
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                Tell us about your goals and we can help you identify a
                suitable learning path.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8"
          >
            {sent ? (
              <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
                <CheckCircle2 className="h-14 w-14 text-green-400" />

                <h2 className="mt-6 text-2xl font-bold">
                  Message prepared successfully
                </h2>

                <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">
                  This frontend form is currently a presentation only. Backend
                  message delivery can be connected later.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Name" required />
                  <Field label="Email" type="email" required />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Phone" />
                  <Field label="Subject" required />
                </div>

                <label className="block text-sm text-slate-300">
                  Message
                  <textarea
                    required
                    rows={7}
                    className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-indigo-500"
                    placeholder="How can we help?"
                  />
                </label>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold transition hover:bg-indigo-500"
                >
                  Send Message
                </button>
              </form>
            )}
          </motion.div>
        </div>

        <div className="mt-8 h-64 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_center,rgba(99,102,241,.12),transparent_45%)] text-center">
            <div>
              <p className="font-semibold text-slate-300">
                Support location
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Online support — no physical address displayed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoCard({ icon: Icon, title, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
      <Icon className="h-6 w-6 text-indigo-400" />
      <p className="mt-4 text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-sm font-medium text-slate-200">{value}</p>
    </div>
  );
}

function Field({ label, type = "text", required = false }) {
  return (
    <label className="block text-sm text-slate-300">
      {label}

      <input
        type={type}
        required={required}
        className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-indigo-500"
      />
    </label>
  );
}