import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded bg-gray-200', className)}
      aria-hidden="true"
    />
  );
}
export function FeaturedArticlesSkeleton() {
  return (
    <div className="flex flex-col md:flex-row">
      {/* Left column — 2 sm cards */}
      <div className="order-0 md:w-full lg:w-1/4">
        {[0, 1].map((i) => (
          <div key={i}>
            <Skeleton className="w-full aspect-[3/2] mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/3" />
            <hr className={cn('mt-5 pt-5', i !== 0 ? 'lg:hidden' : '')} />
          </div>
        ))}
      </div>

      {/* Center column — 1 lg card, shown first on mobile */}
      <div className="order-first mb-4 px-0 md:order-1 md:w-full md:px-5 lg:mb-0 lg:w-1/2 lg:px-5">
        <div className="relative border pb-4 lg:pb-0">
          <Skeleton className="w-full aspect-[3/2]" />
          <div className="p-3 space-y-2 mt-1">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-3 w-1/3 mt-1" />
          </div>
        </div>
      </div>

      {/* Right column — 4 md cards (image square + text side by side) */}
      <div className="order-2 md:w-full lg:w-1/4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <div className="flex flex-row-reverse">
              <div className="basis-[30%]">
                <Skeleton className="aspect-[1/1] w-full" />
              </div>
              <div className="basis-[70%] pr-5 space-y-2 pt-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-1/3 mt-1" />
              </div>
            </div>
            {i !== 3 && <hr className="mt-5 pt-5" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrendingVideoSkeleton() {
  return (
    <section className="py-20 pb-10">
      <Skeleton className="h-8 w-48 mb-5" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="w-full aspect-[168/302] mb-2 rounded" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function IndusTvSkeleton() {
  return (
    <section className="py-0 pb-20">
      <Skeleton className="h-7 w-32 mb-5" />
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="mb-5 lg:mb-0">
            <Skeleton className="w-full aspect-[3/2] mb-2 rounded" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function EminenceSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border px-6 py-8 text-center">
          <Skeleton className="w-24 h-24 rounded-full mx-auto mb-3" />
          <Skeleton className="h-4 w-3/4 mx-auto mb-2" />
          <Skeleton className="h-3 w-1/2 mx-auto mb-3" />
          <Skeleton className="h-8 w-24 mx-auto rounded" />
        </div>
      ))}
    </div>
  );
}

export function ContributorsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border px-6 py-8 text-center">
          <Skeleton className="w-24 h-24 rounded-full mx-auto mb-3" />
          <Skeleton className="h-4 w-3/4 mx-auto mb-2" />
          <Skeleton className="h-3 w-1/2 mx-auto" />
        </div>
      ))}
    </div>
  );
}

/** /our-contributors grid — matches ContributorCard (singleView): square image + name + badge */
export function ContributorsListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="border h-full">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="space-y-2 p-3 lg:p-5">
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-8 w-28 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function OtherArticlesSkeleton() {
  return (
    <div className="gap-5 md:grid md:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="mb-5 flex gap-3">
          <Skeleton className="w-[180px] h-[120px] flex-shrink-0 rounded" />
          <div className="flex-1 space-y-2 py-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CategorySectionSkeleton() {
  return (
    <section className="py-0 pb-10">
      <Skeleton className="h-7 w-48 mb-3" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3 mb-5" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="w-full aspect-[3/2] mb-2 rounded" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4 mb-1" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    </section>
  );
}
