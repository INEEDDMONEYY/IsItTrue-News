interface ArticleVideoProps {
  src: string
  poster?: string
}

// The video an author attached to a published article, shown under its cover.
export function ArticleVideo({ src, poster }: ArticleVideoProps) {
  return (
    <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-black">
      <video src={src} poster={poster} controls preload="metadata" className="w-full h-full object-contain" />
    </div>
  )
}
