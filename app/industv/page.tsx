import ImageComponent from '@/components/ImageComponent';
import { db } from '@/lib/db';
import { hydratePostImages } from '@/lib/image-storage';
import { getImageUrl } from '@/lib/utils';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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
      'videos'
    ),
  }));
}

export default async function IndusTVPage() {
  const videos = await fetchIndusTVVideos();

  if (!videos.length) {
    notFound();
  }

  return (
    <section className="tv-container mx-auto my-2 px-2 py-0 pb-10 md:pb-0 lg:py-10">
      <h1 className="mb-10 text-4xl text-center font-bold">IndusTV</h1>

      
      <div className="flex flex-col gap-8">
        {videos.map((video) => (
          <div key={video.id}>
            <Link href={`/industv/${video.slug}`} className="relative block mb-3">
              <ImageComponent
                src={getImageUrl(video.images, 'detailsPageBackground', '', 'videos')}
                alt={video.name}
                width={1280}
                height={720}
                className="w-full aspect-video object-cover"
              />
              {video.duration && (
                <span className="absolute bottom-2 right-2 rounded bg-black px-2 text-xs font-bold leading-6 text-white">
                  {video.duration}
                </span>
              )}
            </Link>
            <h6 className="text-xl font-bold leading-snug text-black hover:underline">
              <Link href={`/industv/${video.slug}`}>{video.name}</Link>
            </h6>
          </div>
        ))}
      </div>
    </section>
  );
}
