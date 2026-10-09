import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { authorContent } from "../../data/authorContent";

export default function AuthorCta() {
  const { cta } = authorContent;

  return (
    <section className="bg-surface px-6 py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-bg px-6 py-14 text-center sm:px-10 lg:px-16 lg:py-20"
        >
          {/* Decorative Elements */}
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent-bg blur-3xl" />
          <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-surface-2 blur-3xl" />

          <div className="relative mx-auto max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              {cta.eyebrow}
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-heading sm:text-4xl lg:text-5xl">
              {cta.title}
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-text-muted">
              {cta.description}
            </p>

            <Link
              to={cta.action.href}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-6 py-3 font-medium text-on-brand transition-colors"
            >
              {cta.action.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}