import { motion } from "framer-motion";
import {
  ArrowDown,
  CheckCircle2,
  ClipboardCheck,
  MessageSquare,
  Megaphone,
} from "lucide-react";
import { adsContent } from "../../data/adsContent";

const iconMap = {
  connect: MessageSquare,
  plan: ClipboardCheck,
  review: CheckCircle2,
  publish: Megaphone,
};

export default function AdsHowItWorks() {
  const { howItWorks } = adsContent;

  return (
    <section className="border-b border-border ">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-400">
            {howItWorks.eyebrow}
          </span>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
            {howItWorks.title}
          </h2>

          <p className="mt-5 text-base leading-7 text-text-muted sm:text-lg">
            {howItWorks.description}
          </p>
        </motion.div>

        <div className="relative mx-auto mt-14 max-w-5xl">
          <div className="absolute bottom-10 left-1/2 top-10 hidden w-px -translate-x-1/2 bg-border lg:block" />

          <div className="space-y-5 lg:space-y-8">
            {howItWorks.steps.map((step, index) => {
              const Icon =
                iconMap[
                  step.title.toLowerCase() as keyof typeof iconMap
                ] ?? ClipboardCheck;

              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={step.number}
                  initial={{
                    opacity: 0,
                    x: isEven ? -20 : 20,
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                  }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.08,
                  }}
                  className="relative lg:grid lg:grid-cols-2 lg:gap-16"
                >
                  <div
                    className={
                      isEven
                        ? "lg:col-start-1 lg:text-right"
                        : "lg:col-start-2"
                    }
                  >
                    <div
                      className={`max-w-xl rounded-2xl border border-sky-400 bg-bg p-6 shadow-sm sm:p-7 ${
                        isEven ? "lg:ml-auto" : ""
                      }`}
                    >
                      <div
                        className={`flex items-start gap-4 ${
                          isEven ? "lg:flex-row-reverse" : ""
                        }`}
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-200">
                          <Icon className="h-5 w-5 text-accent" />
                        </div>

                        <div className={isEven ? "lg:text-right" : ""}>
                          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-text-dim">
                            Step {step.number}
                          </span>

                          <h3 className="mt-2 text-lg font-semibold text-heading">
                            {step.title}
                          </h3>

                          <p className="mt-3 text-sm leading-6 text-text-muted">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute left-1/2 top-8 hidden -translate-x-1/2 lg:flex">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-brand-gradient text-xs font-semibold text-on-brand shadow-sm">
                      {step.number}
                    </div>
                  </div>

                  {index < howItWorks.steps.length - 1 && (
                    <div className="my-3 flex justify-center lg:hidden">
                      <ArrowDown className="h-5 w-5 text-text-dim" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}