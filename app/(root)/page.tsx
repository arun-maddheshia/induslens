import ImageComponent from '@/components/ImageComponent';
import TrendingVideo from '@/components/UI/TrendingVideo';
import Carousel from '@/components/UI/Carousel';
import { articles } from '@/data/articles';
import { categories } from '@/data/categories';
import { videoNews } from '@/data/video-news';
import { cn, getImageUrl, getFirstAuthorName } from '@/lib/utils';
import Link from 'next/link';
import FeaturedContributor from './_components/Contributors';
import FeaturedEminence from './_components/Eminence';
import FeaturedArticles from './_components/FeaturedArticles';
import { PageTitle } from './_components/FeaturedArticles/PageTitle';
import { Metadata } from 'next';
import ReadMore from '@/components/UI/ReadMore';
import { OtherArticlesSection } from './_components/OtherArticles';
import styles from './Home.module.scss';

const pageTitle =
  "IndusLens | Chronicling cutting-edge global perspectives on India's success stories";
const pageDescription =
  "Explore India's vibrant journey to 2050 as a global economic powerhouse, guided by insightful global perspectives on its innovative entrepreneurship, tech revolution, pivotal policies and its dazzling soft power.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_API_URL}`,
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    images: `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@Indus_Lens',
    title: pageTitle,
    description: pageDescription,
    images: `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
  },
};

export default function Home() {
  const articleCategories: ArticleCategory[] = categories;

  return (
    <div className="mx-auto w-full px-4 py-4 lg:container lg:py-10">
      <FeaturedArticles />

      <TrendingVideo />

      <section className="py-0 pb-20">
        <PageTitle title="IndusTV" />
        <div className="md:grid md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-4">
          {videoNews
            .filter((video) => video.category === 'industv')
            .map((video) => (
              <div key={`video_page_${video._id}`} className="mb-5 lg:mb-0">
                <Link
                  href={`/industv/${video.slug}`}
                  className="relative block"
                >
                  <ImageComponent
                    src={getImageUrl(video.images, 'detailsPageBackground')}
                    alt={video.name}
                    width={640}
                    height={427}
                    className="mb-2"
                  />
                  <span className="absolute bottom-1 right-1 inline-block rounded bg-black px-2 text-xs font-bold leading-6 text-white">
                    {video.duration}
                  </span>
                </Link>
                <h6 className="mb-2 text-lg font-bold leading-6 text-black hover:underline">
                  <Link href={`/industv/${video.slug}`}>{video.name}</Link>
                </h6>
              </div>
            ))}
        </div>
      </section>

      <section className="py-0 pb-20">
        <PageTitle href="indus-eminence" title="Indus Eminence" />
        <FeaturedEminence />
      </section>

      <section className="py-0 pb-20">
        <PageTitle title="Our Contributors" href="our-contributors" />
        <FeaturedContributor />
      </section>

      {articleCategories.map((category) => (
        <section
          key={`article_category_${category.id}`}
          className={cn('py-0 pb-7 lg:pb-10', styles.categoryListing)}
        >
          <PageTitle title={category.name} href={`category/${category.slug}`} />

          <ReadMore
            className="mb-5 text-lg"
            text={category.description}
            maxLength={300}
            href={`category/${category.slug}`}
          />
          <Carousel
            slidesPerView={4}
            mdSlidesPerView={3}
            gridRows={1}
            loop={true}
            spaceBetween={20}
            items={articles
              .filter(
                (article) =>
                  article.category === category.id && article.images.length,
              )
              .map((articleItem) => (
                <div key={articleItem._id} className="py-0 lg:py-4">
                  <Link
                    href={`category/${category.slug}?name=${articleItem.slug}`}
                  >
                    <ImageComponent
                      src={getImageUrl(articleItem.images, 'posterImage')}
                      alt={articleItem.name}
                      width={810}
                      height={540}
                      className="mb-2 aspect-[3/2]"
                    />
                  </Link>
                  <h6 className="mb-2 text-lg font-bold leading-6 text-black">
                    <Link
                      href={`category/${category.slug}?name=${articleItem.slug}`}
                      className="hover:underline"
                    >
                      {articleItem.name}
                    </Link>
                  </h6>
                  <p className="mb-2 text-sm text-gray-500">
                    {getFirstAuthorName(articleItem.author)}
                  </p>
                </div>
              ))}
          />
        </section>
      ))}

      <OtherArticlesSection articles={articles} />
    </div>
  );
}
