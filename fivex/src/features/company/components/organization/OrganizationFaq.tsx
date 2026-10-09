import { motion } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";
import { organizationContent } from "../../data/organizationContent";

export default function OrganizationFaq() {
  const { faq } = organizationContent;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-4xl px-6 py-20 lg:px-8 lg:py-24">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent-bg">
            <HelpCircle className="h-5 w-5 text-accent" />
          </div>

          <span className="mt-5 block text-sm font-semibold uppercase tracking-[0.16em] text-accent">
            {faq.eyebrow}
          </span>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
            {faq.title}
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-muted sm:text-lg">
            {faq.description}
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="mt-12 space-y-3">
          {faq.items.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={item.question}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
                }}
                className="overflow-hidden rounded-2xl border border-border bg-bg"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left transition-colors hover:bg-surface-2 sm:px-6"
                >
                  <span className="text-sm font-semibold text-heading sm:text-base">
                    {item.question}
                  </span>

                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-text-muted transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <motion.div
                  initial={false}
                  animate={{
                    height: isOpen ? "auto" : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-border px-5 pb-5 pt-4 sm:px-6">
                    <p className="text-sm leading-7 text-text-muted">
                      {item.answer}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}