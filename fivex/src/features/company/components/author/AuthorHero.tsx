import { motion } from "framer-motion";
import { ArrowRight, Search, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { authorContent } from "../../data/authorContent";

export default function AuthorHero() {
  const { hero } = authorContent;

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
          <span className="mb-5 inline-flex items-center rounded-full border border-accent-border bg-accent-bg px-3 py-1 text-sm font-medium text-accent">
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

        {/* Editorial Visual */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative mx-auto w-full max-w-xl"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-dim">
                  Author Workspace
                </p>
                <p className="mt-1 text-sm font-medium text-heading">
                  Investigation in progress
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-bg">
                <Search className="h-4 w-4 text-accent" />
              </div>
            </div>

            {/* Story */}
            <div className="py-6">
              <div className="h-2 w-24 rounded-full bg-accent-bg" />

              <div className="mt-4 space-y-3">
                <div className="h-4 w-full rounded bg-surface-2" />
                <div className="h-4 w-[92%] rounded bg-surface-2" />
                <div className="h-4 w-[78%] rounded bg-surface-2" />
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-bg p-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-verified" />
                    <span className="text-xs font-medium text-heading">
                      Evidence
                    </span>
                  </div>

                  <div className="mt-3 h-2 w-20 rounded-full bg-surface-2" />
                  <div className="mt-2 h-2 w-28 rounded-full bg-surface-2" />
                </div>

                <div className="rounded-xl border border-border bg-bg p-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-accent" />
                    <span className="text-xs font-medium text-heading">
                      Sources
                    </span>
                  </div>

                  <div className="mt-3 h-2 w-24 rounded-full bg-surface-2" />
                  <div className="mt-2 h-2 w-16 rounded-full bg-surface-2" />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-xs text-text-muted">
                Editorial workflow
              </span>

              <span className="inline-flex items-center gap-2 text-xs font-medium text-verified">
                <span className="h-2 w-2 rounded-full bg-verified" />
                Researching
              </span>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -right-10 -top-10 -z-10 h-32 w-32 rounded-full bg-accent-bg blur-2xl" />
          <div className="absolute -bottom-10 -left-10 -z-10 h-32 w-32 rounded-full bg-surface-2 blur-2xl" />
        </motion.div>
      </div>
    </section>
  );
}