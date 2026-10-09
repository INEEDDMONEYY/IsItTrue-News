import { motion } from "framer-motion";
import {
  BadgeCheck,
  FileCheck2,
  MessageCircle,
  Scale,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { editorContent } from "../../data/editorContent";

const iconMap = {
  "shield-check": BadgeCheck,
  "file-check-2": FileCheck2,
  "message-circle": MessageCircle,
  scale: Scale,
};

export default function EditorStandards() {
  const { standards } = editorContent;

  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl lg:sticky lg:top-24"
          >
            <span className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
              {standards.eyebrow}
            </span>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
              {standards.title}
            </h2>

            <p className="mt-5 text-base leading-7 text-text-muted sm:text-lg">
              {standards.description}
            </p>

            <Link
              to={standards.action.href}
              className="mt-8 inline-flex items-center gap-2 rounded-lg border border-border bg-bg px-5 py-3 font-medium text-heading transition-colors hover:bg-surface-2"
            >
              {standards.action.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2">
            {standards.items.map((item, index) => {
              const Icon =
                iconMap[item.icon as keyof typeof iconMap] ?? BadgeCheck;

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
                  className="group rounded-2xl border border-border bg-bg p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:p-7"
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