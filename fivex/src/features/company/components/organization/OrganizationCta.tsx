import { motion } from "framer-motion";
import { ArrowRight, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { organizationContent } from "../../data/organizationContent";

export default function OrganizationCta() {
  const { cta } = organizationContent;

  return (
    <section className="bg-bg">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-surface px-6 py-12 text-center shadow-sm sm:px-10 sm:py-16"
        >
          {/* Decorative Elements */}
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-accent-bg blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-surface-2 blur-3xl" />

          <div className="relative mx-auto max-w-3xl">
            {/* Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-bg">
              <Building2 className="h-6 w-6 text-accent" />
            </div>

            {/* Eyebrow */}
            <span className="mt-6 block text-sm font-semibold uppercase tracking-[0.16em] text-accent">
              {cta.eyebrow}
            </span>

            {/* Heading */}
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
              {cta.title}
            </h2>

            {/* Description */}
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-muted sm:text-lg">
              {cta.description}
            </p>

            {/* Action */}
            <div className="mt-8">
              <Link
                to={cta.action.href}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-gradient px-5 py-3 font-medium text-on-brand transition-colors"
              >
                {cta.action.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}