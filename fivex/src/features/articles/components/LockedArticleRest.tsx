import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'

interface LockedArticleRestProps {
  // Scrambled stand-in paragraphs from the server — never the article's real text.
  paragraphs: string[]
}

const MIN_BLUR_PX = 4
const MAX_BLUR_PX = 11

function SignUpPrompt() {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-2xl border border-border bg-card/95 px-6 py-5 text-center shadow-lg backdrop-blur-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-bg text-accent">
        <Lock className="h-5 w-5" />
      </span>
      <p className="text-sm font-semibold text-heading">
        Members get full access to investigations, evidence, and videos
      </p>
      <Link
        to="/register"
        className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-on-brand transition"
      >
        Sign up to keep reading
      </Link>
    </div>
  )
}

// What an anonymous reader sees after the first paragraph: the rest of the article, blurred more and more the
// further down it goes, with the sign-up prompt following them as they scroll through it.
export function LockedArticleRest({ paragraphs }: LockedArticleRestProps) {
  if (paragraphs.length === 0) {
    return (
      <div className="flex justify-center">
        <SignUpPrompt />
      </div>
    )
  }

  return (
    <div className="relative">
      <div aria-hidden="true" className="pointer-events-none flex select-none flex-col gap-4">
        {paragraphs.map((text, index) => (
          <p
            key={index}
            className="text-[15px] leading-relaxed text-text"
            style={{ filter: `blur(${Math.min(MIN_BLUR_PX + index * 1.5, MAX_BLUR_PX)}px)` }}
          >
            {text}
          </p>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />

      <div className="pointer-events-none absolute inset-0">
        <div className="pointer-events-auto sticky top-[35vh] mx-auto flex w-full max-w-sm justify-center">
          <SignUpPrompt />
        </div>
      </div>
    </div>
  )
}
