import { CarouselCounter, CarouselDots } from '@animate-ui/react/primitives/carousel'

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'

import { ArticleCover } from './ArticleCover'
import { ArticleVideo } from './ArticleVideo'

interface ArticleMediaCarouselProps {
  coverSrc: string
  coverAlt: string
  videoUrl?: string
  videoPoster?: string
}

// Cover image first, then the author's video when one is attached.
export function ArticleMediaCarousel({ coverSrc, coverAlt, videoUrl, videoPoster }: ArticleMediaCarouselProps) {
  if (!videoUrl) {
    return <ArticleCover src={coverSrc} alt={coverAlt} />
  }

  return (
    <Carousel opts={{ loop: false }}>
      <CarouselContent>
        <CarouselItem>
          <ArticleCover src={coverSrc} alt={coverAlt} />
        </CarouselItem>
        <CarouselItem>
          <ArticleVideo src={videoUrl} poster={videoPoster} />
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 text-white" />
      <CarouselCounter
        className="absolute top-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white"
        format={(current, count) => `${current} / ${count}`}
      />
    </Carousel>
  )
}
