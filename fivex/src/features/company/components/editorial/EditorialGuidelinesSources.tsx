import { motion } from "framer-motion";
import {
  BadgeCheck,
  Quote,
  UserRoundCheck,
  UserRoundSearch,
} from "lucide-react";
import { editorialGuidelinesContent } from "../../data/editorialGuidelinesContent";

const iconMap = {
  "user-round-check": UserRoundCheck,
  quote: Quote,
  "badge-check": BadgeCheck,
  "user-round-search": UserRoundSearch,
};

export default function EditorialGuidelinesSources() {
  const { sources } = editorialGuidelinesContent;

  return (
    <section className="border-b border-border bg-bg">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
            {sources.eyebrow}
          </span>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
            {sources.title}
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-text-muted sm:text-lg">
            {sources.description}
          </p>
        </motion.div>

        {/* Source Principles */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {sources.items.map((item, index) => {
            const Icon =
              iconMap[item.icon as keyof typeof iconMap] ?? BadgeCheck;

            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.08,
                }}
                className="rounded-2xl border border-border bg-surface p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-bg">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-heading">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-text-muted">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Source Reminder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-8 rounded-2xl border border-accent-border bg-accent-bg p-6 sm:p-7"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface">
              <BadgeCheck className="h-5 w-5 text-accent" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-heading">
                Strong reporting starts with strong sourcing
              </h3>

              <p className="mt-1 text-sm leading-6 text-text-muted">
                Sources should be evaluated in context. The presence of a
                source alone does not establish that a claim is accurate;
                evidence and corroboration should be considered alongside the
                source.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}