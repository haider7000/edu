import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  GraduationCap,
  User,
  BookOpen,
  FileText,
  ClipboardCheck,
} from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Personal Information",
    icon: User,
  },
  {
    number: 2,
    title: "Education",
    icon: GraduationCap,
  },
  {
    number: 3,
    title: "Course Selection",
    icon: BookOpen,
  },
  {
    number: 4,
    title: "Additional Information",
    icon: FileText,
  },
  {
    number: 5,
    title: "Review",
    icon: ClipboardCheck,
  },
  {
    number: 6,
    title: "Confirmation",
    icon: CheckCircle2,
  },
];

const courses = [
  "Full-Stack Web Development",
  "AI & Machine Learning",
  "Digital Marketing",
  "UI/UX Design",
  "Cyber Security",
  "Cloud Computing",
  "Business & Entrepreneurship",
  "English & Communication",
];

export default function Admission() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    education: "",
    institution: "",
    experience: "",
    course: "",
    learningGoal: "",
    message: "",
  });

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const submitApplication = async () => {
    if (submitting) return;
    setSubmitError("");
    setSubmitting(true);

    try {
      const { error } = await supabase.rpc("create_admission_application", {
        p_first_name: form.firstName,
        p_last_name: form.lastName,
        p_email: form.email,
        p_phone: form.phone || null,
        p_city: form.city || null,
        p_education: form.education || null,
        p_institution: form.institution || null,
        p_experience: form.experience || null,
        p_course_name: form.course,
        p_learning_goal: form.learningGoal || null,
        p_message: form.message || null,
      });

      if (error) throw error;
      setCurrentStep(6);
    } catch (error) {
      console.error("ADMISSION SUBMISSION ERROR:", error);
      setSubmitError(error?.message || "We could not submit your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 5) {
      submitApplication();
      return;
    }
    setCurrentStep((step) => Math.min(step + 1, 6));
  };

  const previousStep = () => {
    setCurrentStep((step) => Math.max(step - 1, 1));
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">

      {/* HERO */}

      <section className="relative overflow-hidden px-5 pb-16 pt-32 sm:px-8 sm:pt-40">

        <div className="pointer-events-none absolute inset-0">

          <div className="absolute left-1/2 top-0 h-[450px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[130px]" />

          <div className="absolute right-0 top-40 h-64 w-64 rounded-full bg-purple-600/10 blur-[100px]" />

        </div>

        <div className="relative mx-auto max-w-5xl text-center">

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >

            <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300">
              <GraduationCap className="h-4 w-4" />
              Start your learning journey
            </span>

            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Apply for
              <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Admission
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              Tell us about yourself, choose your learning path, and take
              the first step toward building practical skills for your future.
            </p>

          </motion.div>

        </div>

      </section>


      {/* APPLICATION */}

      <section className="px-5 pb-24 sm:px-8">

        <div className="mx-auto max-w-6xl">

          {/* STEPS */}

          <div className="mb-10 hidden lg:flex items-center justify-between">

            {steps.map((step, index) => {

              const Icon = step.icon;

              const active = currentStep >= step.number;

              return (
                <div
                  key={step.number}
                  className="flex flex-1 items-center"
                >

                  <div className="flex items-center gap-3">

                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition ${
                        active
                          ? "border-blue-500 bg-blue-600 text-white"
                          : "border-white/10 bg-white/[0.03] text-slate-500"
                      }`}
                    >

                      {currentStep > step.number ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}

                    </div>

                    <span
                      className={`hidden xl:block text-sm ${
                        active
                          ? "text-white"
                          : "text-slate-500"
                      }`}
                    >
                      {step.title}
                    </span>

                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={`mx-4 h-px flex-1 ${
                        currentStep > step.number
                          ? "bg-blue-500"
                          : "bg-white/10"
                      }`}
                    />
                  )}

                </div>
              );
            })}

          </div>


          {/* MOBILE STEP */}

          <div className="mb-6 lg:hidden">

            <div className="flex items-center justify-between">

              <span className="text-sm text-slate-400">
                Step {currentStep} of 6
              </span>

              <span className="text-sm font-medium">
                {steps[currentStep - 1].title}
              </span>

            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">

              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{
                  width: `${(currentStep / 6) * 100}%`,
                }}
              />

            </div>

          </div>


          {/* FORM CARD */}

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl">

            <div className="grid lg:grid-cols-[0.8fr_1.5fr]">

              {/* LEFT */}

              <div className="border-b border-white/10 bg-white/[0.02] p-7 lg:border-b-0 lg:border-r lg:p-10">

                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-400">
                  Admission
                </p>

                <h2 className="mt-4 text-2xl font-bold">
                  Build your future with practical skills.
                </h2>

                <p className="mt-4 leading-7 text-slate-400">
                  Complete the application and our team can help you find
                  the right learning path.
                </p>

                <div className="mt-8 space-y-4">

                  {[
                    "Expert-led learning",
                    "Practical assignments",
                    "Real-world projects",
                    "Career-focused programs",
                    "Internship opportunities",
                  ].map((item) => (

                    <div
                      key={item}
                      className="flex items-center gap-3"
                    >

                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                        <Check className="h-3.5 w-3.5" />
                      </div>

                      <span className="text-sm text-slate-300">
                        {item}
                      </span>

                    </div>

                  ))}

                </div>

              </div>


              {/* RIGHT */}

              <div className="p-7 sm:p-10">

                {/* STEP 1 */}

                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >

                    <h3 className="text-2xl font-bold">
                      Tell us about yourself
                    </h3>

                    <p className="mt-2 text-slate-400">
                      Start with your basic personal information.
                    </p>

                    <div className="mt-8 grid gap-5 sm:grid-cols-2">

                      <Input
                        label="First name"
                        value={form.firstName}
                        onChange={(value) =>
                          updateField("firstName", value)
                        }
                      />

                      <Input
                        label="Last name"
                        value={form.lastName}
                        onChange={(value) =>
                          updateField("lastName", value)
                        }
                      />

                      <Input
                        label="Email address"
                        type="email"
                        value={form.email}
                        onChange={(value) =>
                          updateField("email", value)
                        }
                      />

                      <Input
                        label="Phone number"
                        value={form.phone}
                        onChange={(value) =>
                          updateField("phone", value)
                        }
                      />

                      <Input
                        label="City"
                        value={form.city}
                        onChange={(value) =>
                          updateField("city", value)
                        }
                      />

                    </div>

                  </motion.div>
                )}


                {/* STEP 2 */}

                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >

                    <h3 className="text-2xl font-bold">
                      Your education
                    </h3>

                    <p className="mt-2 text-slate-400">
                      Help us understand your current education level.
                    </p>

                    <div className="mt-8 space-y-5">

                      <Select
                        label="Highest education"
                        value={form.education}
                        onChange={(value) =>
                          updateField("education", value)
                        }
                        options={[
                          "Matric / O-Level",
                          "Intermediate / A-Level",
                          "Bachelor's",
                          "Master's",
                          "Other",
                        ]}
                      />

                      <Input
                        label="School / College / University"
                        value={form.institution}
                        onChange={(value) =>
                          updateField("institution", value)
                        }
                      />

                      <Select
                        label="Previous experience"
                        value={form.experience}
                        onChange={(value) =>
                          updateField("experience", value)
                        }
                        options={[
                          "No experience",
                          "Less than 1 year",
                          "1–2 years",
                          "3+ years",
                        ]}
                      />

                    </div>

                  </motion.div>
                )}


                {/* STEP 3 */}

                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >

                    <h3 className="text-2xl font-bold">
                      Choose your course
                    </h3>

                    <p className="mt-2 text-slate-400">
                      Select the program you want to explore.
                    </p>

                    <div className="mt-8">

                      <Select
                        label="Preferred course"
                        value={form.course}
                        onChange={(value) =>
                          updateField("course", value)
                        }
                        options={courses}
                      />

                    </div>

                  </motion.div>
                )}


                {/* STEP 4 */}

                {currentStep === 4 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >

                    <h3 className="text-2xl font-bold">
                      Tell us about your goals
                    </h3>

                    <p className="mt-2 text-slate-400">
                      This helps us understand what you want to achieve.
                    </p>

                    <div className="mt-8 space-y-5">

                      <Textarea
                        label="What do you want to achieve?"
                        value={form.learningGoal}
                        onChange={(value) =>
                          updateField("learningGoal", value)
                        }
                      />

                      <Textarea
                        label="Additional information"
                        value={form.message}
                        onChange={(value) =>
                          updateField("message", value)
                        }
                      />

                    </div>

                  </motion.div>
                )}


                {/* STEP 5 */}

                {currentStep === 5 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >

                    <h3 className="text-2xl font-bold">
                      Review your application
                    </h3>

                    <p className="mt-2 text-slate-400">
                      Check your information before submitting.
                    </p>

                    <div className="mt-8 space-y-3">

                      <Review
                        label="Name"
                        value={`${form.firstName} ${form.lastName}`}
                      />

                      <Review
                        label="Email"
                        value={form.email}
                      />

                      <Review
                        label="Phone"
                        value={form.phone}
                      />

                      <Review
                        label="Education"
                        value={form.education}
                      />

                      <Review
                        label="Institution"
                        value={form.institution}
                      />

                      <Review
                        label="Course"
                        value={form.course}
                      />

                      <Review
                        label="Experience"
                        value={form.experience}
                      />

                    </div>

                  </motion.div>
                )}


                {/* STEP 6 */}

                {currentStep === 6 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-10 text-center"
                  >

                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-400">

                      <CheckCircle2 className="h-10 w-10" />

                    </div>

                    <h3 className="mt-6 text-3xl font-bold">
                      Application ready
                    </h3>

                    <p className="mx-auto mt-4 max-w-md leading-7 text-slate-400">
                      Your application has been submitted successfully. Our admissions team can now review it from the Manager Portal.
                    </p>

                  </motion.div>
                )}


                {submitError && (
                  <div className="mt-6 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {submitError}
                  </div>
                )}

                {/* BUTTONS */}

                <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6">

                  <button
                    type="button"
                    onClick={previousStep}
                    disabled={currentStep === 1}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>


                  {currentStep < 6 ? (

                    <button
                      type="button"
                      onClick={nextStep}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold transition hover:bg-blue-500"
                    >
                      {submitting ? "Submitting…" : currentStep === 5 ? "Submit Application" : "Continue"}

                      <ArrowRight className="h-4 w-4" />

                    </button>

                  ) : (

                    <button
                      type="button"
                      onClick={() => {
                      setForm({ firstName: "", lastName: "", email: "", phone: "", city: "", education: "", institution: "", experience: "", course: "", learningGoal: "", message: "" });
                      setSubmitError("");
                      setCurrentStep(1);
                    }}
                      className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/5"
                    >
                      Start Another Application
                    </button>

                  )}

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}


/* ============================================================
   INPUT
============================================================ */

function Input({
  label,
  value,
  onChange,
  type = "text",
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />

    </label>
  );
}


/* ============================================================
   SELECT
============================================================ */

function Select({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-[var(--surface)] px-4 py-3.5 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      >

        <option value="">
          Select an option
        </option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}

      </select>

    </label>
  );
}


/* ============================================================
   TEXTAREA
============================================================ */

function Textarea({
  label,
  value,
  onChange,
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </span>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />

    </label>
  );
}


/* ============================================================
   REVIEW
============================================================ */

function Review({
  label,
  value,
}) {
  return (
    <div className="flex items-start justify-between gap-5 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">

      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-right text-sm font-medium text-[var(--foreground)]">
        {value || "Not provided"}
      </span>

    </div>
  );
}