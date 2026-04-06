'use client';

import { useEffect, useState } from 'react';
import Carousel from '@/components//UI/Carousel';
import { cn, getImageUrl } from '@/lib/utils';
import ImageComponent from '../../ImageComponent';
import Link from 'next/link';
import styles from './TrendingVideo.module.scss';

export default function TrendingVideo() {
  const [videos, setVideos] = useState<VideoArticle[]>([]);

  useEffect(() => {
    fetch('/api/trending-videos')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setVideos(data);
      })
      .catch(console.error);
  }, []);

  const allPost = videos.map((video) => (
    <div key={`video_${video._id}`}>
      <Link href={`/videos/${video.slug}`}>
        <ImageComponent
          src={getImageUrl(video.images, 'featuredImage')}
          alt={video.name}
          width={347}
          height={494}
          className="mb-2"
        />
      </Link>
      <h6 className="text-md mb-2 font-bold leading-6 text-black">
        <Link className="hover:underline" href={`/videos/${video.slug}`}>
          {video.name}
        </Link>
      </h6>
    </div>
  ));

  return (
    <section className={cn('py-20 pb-10', styles.trendingVideo)}>
      <h2 className="mb-5 text-3xl font-bold text-black">Trending Videos</h2>
      <Carousel
        items={allPost}
        slidesPerView={6}
        smSlidesPerView={2}
        mdSlidesPerView={3}
        spaceBetween={20}
        loop={true}
        gridRows={1}
      />
    </section>
  );
}
