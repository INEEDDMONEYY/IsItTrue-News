import { motion } from "framer-motion";
import {
  Layers3,
  Microscope,
  Network,
  PenLine,
} from "lucide-react";
import { editorContent } from "../../data/editorContent";

const iconMap = {
  "pen-line": PenLine,
  microscope: Microscope,
  network: Network,
  "layers-3": Layers3,
};

export default function EditorBenefits() {
  const { benefits } = editorContent;

  return (
    <section className="border-b border-border bg-bg">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl"
          >
            <span className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
              {benefits.eyebrow}
            </span>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
              {benefits.title}
            </h2>

            <p className="mt-5 text-base leading-7 text-text-muted sm:text-lg">
              {benefits.description}
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2">
            {benefits.items.map((item, index) => {
              const Icon =
                iconMap[item.icon as keyof typeof iconMap] ?? PenLine;

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
        </div>
      </div>
    </section>
  );
}