import { Metadata } from 'next'
import Link from 'next/link'
import ImageComponent from '@/components/ImageComponent'
import ReadMore from '@/components/UI/ReadMore'
import Carousel from '@/components/UI/Carousel'
import { PageTitle } from '@/app/(root)/_components/FeaturedArticles/PageTitle'
import { getSpecialsWithArticles, getSpecialsPage } from '@/lib/db-specials'
import { hydratePostImages } from '@/lib/image-storage'
import { getImageUrl } from '@/lib/utils'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getSpecialsPage()
  return {
    title: page.title,
    description: page.description || 'IndusLens Specials',
    alternates: { canonical: `${process.env.NEXT_PUBLIC_API_URL}/specials` },
    openGraph: {
      title: page.title,
      description: page.description || 'IndusLens Specials',
      images: `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
      type: 'website',
    },
  }
}

export default async function SpecialsPage() {
  const [pageSettings, specials] = await Promise.all([
    getSpecialsPage(),
    getSpecialsWithArticles(),
  ])

  const visibleSpecials = specials.filter((s) => s.categoryArticles.length > 0)

  return (
    <div className="mx-auto w-full px-4 py-4 lg:container lg:py-10">
      {/* Page header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-3">{pageSettings.title}</h1>
        {pageSettings.description && (
          <p className="text-gray-500 max-w-2xl mx-auto">{pageSettings.description}</p>
        )}
      </div>

      {visibleSpecials.length === 0 ? (
        <p className="text-center text-gray-400 py-20">No specials published yet.</p>
      ) : (
        visibleSpecials.map((special) => {
          const categorySlug = special.categoryRef?.slug ?? 'news'

          const carouselItems = special.categoryArticles.map((article) => {
            const images = hydratePostImages(
              (article.images || []).map((img) => ({
                imageCategory: img.imageCategory || '',
                imageCategoryValue: img.imageCategoryValue || '',
                imageDescription: img.imageDescription || '',
                imageUrl: img.imageUrl || [],
                key: article.id,
              })),
              'articles'
            )
            const articleUrl = `/category/${categorySlug}/${article.slug}`
            const imgSrc = getImageUrl(images, 'posterImage') || getImageUrl(images, 'detailsPageBackground')

            return (
              <div key={article.id} className="py-0 lg:py-4">
                <Link href={articleUrl}>
                  <ImageComponent
                    src={imgSrc}
                    alt={article.headline}
                    width={810}
                    height={540}
                    className="mb-2 aspect-[3/2]"
                  />
                </Link>
                <h6 className="mb-2 text-lg font-bold leading-6 text-black">
                  <Link href={articleUrl} className="hover:underline">
                    {article.headline}
                  </Link>
                </h6>
              </div>
            )
          })

          return (
            <section key={special.id} className="py-0 pb-7 lg:pb-10">
              <PageTitle
                title={special.categoryRef?.name ?? special.title}
                href={`/category/${categorySlug}`}
              />
              {special.description && (
                <ReadMore
                  className="mb-5 text-lg"
                  text={special.description}
                  maxLength={300}
                  href={`/category/${categorySlug}`}
                />
              )}
              <Carousel
                slidesPerView={4}
                mdSlidesPerView={3}
                gridRows={1}
                loop={true}
                spaceBetween={20}
                items={carouselItems}
              />
            </section>
          )
        })
      )}
    </div>
  )
}
