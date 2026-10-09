import { motion } from "framer-motion";
import {
  BadgeCheck,
  ChartNoAxesCombined,
  FolderSearch,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";
import { contributorContent } from "../../data/contributorContent";

const iconMap = {
  "user-round": UserRound,
  "badge-check": BadgeCheck,
  users: Users,
  "folder-search": FolderSearch,
  "chart-no-axes-combined": ChartNoAxesCombined,
  wrench: Wrench,
} as const;

export default function ContributorBenefits() {
  const { benefits } = contributorContent;

  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
            {benefits.eyebrow}
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
            {benefits.title}
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-text-muted sm:text-lg">
            {benefits.description}
          </p>
        </motion.div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-border bg-blue-400 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.items.map((item, index) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];

            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.06,
                  ease: "easeOut",
                }}
                className="bg-bg p-7"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-gradient text-on-brand group-hover:scale-105">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-heading">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-text-muted">
                  {item.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}