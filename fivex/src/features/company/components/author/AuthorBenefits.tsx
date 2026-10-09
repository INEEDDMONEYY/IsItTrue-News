import {
  BadgeCheck,
  FolderSearch,
  Library,
  PenLine,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";
import { authorContent } from "../../data/authorContent";

const iconMap = {
  "user-round": UserRound,
  "pen-line": PenLine,
  users: Users,
  "folder-search": FolderSearch,
  library: Library,
  wrench: Wrench,
  "badge-check": BadgeCheck,
};

export default function AuthorBenefits() {
  const { benefits } = authorContent;

  return (
    <section className="bg-bg py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            {benefits.eyebrow}
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
            {benefits.title}
          </h2>

          <p className="mt-5 text-lg leading-8 text-text-muted">
            {benefits.description}
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {benefits.items.map((item) => {
            const Icon =
              iconMap[item.icon as keyof typeof iconMap] ?? PenLine;

            return (
              <article
                key={item.title}
                className="rounded-2xl border border-border bg-surface p-6 transition-all duration-200 hover:-translate-y-1 hover:border-accent-border hover:shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-bg">
                  <Icon className="h-5 w-5 text-accent" />
                </div>

                <h3 className="mt-6 text-lg font-semibold text-heading">
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