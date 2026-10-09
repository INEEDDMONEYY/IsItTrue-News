import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { authorContent } from "../../data/authorContent";

export default function AuthorHowItWorks() {
  const { howItWorks } = authorContent;

  return (
    <section className="bg-surface py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          {/* Section Intro */}
          <div className="lg:sticky lg:top-24">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              {howItWorks.eyebrow}
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
              {howItWorks.title}
            </h2>

            <p className="mt-5 max-w-xl text-lg leading-8 text-text-muted">
              {howItWorks.description}
            </p>

            <Link
              to={howItWorks.action.href}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-5 py-3 font-medium text-on-brand transition-colors"
            >
              {howItWorks.action.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute bottom-6 left-[19px] top-6 hidden w-px bg-border sm:block" />

            <div className="space-y-8">
              {howItWorks.steps.map((step, index) => (
                <motion.article
                  key={step.number}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.08,
                  }}
                  className="relative flex gap-5"
                >
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent-border bg-accent-bg">
                    <Check className="h-4 w-4 text-accent" />
                  </div>

                  <div className="flex-1 rounded-2xl border border-border bg-bg p-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-semibold tracking-[0.16em] text-accent">
                        {step.number}
                      </span>

                      <h3 className="text-lg font-semibold text-heading">
                        {step.title}
                      </h3>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-text-muted">
                      {step.description}
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}