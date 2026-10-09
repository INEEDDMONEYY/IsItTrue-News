import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { contributorContent } from "../../data/contributorContent";

export default function ContributorHowItWorks() {
  const { howItWorks } = contributorContent;

  return (
    <section className="border-b border-border bg-bg">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-gradient">
            {howItWorks.eyebrow}
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
            {howItWorks.title}
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-text-muted sm:text-lg">
            {howItWorks.description}
          </p>
        </motion.div>

        <div className="mt-14">
          <div className="relative">
            <div
              className="absolute left-5 top-6 hidden h-[calc(100%-3rem)] w-px bg-border sm:block"
              aria-hidden="true"
            />

            <div className="space-y-10">
              {howItWorks.steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.07,
                    ease: "easeOut",
                  }}
                  className="relative flex gap-6"
                >
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-on-brand">
                    {step.number}
                  </div>

                  <div className="max-w-2xl pt-1">
                    <h3 className="text-lg font-semibold text-heading">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-text-muted sm:text-base">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="mt-12"
          >
            <a
              href={howItWorks.action.href}
              className="inline-flex items-center gap-2 rounded-md bg-brand-gradient px-5 py-3 text-sm font-semibold text-on-brand transition-colors"
            >
              {howItWorks.action.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}