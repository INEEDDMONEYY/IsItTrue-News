import { motion } from "framer-motion";
import {
  ArrowRight,
  Mail,
  Megaphone,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { adsContent } from "../../data/adsContent";

export default function AdsCta() {
  const { cta } = adsContent;

  return (
    <section className="">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-bg px-6 py-12 text-center shadow-sm sm:px-10 sm:py-16 lg:px-16"
        >
          <div className="relative mx-auto max-w-3xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-card">
              <Megaphone className="h-6 w-6 text-sky-500" />
            </div>

            <span className="mt-6 block text-sm font-semibold uppercase tracking-[0.16em] text-sky-400">
              {cta.eyebrow}
            </span>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-heading sm:text-4xl lg:text-5xl">
              {cta.title}
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-muted sm:text-lg">
              {cta.description}
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to={cta.primaryAction.href}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-gradient px-5 py-3 font-medium text-on-brand transition-colors"
              >
                {cta.primaryAction.label}
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to={cta.secondaryAction.href}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 font-medium text-heading transition-colors hover:bg-surface-2"
              >
                <Mail className="h-4 w-4" />
                {cta.secondaryAction.label}
              </Link>
            </div>

            <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-2 text-xs text-text-dim">
              <ShieldCheck className="h-4 w-4 text-sky-400" />
              <span>
                Advertising remains separate from editorial journalism.
              </span>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent-bg blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-surface-2 blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
}