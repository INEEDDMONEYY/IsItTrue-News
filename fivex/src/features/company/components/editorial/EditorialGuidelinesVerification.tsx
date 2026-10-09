import { motion } from "framer-motion";
import {
  Archive,
  GitCompare,
  Microscope,
  Search,
  ShieldCheck,
} from "lucide-react";
import { editorialGuidelinesContent } from "../../data/editorialGuidelinesContent";

const iconMap = {
  search: Search,
  microscope: Microscope,
  "git-compare": GitCompare,
  archive: Archive,
};

export default function EditorialGuidelinesVerification() {
  const { verification } = editorialGuidelinesContent;

  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-24"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-bg">
              <ShieldCheck className="h-6 w-6 text-accent" />
            </div>

            <span className="mt-6 block text-sm font-semibold uppercase tracking-[0.16em] text-accent">
              {verification.eyebrow}
            </span>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
              {verification.title}
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-text-muted sm:text-lg">
              {verification.description}
            </p>
          </motion.div>

          {/* Verification Steps */}
          <div className="relative">
            {/* Vertical Connector */}
            <div className="absolute bottom-8 left-6 top-8 hidden w-px bg-border sm:block" />

            <div className="space-y-5">
              {verification.items.map((item, index) => {
                const Icon =
                  iconMap[item.icon as keyof typeof iconMap] ?? ShieldCheck;

                return (
                  <motion.article
                    key={item.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{
                      duration: 0.45,
                      delay: index * 0.08,
                    }}
                    className="relative rounded-2xl border border-border bg-bg p-6 shadow-sm sm:ml-14 sm:p-7"
                  >
                    {/* Step Marker */}
                    <div className="absolute -left-[3.65rem] top-6 hidden h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface sm:flex">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>

                    {/* Mobile Icon */}
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-bg sm:hidden">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>

                    <div className="sm:mt-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-text-dim">
                          Step {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <h3 className="mt-2 text-lg font-semibold text-heading">
                        {item.title}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-text-muted">
                        {item.description}
                      </p>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}