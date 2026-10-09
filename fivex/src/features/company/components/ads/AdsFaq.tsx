import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { adsContent } from "../../data/adsContent";

export default function AdsFaq() {
  const { faq } = adsContent;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section className="border-b border-border bg-bg">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-24"
          >
            <span className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-gradient">
              {faq.eyebrow}
            </span>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
              {faq.title}
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-text-muted sm:text-lg">
              {faq.description}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
          >
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
                    className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition-colors duration-200 hover:bg-surface-2 sm:px-7"
                  >
                    <span className="flex items-start gap-4">
                      <span className="mt-0.5 text-xs font-semibold tracking-[0.12em] text-accent">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="text-sm font-semibold text-heading sm:text-base">
                        {item.question}
                      </span>
                    </span>

                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-text-muted transition-transform duration-300 ${
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
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pl-[4.5rem] pr-12 sm:px-7 sm:pb-7 sm:pl-[5.25rem]">
                          <p className="max-w-2xl text-sm leading-6 text-card">
                            {item.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}