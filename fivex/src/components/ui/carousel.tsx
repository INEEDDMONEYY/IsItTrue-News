import * as React from 'react'
import useEmblaCarousel, {
  type CarouselOptions,
  type EmblaViewportRefType,
  type UseEmblaCarouselType,
} from '@animate-ui/react/primitives/carousel'
import type { EmblaPluginType } from 'embla-carousel'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const cn = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(' ')

type CarouselApi = NonNullable<UseEmblaCarouselType[1]>

type CarouselContextValue = {
  carouselRef: EmblaViewportRefType
  api: CarouselApi | undefined
  opts?: CarouselOptions
  orientation: 'horizontal' | 'vertical'
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />')
  }
  return context
}

function Carousel({
  orientation = 'horizontal',
  opts,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  opts?: CarouselOptions
  plugins?: EmblaPluginType[]
  orientation?: 'horizontal' | 'vertical'
}) {
  const [carouselRef, api] = useEmblaCarousel(
    { ...opts, axis: orientation === 'horizontal' ? 'x' : 'y' },
    plugins,
  )
  const [, setScrollVersion] = React.useState(0)
  const canScrollPrev = api?.canScrollPrev() ?? false
  const canScrollNext = api?.canScrollNext() ?? false

  const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api])
  const scrollNext = React.useCallback(() => api?.scrollNext(), [api])

  React.useEffect(() => {
    if (!api) return
    const onChange = () => setScrollVersion((version) => version + 1)
    api.on('reInit', onChange).on('select', onChange)
    return () => {
      api.off('reInit', onChange).off('select', onChange)
    }
  }, [api])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        orientation,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        className={cn('relative', className)}
        onKeyDownCapture={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            scrollPrev()
          } else if (event.key === 'ArrowRight') {
            event.preventDefault()
            scrollNext()
          }
        }}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, ...props }: React.ComponentProps<'div'>) {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div ref={carouselRef} className="overflow-hidden" data-slot="carousel-content">
      <div
        className={cn('flex', orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col', className)}
        {...props}
      />
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<'div'>) {
  const { orientation } = useCarousel()

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full',
        orientation === 'horizontal' ? 'pl-4' : 'pt-4',
        className,
      )}
      {...props}
    />
  )
}

function CarouselPrevious({ className, ...props }: React.ComponentProps<'button'>) {
  const { scrollPrev, canScrollPrev } = useCarousel()

  return (
    <button
      type="button"
      aria-label="Previous slide"
      data-slot="carousel-previous"
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      className={cn(
        'absolute top-1/2 left-3 -translate-y-1/2 z-10 flex size-9 items-center justify-center rounded-full bg-black/50 text-white transition-opacity hover:bg-black/70 disabled:opacity-40',
        className,
      )}
      {...props}
    >
      <ChevronLeft className="size-5" />
    </button>
  )
}

function CarouselNext({ className, ...props }: React.ComponentProps<'button'>) {
  const { scrollNext, canScrollNext } = useCarousel()

  return (
    <button
      type="button"
      aria-label="Next slide"
      data-slot="carousel-next"
      disabled={!canScrollNext}
      onClick={scrollNext}
      className={cn(
        'absolute top-1/2 right-3 -translate-y-1/2 z-10 flex size-9 items-center justify-center rounded-full bg-black/50 text-white transition-opacity hover:bg-black/70 disabled:opacity-40',
        className,
      )}
      {...props}
    >
      <ChevronRight className="size-5" />
    </button>
  )
}

export { type CarouselApi, Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext }
