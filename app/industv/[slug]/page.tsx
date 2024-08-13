import SocialShare from '@/components/ArticleView/SocialShare';
import VideoPlayer from '@/components/VideoPlayer';
import { videoNews } from '@/data/video-news';
import { getArticleImageUrl } from '@/lib/utils';
import { Metadata } from 'next';

type Props = {
  params: { slug: string };
};

function getActiveVideo(slug: string) {
  return videoNews.filter((video) => video.slug === slug)[0];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const video = getActiveVideo(params.slug);

  return {
    title: video?.metaTitle,
    description: video?.metaDescription,
    openGraph: {
      title: video?.metaTitle,
      description: video?.metaDescription,
      images: video?.images
        ? getArticleImageUrl(video?.images, 'detailsPageBackground')
        : `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@Indus_Lens',
      title: video?.metaTitle,
      description: video?.metaDescription,
      images: video?.images
        ? getArticleImageUrl(video?.images, 'detailsPageBackground')
        : `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
    },
  };
}

const page = ({ params }: Props) => {
  const { slug } = params;
  const activeVideo = getActiveVideo(slug);

  return (
    <section className="py-0 lg:py-10 pb-10 md:pb-0 my-2 px-2 tv-container mx-auto">
      <VideoPlayer videoId={activeVideo.contentId} className="" />

      <div className="px-2 md:px-0">
        <h1 className="font-bold text-3xl py-10">{activeVideo.name}</h1>
        <SocialShare
          title={activeVideo.metaTitle}
          description={activeVideo.metaDescription}
          shareImage={getArticleImageUrl(
            activeVideo.images,
            'detailsPageBackground'
          )}
          shareUrl={`${process.env.NEXT_PUBLIC_API_URL}/industv/${slug}`}
        />
        <p className="text-xl pt-5">{activeVideo.synopsis}</p>
      </div>
    </section>
  );
};

export default page;
