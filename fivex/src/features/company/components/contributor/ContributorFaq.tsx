import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { contributorContent } from "../../data/contributorContent";

export default function ContributorFaq() {
  const { faq } = contributorContent;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section className="border-b border-border bg-bg">
      <div className="mx-auto max-w-4xl px-6 py-20 sm:px-8 lg:py-24">
        <div
          className="text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            {faq.eyebrow}
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
            {faq.title}
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-muted sm:text-lg">
            {faq.description}
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-xl border border-border">
          {faq.items.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={item.question}
                className="border-b border-border last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 bg-bg px-6 py-5 text-left transition-colors hover:bg-surface"
                >
                  <span className="text-sm font-semibold text-heading sm:text-base">
                    {item.question}
                  </span>

                  <span className="shrink-0 text-text-muted">
                    <ChevronDown
                      className={`h-5 w-5 ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </span>
                </button>

                {isOpen && (
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 pr-14 text-sm leading-6 text-text-muted">
                      {item.answer}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}