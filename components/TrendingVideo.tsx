import Carousel from '@/components//UI/Carousel';
import { videoNews } from '@/data/video-news';
import { getArticleImageUrl } from '@/lib/utils';
import ImageComponent from './ImageComponent';
import Link from 'next/link';

export default function TrendingVideo() {
  const allPost = videoNews.map((video) => (
    <div key={`video_${video._id}`}>
      <Link href={`/videos/${video.slug}`}>
        <ImageComponent
          src={getArticleImageUrl(video.images, 'featuredImage')}
          alt={video.name}
          width={247}
          height={394}
          className="mb-2"
        />
      </Link>
      <h6 className="text-black mb-2 text-md lg:text-xl leading-6 font-bold">
        <Link className="hover:underline" href={`/videos/${video.slug}`}>
          {video.name}
        </Link>
      </h6>
    </div>
  ));

  return (
    <section className="py-20 pb-0">
      <h2 className="font-bold text-3xl text-black mb-5">Trending Videos</h2>
      <Carousel
        items={allPost}
        slidesPerView={6}
        smSlidesPerView={2}
        spaceBetween={20}
        loop={true}
        gridRows={1}
      />
    </section>
  );
}
