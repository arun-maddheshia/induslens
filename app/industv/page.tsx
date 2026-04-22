export const dynamic = 'force-dynamic'

import ImageComponent from '@/components/ImageComponent';
import TrendingVideo from '@/components/UI/TrendingVideo';
import { PageTitle } from '@/app/(root)/_components/FeaturedArticles/PageTitle';
import { db } from '@/lib/db';
import { hydratePostImages } from '@/lib/image-storage';
import { getImageUrl } from '@/lib/utils';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'IndusTV',
  description: 'Watch the latest IndusTV videos.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_API_URL}/industv`,
  },
  openGraph: {
    title: 'IndusTV',
    description: 'Watch the latest IndusTV videos.',
    images: `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@Indus_Lens',
    title: 'IndusTV',
    description: 'Watch the latest IndusTV videos.',
    images: `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
  },
};

async function fetchIndusTVVideos() {
  const videos = await db.video.findMany({
    where: { status: 'Published', category: 'industv' },
    orderBy: [{ order: 'asc' }, { publishedAt: 'desc' }],
    include: { images: true },
  });

  return videos.map((v) => ({
    id: v.id,
    slug: v.slug,
    name: v.name,
    duration: v.duration,
    images: hydratePostImages(
      v.images.map((img) => ({
        imageCategory: img.imageCategory,
        imageCategoryValue: img.imageCategoryValue || '',
        imageDescription: img.imageDescription || '',
        imageUrl: img.imageUrl,
        key: img.key || '',
      })),
      'videos',
    ),
  }));
}

export default async function IndusTVPage() {
  const videos = await fetchIndusTVVideos();

  return (
    <div className="mx-auto w-full px-4 py-4 lg:container lg:py-10">
      {/* IndusTV Videos */}
      <section className="py-0 pb-0">
        <PageTitle title="IndusTV" />
        {videos.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-4">
            {videos.map((video) => (
              <div key={video.id} className="mb-5 lg:mb-0">
                <Link
                  href={`/industv/${video.slug}`}
                  className="relative block"
                >
                  <ImageComponent
                    src={getImageUrl(
                      video.images,
                      'detailsPageBackground',
                      '',
                      'videos',
                    )}
                    alt={video.name}
                    width={640}
                    height={427}
                    className="mb-2"
                  />
                  {video.duration && (
                    <span className="absolute bottom-1 right-1 inline-block rounded bg-black px-2 text-xs font-bold leading-6 text-white">
                      {video.duration}
                    </span>
                  )}
                </Link>
                <h6 className="mb-2 text-lg font-bold leading-6 text-black hover:underline">
                  <Link href={`/industv/${video.slug}`}>{video.name}</Link>
                </h6>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-gray-500">
            No videos available.
          </p>
        )}
      </section>

      {/* Trending Videos */}
      <TrendingVideo />
    </div>
  );
}
