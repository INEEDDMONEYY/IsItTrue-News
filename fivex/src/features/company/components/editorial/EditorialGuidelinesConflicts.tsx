import { motion } from "framer-motion";
import {
  Link2,
  Scale,
  ShieldCheck,
  Split,
} from "lucide-react";
import { editorialGuidelinesContent } from "../../data/editorialGuidelinesContent";

const iconMap = {
  link: Link2,
  split: Split,
  "shield-check": ShieldCheck,
  scale: Scale,
};

export default function EditorialGuidelinesConflicts() {
  const { conflicts } = editorialGuidelinesContent;

  return (
    <section className="border-b border-border bg-bg">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="grid gap-5 sm:grid-cols-2">
            {conflicts.items.map((item, index) => {
              const Icon =
                iconMap[item.icon as keyof typeof iconMap] ?? ShieldCheck;

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
                  className="group rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:p-7"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-bg transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>

                  <h3 className="mt-6 text-lg font-semibold text-heading">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-text-muted">
                    {item.description}
                  </p>
                </motion.article>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-24"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-bg">
              <Scale className="h-6 w-6 text-accent" />
            </div>

            <span className="mt-6 block text-sm font-semibold uppercase tracking-[0.16em] text-accent">
              {conflicts.eyebrow}
            </span>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
              {conflicts.title}
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-text-muted sm:text-lg">
              {conflicts.description}
            </p>

            <div className="mt-8 rounded-2xl border border-accent-border bg-accent-bg p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />

                <p className="text-sm leading-6 text-text-muted">
                  Editorial independence depends on identifying relevant
                  relationships and applying appropriate safeguards to the
                  reporting process.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}