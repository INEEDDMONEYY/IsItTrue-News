import {
  BadgeCheck,
  BookOpen,
  FileText,
  MapPin,
  Newspaper,
  Search,
} from "lucide-react";
import { authorContent } from "../../data/authorContent";

const iconMap = {
  search: Search,
  newspaper: Newspaper,
  "file-text": FileText,
  "badge-check": BadgeCheck,
  "book-open": BookOpen,
  "map-pin": MapPin,
};

export default function AuthorWhatYouCanPublish() {
  const { publishingTypes } = authorContent;

  return (
    <section className="bg-bg py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          {/* Intro */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              {publishingTypes.eyebrow}
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
              {publishingTypes.title}
            </h2>

            <p className="mt-5 max-w-xl text-lg leading-8 text-text-muted">
              {publishingTypes.description}
            </p>
          </div>

          {/* Publishing Types */}
          <div className="grid gap-4 sm:grid-cols-2">
            {publishingTypes.items.map((item) => {
              const Icon =
                iconMap[item.icon as keyof typeof iconMap] ?? FileText;

              return (
                <article
                  key={item.title}
                  className="group rounded-2xl border border-border bg-surface p-6 transition-all duration-200 hover:-translate-y-1 hover:border-accent-border hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-bg">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>

                    <span className="text-xs font-medium uppercase tracking-[0.14em] text-text-dim">
                      Journalism
                    </span>
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
      </div>
    </section>
  );
}