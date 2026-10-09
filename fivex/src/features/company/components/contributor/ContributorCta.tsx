import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { contributorContent } from "../../data/contributorContent";

export default function ContributorCta() {
  const { cta } = contributorContent;

  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-5xl px-6 py-20 sm:px-8 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="overflow-hidden rounded-2xl border border-border bg-bg px-6 py-12 text-center sm:px-10 sm:py-16"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            {cta.eyebrow}
          </p>

          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
            {cta.title}
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-muted sm:text-lg">
            {cta.description}
          </p>

          <a
            href={cta.action.href}
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-brand-gradient px-6 py-3 text-sm font-semibold text-on-brand transition-colors"
          >
            {cta.action.label}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}