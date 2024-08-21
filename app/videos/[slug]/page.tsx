import VideoPlayer from '@/components/VideoPlayer';
import { videoNews } from '@/data/video-news';
import { getImageUrl, getFormattedDate } from '@/lib/utils';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

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
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_API_URL}/videos`,
    },
    openGraph: {
      title: video?.metaTitle,
      description: video?.metaDescription,
      images: video?.images
        ? getImageUrl(video?.images, 'detailsPageBackground')
        : `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@Indus_Lens',
      title: video?.metaTitle,
      description: video?.metaDescription,
      images: video?.images
        ? getImageUrl(video?.images, 'detailsPageBackground')
        : `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
    },
  };
}

const page = ({ params }: Props) => {
  const activeVideo = getActiveVideo(params.slug);

  if (!activeVideo) {
    notFound();
  }

  return (
    <section className="video-container mx-auto my-5 py-10">
      <div className="gap-5 px-5 lg:grid lg:grid-cols-2 lg:px-0">
        <div className="pb-10 lg:pb-0">
          <VideoPlayer
            videoId={activeVideo.contentId}
            className="videoPlayer"
            autoplay={true}
          />
        </div>
        <div>
          <h1 className="mb-4 text-4xl font-bold">{activeVideo.name}</h1>
          <p className="mb-7 text-xl">{activeVideo.synopsis}</p>
          <p>
            <span className="font-semibold">{activeVideo.author}</span>
            <span className="px-2 text-sm">|</span>
            {activeVideo.publishedAt &&
              getFormattedDate(activeVideo.publishedAt)}
          </p>
        </div>
      </div>
    </section>
  );
};
export default page;
