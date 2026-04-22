'use client'

import { useEffect, useState } from 'react'
import FeaturedArticlesWrapper from '@/app/(root)/_components/FeaturedArticles/FeaturedArticlesWrapper'
import { Skeleton, FeaturedArticlesSkeleton } from '@/components/UI/Skeleton'
import { OtherArticlesSection } from '@/app/(root)/_components/OtherArticles'
import { PageTitle } from '@/app/(root)/_components/FeaturedArticles/PageTitle'
import Carousel from '@/components/UI/Carousel'
import ImageComponent from '@/components/ImageComponent'
import { getImageUrl, getFirstAuthorName } from '@/lib/utils'
import Link from 'next/link'

const RACE_TO_ZERO_CATEGORY_ID = 'Race_to_Zero'
const RACE_TO_ZERO_SLUG = 'race-to-zero'
const RACE_TO_ZERO_TITLE = "Race to Zero: India's Journey to Sustainability"

type FeaturedData = {
  leftPosts: Article[]
  mainPost: Article | null
  rightPosts: Article[]
}

function IndusTalesPageSkeleton() {
  return (
    <>
      {/* Hero skeleton */}
      <FeaturedArticlesSkeleton />

      {/* Race to Zero carousel skeleton */}
      <section className="py-0 pb-7 lg:pb-10 mt-10">
        <Skeleton className="h-7 w-96 mb-5" />
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
    </>
  )
}

export default function IndusTalesPage() {
  const [featured, setFeatured] = useState<FeaturedData>({ leftPosts: [], mainPost: null, rightPosts: [] })
  const [raceToZeroArticles, setRaceToZeroArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/industales-featured').then((r) => r.json()).catch(() => null),
      fetch(`/api/category-articles/${RACE_TO_ZERO_CATEGORY_ID}`).then((r) => r.json()).catch(() => null),
    ]).then(([featuredData, raceData]) => {
      if (featuredData) setFeatured(featuredData)
      if (raceData?.success) setRaceToZeroArticles(raceData.data || [])
    }).finally(() => setLoading(false))
  }, [])

  const raceToZeroItems = raceToZeroArticles
    .filter((article) => article.images.length)
    .map((article) => (
      <div key={article._id} className="py-0 lg:py-4">
        <Link href={`/category/${RACE_TO_ZERO_SLUG}?name=${article.slug}`}>
          <ImageComponent
            src={getImageUrl(article.images, 'posterImage')}
            alt={article.name}
            width={810}
            height={540}
            className="mb-2 aspect-[3/2]"
          />
        </Link>
        <h6 className="mb-2 text-lg font-bold leading-6 text-black">
          <Link href={`/category/${RACE_TO_ZERO_SLUG}?name=${article.slug}`} className="hover:underline">
            {article.name}
          </Link>
        </h6>
        <p className="mb-2 text-sm text-gray-500">{getFirstAuthorName(article.author)}</p>
      </div>
    ))

  return (
    <div className="mx-auto w-full px-4 py-4 lg:container lg:py-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-3">IndusTales Stories</h1>
        <p className="text-gray-500">Stories from India&apos;s rise to global prominence</p>
      </div>

      {loading ? (
        <IndusTalesPageSkeleton />
      ) : (
        <>
          {/* Hero playlist section */}
          {(featured.mainPost || featured.leftPosts.length > 0 || featured.rightPosts.length > 0) && (
            <FeaturedArticlesWrapper
              leftPosts={featured.leftPosts}
              mainPost={featured.mainPost}
              rightPosts={featured.rightPosts}
            />
          )}

          {/* Race to Zero carousel */}
          {raceToZeroItems.length > 0 && (
            <section className="py-0 pb-7 lg:pb-10 mt-10">
              <PageTitle title={RACE_TO_ZERO_TITLE} href={`category/${RACE_TO_ZERO_SLUG}`} />
              <Carousel
                slidesPerView={4}
                mdSlidesPerView={3}
                gridRows={1}
                loop={true}
                spaceBetween={20}
                items={raceToZeroItems}
              />
            </section>
          )}
        </>
      )}

      {/* Other Stories — has its own internal skeleton */}
      <OtherArticlesSection />
    </div>
  )
}
