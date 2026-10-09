import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpenCheck,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { editorContent } from "../../data/editorContent";

export default function EditorHero() {
  const { hero } = editorContent;

  return (
    <section className="relative overflow-hidden border-b border-border bg-bg">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent-border bg-accent-bg px-3 py-1 text-sm font-medium text-accent">
            <BookOpenCheck className="h-4 w-4" />
            {hero.eyebrow}
          </span>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-heading sm:text-5xl lg:text-6xl">
            {hero.title}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-text-muted">
            {hero.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to={hero.primaryAction.href}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-gradient px-5 py-3 font-medium text-on-brand transition-colors"
            >
              {hero.primaryAction.label}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to={hero.secondaryAction.href}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 font-medium text-heading transition-colors hover:bg-surface-2"
            >
              {hero.secondaryAction.label}
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative mx-auto w-full max-w-xl"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-border pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-bg">
                <ShieldCheck className="h-5 w-5 text-accent" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-dim">
                  IITNews
                </p>
                <p className="mt-1 text-sm font-medium text-heading">
                  Editorial Review
                </p>
              </div>
            </div>

            <div className="space-y-4 py-6">
              {[
                {
                  icon: BookOpenCheck,
                  title: "Review Reporting",
                  description:
                    "Evaluate journalism, sourcing, evidence, and editorial context.",
                },
                {
                  icon: ShieldCheck,
                  title: "Strengthen Verification",
                  description:
                    "Help identify unsupported claims and gaps in reporting.",
                },
                {
                  icon: Users,
                  title: "Work With Authors",
                  description:
                    "Collaborate with authors to strengthen their journalism.",
                },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-xl border border-border bg-bg p-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-bg">
                      <Icon className="h-4 w-4 text-accent" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-dim">
                          0{index + 1}
                        </span>

                        <p className="text-sm font-semibold text-heading">
                          {item.title}
                        </p>
                      </div>

                      <p className="mt-1 text-xs leading-5 text-text-muted">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl border border-border bg-bg px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-verified" />
                <span className="text-xs font-medium text-heading">
                  Evidence-driven editorial review
                </span>
              </div>
            </div>
          </div>

          <div className="absolute -right-10 -top-10 -z-10 h-32 w-32 rounded-full bg-accent-bg blur-2xl" />
          <div className="absolute -bottom-10 -left-10 -z-10 h-32 w-32 rounded-full bg-surface-2 blur-2xl" />
        </motion.div>
      </div>
    </section>
  );
}