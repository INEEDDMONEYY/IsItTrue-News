import { motion } from "framer-motion";
import { Infinity as InfinityIcon, Users } from "lucide-react";
import { organizationContent } from "../../data/organizationContent";

export default function OrganizationSeats() {
  const { seats } = organizationContent;

  return (
    <section className="border-b border-border bg-bg">
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
            {seats.eyebrow}
          </span>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
            {seats.title}
          </h2>

          <p className="mt-5 text-base leading-7 text-text-muted sm:text-lg">
            {seats.description}
          </p>
        </motion.div>

        {/* Seat Options */}
        <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
          {seats.items.map((item, index) => {
            const isUnlimited = item.value === "∞";

            return (
              <motion.article
                key={item.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                className="rounded-2xl border border-border bg-surface p-7 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                {/* Seat Icon */}
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-bg">
                  {isUnlimited ? (
                    <InfinityIcon className="h-7 w-7 text-accent" />
                  ) : (
                    <Users className="h-7 w-7 text-accent" />
                  )}
                </div>

                {/* Value */}
                <div className="mt-6">
                  <span className="text-4xl font-semibold tracking-tight text-heading">
                    {item.value}
                  </span>
                </div>

                {/* Label */}
                <h3 className="mt-3 text-lg font-semibold text-heading">
                  {item.label}
                </h3>

                {/* Description */}
                <p className="mt-3 text-sm leading-6 text-text-muted">
                  {item.description}
                </p>
              </motion.article>
            );
          })}
        </div>

        {/* Seat Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mx-auto mt-8 max-w-5xl rounded-2xl border border-border bg-surface-2 p-6 sm:p-7"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-bg">
              <Users className="h-5 w-5 text-accent" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-heading">
                Seats represent organization members
              </h3>

              <p className="mt-1 text-sm leading-6 text-text-muted">
                Each seat represents one member who can access the
                organization's IITNews account. Choose the plan that matches
                the number of people who need access.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}