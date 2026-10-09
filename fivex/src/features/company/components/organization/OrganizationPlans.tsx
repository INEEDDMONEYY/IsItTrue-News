import { motion } from "framer-motion";
import { Check, Infinity as InfinityIcon, Users } from "lucide-react";
import { organizationContent } from "../../data/organizationContent";

export default function OrganizationPlans() {
  const { plans } = organizationContent;

  return (
    <section id="plans" className="border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
            {plans.eyebrow}
          </span>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
            {plans.title}
          </h2>

          <p className="mt-5 text-base leading-7 text-text-muted sm:text-lg">
            {plans.description}
          </p>
        </motion.div>

        {/* Plans */}
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.items.map((plan, index) => {
            const isUnlimited = plan.seats.toLowerCase().includes("unlimited");

            return (
              <motion.article
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                className={`relative flex flex-col rounded-2xl border bg-bg p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:p-7 ${
                  plan.featured
                    ? "border-accent shadow-md"
                    : "border-border"
                }`}
              >
                {/* Featured Label */}
                {plan.featured && (
                  <div className="absolute -top-3 left-6 rounded-full bg-brand-gradient px-3 py-1 text-xs font-semibold text-on-brand">
                    Most Flexible
                  </div>
                )}

                {/* Plan Header */}
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-heading">
                        {plan.name}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-text-muted">
                        {plan.description}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mt-7 flex items-baseline gap-2">
                    <span className="text-4xl font-semibold tracking-tight text-heading">
                      {plan.price}
                    </span>

                    {plan.priceSuffix && (
                      <span className="text-sm text-text-muted">
                        {plan.priceSuffix}
                      </span>
                    )}
                  </div>

                  {/* Seats */}
                  <div className="mt-5 flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-bg">
                      {isUnlimited ? (
                        <InfinityIcon className="h-5 w-5 text-accent" />
                      ) : (
                        <Users className="h-5 w-5 text-accent" />
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-text-dim">
                        Included Access
                      </p>

                      <p className="mt-0.5 text-sm font-semibold text-heading">
                        {plan.seats}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="mt-7 border-t border-border pt-6">
                  <p className="text-sm font-semibold text-heading">
                    Included
                  </p>

                  <ul className="mt-4 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-text-muted"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-bg">
                          <Check className="h-3.5 w-3.5 text-accent" />
                        </span>

                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}