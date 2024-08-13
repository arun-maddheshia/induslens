import VideoPlayer from '@/components/VideoPlayer';
import { videoNews } from '@/data/video-news';
import { getFormattedDate } from '@/lib/utils';

type Props = {
  params: { slug: string };
};

const page = ({ params }: Props) => {
  const activeVideo = videoNews.filter(
    (video) => video.slug === params.slug
  )[0];

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
