import SocialShare from '@/components/ArticleView/SocialShare';
import VideoPlayer from '@/components/VideoPlayer';
import { videoNews } from '@/data/video-news';

type Props = {
  params: { slug: string };
};

const page = ({ params }: Props) => {
  const activeVideo = videoNews.filter(
    (video) => video.slug === params.slug
  )[0];

  return (
    <section className="py-10 my-5 tv-container mx-auto">
      <VideoPlayer videoId={activeVideo.contentId} className="" />
      <h1 className="font-bold text-3xl py-10">{activeVideo.name}</h1>
      <SocialShare />
      <p className="text-xl pt-5">{activeVideo.synopsis}</p>
    </section>
  );
};

export default page;
