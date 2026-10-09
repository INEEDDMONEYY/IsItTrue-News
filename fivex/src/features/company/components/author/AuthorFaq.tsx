import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { authorContent } from "../../data/authorContent";

export default function AuthorFaq() {
  const { faq } = authorContent;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section className="bg-bg py-20 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        {/* Intro */}
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            {faq.eyebrow}
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
            {faq.title}
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-text-muted">
            {faq.description}
          </p>
        </div>

        {/* Questions */}
        <div className="mt-12 divide-y divide-border rounded-2xl border border-border bg-surface">
          {faq.items.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={item.question} className="px-6">
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left"
                >
                  <span className="text-base font-semibold text-heading">
                    {item.question}
                  </span>

                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-text-muted transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 pr-10 text-sm leading-7 text-text-muted">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}