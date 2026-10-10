interface ArticleCoverProps {
  src: string
  alt: string
  blurred?: boolean
}

// The 16:9 lead image of a published article.
export function ArticleCover({ src, alt, blurred = false }: ArticleCoverProps) {
  return (
    <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-card-2">
      <img src={src} alt={alt} className={`w-full h-full object-cover ${blurred ? 'blur-md select-none' : ''}`} />
    </div>
  )
}
