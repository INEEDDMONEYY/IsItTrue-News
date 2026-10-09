import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { contributorContent } from "../../data/contributorContent";

const { hero } = contributorContent;

export default function ContributorHero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-bg">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <div className="mb-5 flex items-center gap-2 text-sm font-medium text-purple-700">
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>{hero.eyebrow}</span>
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-heading sm:text-5xl lg:text-6xl">
              {hero.title}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-text-muted sm:text-lg">
              {hero.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={hero.primaryAction.href}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-gradient px-5 py-3 text-sm font-semibold text-on-brand transition-colors"
              >
                {hero.primaryAction.label}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>

              <a
                href={hero.secondaryAction.href}
                className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-5 py-3 text-sm font-semibold text-heading transition-colors hover:bg-surface-2"
              >
                {hero.secondaryAction.label}
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="relative hidden min-h-[360px] lg:block"
            aria-hidden="true"
          >
            <div className="absolute inset-0 rounded-2xl border border-transparent bg-brand-gradient" />

            <div className="absolute inset-8 rounded-xl border border-border bg-bg">
              <div className="absolute left-8 top-8 h-2 w-24 rounded-full bg-blue-400" />
              <div className="absolute left-8 top-16 h-2 w-40 rounded-full bg-brand-gradient" />
              <div className="absolute left-8 top-24 h-2 w-32 rounded-full bg-blue-400" />

              <div className="absolute bottom-8 left-8 right-8 border-t border-border pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-bg text-accent">
                    <Search className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="h-2 w-28 rounded-full bg-brand-gradient" />
                    <div className="mt-2 h-2 w-20 rounded-full bg-blue-400" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}