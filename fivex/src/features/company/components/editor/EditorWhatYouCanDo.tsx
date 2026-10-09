import { motion } from "framer-motion";
import {
  BadgeCheck,
  FileText,
  FolderCheck,
  MessageSquareText,
  SearchCheck,
  UserRoundCheck,
} from "lucide-react";
import { editorContent } from "../../data/editorContent";

const iconMap = {
  "file-text": FileText,
  "search-check": SearchCheck,
  "message-square-text": MessageSquareText,
  "badge-check": BadgeCheck,
  "folder-check": FolderCheck,
  "user-round-check": UserRoundCheck,
};

export default function EditorWhatYouCanDo() {
  const { whatYouCanDo } = editorContent;

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
          <span className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
            {whatYouCanDo.eyebrow}
          </span>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
            {whatYouCanDo.title}
          </h2>

          <p className="mt-5 text-base leading-7 text-text-muted sm:text-lg">
            {whatYouCanDo.description}
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {whatYouCanDo.items.map((item, index) => {
            const Icon =
              iconMap[item.icon as keyof typeof iconMap] ?? FileText;

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
                className="group rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:p-7"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-bg transition-transform duration-300 group-hover:scale-105">
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
      </div>
    </section>
  );
}