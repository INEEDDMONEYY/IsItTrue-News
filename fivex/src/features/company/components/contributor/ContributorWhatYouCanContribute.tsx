import { motion } from "framer-motion";
import {
  FileCheck2,
  GraduationCap,
  Library,
  Lightbulb,
  MapPin,
  Search,
} from "lucide-react";
import { contributorContent } from "../../data/contributorContent";

const iconMap = {
  search: Search,
  "graduation-cap": GraduationCap,
  library: Library,
  lightbulb: Lightbulb,
  "file-check-2": FileCheck2,
  "map-pin": MapPin,
} as const;

export default function ContributorWhatYouCanContribute() {
  const { contributionTypes } = contributorContent;

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
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
            {contributionTypes.eyebrow}
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
            {contributionTypes.title}
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-text-muted sm:text-lg">
            {contributionTypes.description}
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {contributionTypes.items.map((item, index) => {
            const Icon =
              iconMap[item.icon as keyof typeof iconMap];

            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.06,
                  ease: "easeOut",
                }}
                className="group rounded-xl border border-transparent bg-brand-gradient p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-card text-accent transition-transform duration-200 group-hover:scale-105">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-heading">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-text">
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