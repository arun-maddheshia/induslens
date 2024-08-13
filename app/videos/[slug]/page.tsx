import VideoPlayer from '@/components/VideoPlayer';
import { videoNews } from '@/data/video-news';
import { getArticleImageUrl, getFormattedDate } from '@/lib/utils';
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
  const activeVideo = getActiveVideo(params.slug);

  return (
    <section className="py-10 my-5 video-container mx-auto">
      <div className="lg:grid lg:grid-cols-2 gap-5 px-5 lg:px-0">
        <div className=" pb-10 lg:pb-0">
          <VideoPlayer
            videoId={activeVideo.contentId}
            className="videoPlayer"
          />
        </div>
        <div>
          <h1 className="font-bold text-4xl mb-4">{activeVideo.name}</h1>
          <p className="text-xl mb-7">{activeVideo.synopsis}</p>
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
