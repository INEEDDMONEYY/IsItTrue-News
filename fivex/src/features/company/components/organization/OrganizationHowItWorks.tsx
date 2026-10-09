import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { organizationContent } from "../../data/organizationContent";

export default function OrganizationHowItWorks() {
  const { howItWorks } = organizationContent;

  return (
    <section className="border-b border-border bg-bg">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
            {howItWorks.eyebrow}
          </span>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
            {howItWorks.title}
          </h2>

          <p className="mt-5 text-base leading-7 text-text-muted sm:text-lg">
            {howItWorks.description}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative mx-auto mt-14 max-w-5xl">
          {/* Desktop Connector */}
          <div className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-px bg-border md:block" />

          <div className="grid gap-8 md:grid-cols-4">
            {howItWorks.steps.map((step, index) => (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                className="relative text-center"
              >
                {/* Step Number */}
                <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-accent-border bg-surface text-sm font-semibold text-accent shadow-sm">
                  {step.number}
                </div>

                <h3 className="mt-6 text-lg font-semibold text-heading">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-text-muted">
                  {step.description}
                </p>

                {/* Mobile Connector */}
                {index < howItWorks.steps.length - 1 && (
                  <div className="mx-auto mt-8 flex justify-center md:hidden">
                    <div className="h-8 w-px bg-border" />
                  </div>
                )}
              </motion.article>
            ))}
          </div>
        </div>

        {/* Bottom Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mx-auto mt-14 max-w-3xl rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-7"
        >
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-bg">
              <CheckCircle2 className="h-5 w-5 text-accent" />
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-semibold text-heading">
                Start with the access your organization needs
              </h3>

              <p className="mt-1 text-sm leading-6 text-text-muted">
                Your organization can begin with a single seat and move to
                broader team access as your needs change.
              </p>
            </div>

            <ArrowRight className="hidden h-5 w-5 shrink-0 text-text-dim sm:block" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}