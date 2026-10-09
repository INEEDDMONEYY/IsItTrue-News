import { motion } from "framer-motion";
import {
  CircleCheck,
  Eye,
  FileCheck,
  Scale,
} from "lucide-react";
import { contributorContent } from "../../data/contributorContent";

const iconMap = {
  "circle-check": CircleCheck,
  "file-check": FileCheck,
  eye: Eye,
  scale: Scale,
} as const;

export default function ContributorStandards() {
  const { standards } = contributorContent;

  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-xl"
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">
              {standards.eyebrow}
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
              {standards.title}
            </h2>

            <p className="mt-5 text-base leading-7 text-text-muted sm:text-lg">
              {standards.description}
            </p>

            <a
              href={standards.action.href}
              className="mt-8 inline-flex items-center rounded-md border border-border bg-bg px-5 py-3 text-sm font-semibold text-heading transition-colors hover:bg-surface-2"
            >
              {standards.action.label}
            </a>
          </motion.div>

          <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
            {standards.principles.map((principle, index) => {
              const Icon =
                iconMap[principle.icon as keyof typeof iconMap];

              return (
                <motion.article
                  key={principle.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.07,
                    ease: "easeOut",
                  }}
                  className="bg-bg p-7"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-bg text-accent">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-heading">
                    {principle.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-text-muted">
                    {principle.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}