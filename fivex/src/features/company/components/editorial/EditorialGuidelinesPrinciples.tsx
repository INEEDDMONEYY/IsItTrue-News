import { motion } from "framer-motion";
import { editorialGuidelinesContent } from "../../data/editorialGuidelinesContent";

export default function EditorialGuidelinesPrinciples() {
  const { principles } = editorialGuidelinesContent;

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
            {principles.eyebrow}
          </span>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
            {principles.title}
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-text-muted sm:text-lg">
            {principles.description}
          </p>
        </motion.div>

        {/* Principles */}
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {principles.items.map((item, index) => (
            <motion.article
              key={item.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.45,
                delay: index * 0.06,
              }}
              className="bg-surface p-7 transition-colors duration-300 hover:bg-surface-2"
            >
              {/* Number */}
              <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-accent-bg px-2 text-xs font-semibold text-accent">
                {item.number}
              </span>

              {/* Content */}
              <h3 className="mt-6 text-lg font-semibold text-heading">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-text-muted">
                {item.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}