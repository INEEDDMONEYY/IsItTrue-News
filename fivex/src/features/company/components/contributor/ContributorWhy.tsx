import {
  Lightbulb,
  Megaphone,
  Search,
  ShieldCheck,
} from "lucide-react";
import { contributorContent } from "../../data/contributorContent";

const iconMap = {
  megaphone: Megaphone,
  lightbulb: Lightbulb,
  search: Search,
  "shield-check": ShieldCheck,
} as const;

export default function ContributorWhy() {
  const { why } = contributorContent;

  return (
    <section className="border-b border-border bg-bg">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-24">
        <div
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-gradient">
            {why.eyebrow}
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
            {why.title}
          </h2>

          <p className="mt-5 text-base leading-7 text-text-muted sm:text-lg">
            {why.description}
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {why.items.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];

            return (
              <article
                key={item.title}
                className="rounded-xl border border-border bg-surface p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-gradient text-on-brand">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-heading">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-text-muted">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}