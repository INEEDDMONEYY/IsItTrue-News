import { motion } from "framer-motion";
import {
  Building2,
  CalendarDays,
  CircleHelp,
  Handshake,
  HeartHandshake,
  Megaphone,
  Package,
} from "lucide-react";
import { adsContent } from "../../data/adsContent";

const iconMap = {
  package: Package,
  "building-2": Building2,
  megaphone: Megaphone,
  "calendar-days": CalendarDays,
  "heart-handshake": HeartHandshake,
  "circle-help": CircleHelp,
};

export default function AdsWhatYouCanAdvertise() {
  const { whatYouCanAdvertise } = adsContent;

  return (
    <section className="border-b border-border bg-bg">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-gradient">
            {whatYouCanAdvertise.eyebrow}
          </span>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
            {whatYouCanAdvertise.title}
          </h2>

          <p className="mt-5 text-base leading-7 text-text-muted sm:text-lg">
            {whatYouCanAdvertise.description}
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {whatYouCanAdvertise.items.map((item, index) => {
            const Icon =
              iconMap[item.icon as keyof typeof iconMap] ?? Package;

            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.06,
                }}
                className="group rounded-2xl border border-transparent bg-brand-gradient p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:p-7"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-card transition-transform duration-300 group-hover:scale-105">
                  <Icon className="h-5 w-5 text-accent" />
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

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mx-auto mt-8 max-w-4xl rounded-2xl border border-sky-400 bg-accent-bg/40 px-6 py-5 sm:px-7"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface">
              <Handshake className="h-4 w-4 text-sky-400" />
            </div>

            <div>
              <p className="text-sm font-semibold text-heading">
                Have another advertising goal?
              </p>

              <p className="mt-1 text-sm leading-6 text-text-muted">
                Advertising opportunities may evolve as IITNews develops its
                advertising program. Organizations can discuss other
                appropriate opportunities directly with IITNews.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}