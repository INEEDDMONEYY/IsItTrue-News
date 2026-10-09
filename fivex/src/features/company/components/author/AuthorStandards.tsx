import {
  CircleCheck,
  Eye,
  FileCheck,
  Library,
  Scale,
} from "lucide-react";
import { Link } from "react-router-dom";
import { authorContent } from "../../data/authorContent";

const iconMap = {
  "circle-check": CircleCheck,
  "file-check": FileCheck,
  library: Library,
  eye: Eye,
  scale: Scale,
};

export default function AuthorStandards() {
  const { standards } = authorContent;

  return (
    <section className="bg-surface py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          {/* Intro */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              {standards.eyebrow}
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
              {standards.title}
            </h2>

            <p className="mt-5 max-w-xl text-lg leading-8 text-text-muted">
              {standards.description}
            </p>

            <Link
              to={standards.action.href}
              className="mt-8 inline-flex items-center rounded-lg border border-border bg-bg px-5 py-3 font-medium text-heading transition-colors hover:border-accent-border hover:bg-accent-bg"
            >
              {standards.action.label}
            </Link>
          </div>

          {/* Principles */}
          <div className="grid gap-4 sm:grid-cols-2">
            {standards.principles.map((principle) => {
              const Icon =
                iconMap[
                  principle.icon as keyof typeof iconMap
                ] ?? CircleCheck;

              return (
                <article
                  key={principle.title}
                  className="rounded-2xl border border-border bg-bg p-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-bg">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>

                  <h3 className="mt-6 text-lg font-semibold text-heading">
                    {principle.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-text-muted">
                    {principle.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}