import { motion } from "framer-motion";
import {
  ArrowUpRight,
  LayoutDashboard,
  Settings2,
  Users,
} from "lucide-react";
import { organizationContent } from "../../data/organizationContent";

const iconMap = {
  "layout-dashboard": LayoutDashboard,
  users: Users,
  "settings-2": Settings2,
  "arrow-up-right": ArrowUpRight,
};

export default function OrganizationBenefits() {
  const { benefits } = organizationContent;

  return (
    <section className="border-b border-border bg-surface">
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
            {benefits.eyebrow}
          </span>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
            {benefits.title}
          </h2>

          <p className="mt-5 text-base leading-7 text-text-muted sm:text-lg">
            {benefits.description}
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {benefits.items.map((item, index) => {
            const Icon =
              iconMap[item.icon as keyof typeof iconMap] ?? LayoutDashboard;

            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                }}
                className="group rounded-2xl border border-border bg-bg p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-bg">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-heading">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-text-muted">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}