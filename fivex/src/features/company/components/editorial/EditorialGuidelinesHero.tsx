import { motion } from "framer-motion";
import { ArrowRight, BookOpenCheck, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { editorialGuidelinesContent } from "../../data/editorialGuidelinesContent";

export default function EditorialGuidelinesHero() {
  const { hero } = editorialGuidelinesContent;

  return (
    <section className="relative overflow-hidden border-b border-border bg-bg">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-28">
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent-border bg-accent-bg px-3 py-1 text-sm font-medium text-accent">
            <BookOpenCheck className="h-4 w-4" />
            {hero.eyebrow}
          </span>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-heading sm:text-5xl lg:text-6xl">
            {hero.title}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-text-muted">
            {hero.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to={hero.primaryAction.href}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-gradient px-5 py-3 font-medium text-on-brand transition-colors"
            >
              {hero.primaryAction.label}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to={hero.secondaryAction.href}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 font-medium text-heading transition-colors hover:bg-surface-2"
            >
              {hero.secondaryAction.label}
            </Link>
          </div>
        </motion.div>

        {/* Editorial Standards Visual */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative mx-auto w-full max-w-xl"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-bg">
                <ShieldCheck className="h-5 w-5 text-accent" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-dim">
                  IITNews
                </p>

                <p className="mt-1 text-sm font-medium text-heading">
                  Editorial Standards
                </p>
              </div>
            </div>

            {/* Principles */}
            <div className="space-y-4 py-6">
              {[
                {
                  number: "01",
                  title: "Verification",
                  description: "Claims should have a path back to evidence.",
                },
                {
                  number: "02",
                  title: "Transparency",
                  description: "Readers should understand how information was reported.",
                },
                {
                  number: "03",
                  title: "Accountability",
                  description: "Meaningful errors should be addressed transparently.",
                },
              ].map((item) => (
                <div
                  key={item.number}
                  className="flex gap-4 rounded-xl border border-border bg-bg p-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-bg text-xs font-semibold text-accent">
                    {item.number}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-heading">
                      {item.title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-text-muted">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="rounded-xl border border-border bg-bg px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-verified" />

                <span className="text-xs font-medium text-heading">
                  Verification-first journalism
                </span>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -right-10 -top-10 -z-10 h-32 w-32 rounded-full bg-accent-bg blur-2xl" />
          <div className="absolute -bottom-10 -left-10 -z-10 h-32 w-32 rounded-full bg-surface-2 blur-2xl" />
        </motion.div>
      </div>
    </section>
  );
}