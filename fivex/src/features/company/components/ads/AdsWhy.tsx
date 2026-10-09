import { motion } from "framer-motion";
import {
  Megaphone,
  Newspaper,
  Split,
  Users,
} from "lucide-react";
import { adsContent } from "../../data/adsContent";

const iconMap = {
  users: Users,
  newspaper: Newspaper,
  split: Split,
  megaphone: Megaphone,
};

export default function AdsWhy() {
  const { why } = adsContent;

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
          <span className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-400">
            {why.eyebrow}
          </span>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
            {why.title}
          </h2>

          <p className="mt-5 text-base leading-7 text-text-muted sm:text-lg">
            {why.description}
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {why.items.map((item, index) => {
            const Icon =
              iconMap[item.icon as keyof typeof iconMap] ?? Users;

            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.08,
                }}
                className="group rounded-2xl border border-border bg-bg p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient transition-transform duration-300 group-hover:scale-105">
                  <Icon className="h-5 w-5 text-white" />
                </div>

                <h3 className="mt-6 text-lg font-semibold text-heading">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-text-muted">
                  {item.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}