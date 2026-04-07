import SocialShare from '@/components/ArticleView/SocialShare';
import VideoPlayer from '@/components/VideoPlayer';
import { getVideoArticleBySlug } from '@/lib/db-videos';
import { getImageUrl } from '@/lib/utils';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const video = await getVideoArticleBySlug(params.slug);

  return {
    title: video?.metaTitle,
    description: video?.metaDescription,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_API_URL}/industv`,
    },
    openGraph: {
      title: video?.metaTitle,
      description: video?.metaDescription,
      images: video?.images
        ? getImageUrl(video.images, 'detailsPageBackground', '', 'videos')
        : `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@Indus_Lens',
      title: video?.metaTitle,
      description: video?.metaDescription,
      images: video?.images
        ? getImageUrl(video.images, 'detailsPageBackground', '', 'videos')
        : `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
    },
  };
}

const page = async ({ params }: Props) => {
  const { slug } = params;
  const activeVideo = await getVideoArticleBySlug(slug);

  if (!activeVideo) {
    notFound();
  }

  return (
    <section className="tv-container mx-auto my-2 px-2 py-0 pb-10 md:pb-0 lg:py-10">
      <VideoPlayer videoId={activeVideo.contentId} className="" />

      <div className="px-2 md:px-0">
        <h1 className="py-10 text-3xl font-bold">{activeVideo.name}</h1>
        <SocialShare
          title={activeVideo.metaTitle}
          shareUrl={`${process.env.NEXT_PUBLIC_API_URL}/industv/${slug}`}
          publishedDate={activeVideo.updatedAt}
        />
        <p className="pt-5 text-xl">{activeVideo.synopsis}</p>
      </div>
    </section>
  );
};

export default page;
