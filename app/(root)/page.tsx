import ImageComponent from '@/components/ImageComponent';
import TrendingVideo from '@/components/TrendingVideo';
import Carousel from '@/components/UI/Carousel';
import { articles } from '@/data/articles';
import { categories } from '@/data/categories';
import { videoNews } from '@/data/video-news';
import { getArticleImageUrl, getFirstAuthorName, truncate } from '@/lib/utils';
import Link from 'next/link';
import FeaturedContributor from './_components/Contributors';
import FeaturedEminence from './_components/Eminence';
import FeaturedArticles from './_components/FeaturedArticles';
import { PageTitle } from './_components/FeaturedArticles/PageTitle';
import { Metadata } from 'next';

const pageTitle =
  "IndusLens | Chronicling cutting-edge global perspectives on India's success stories";
const pageDescription =
  "Explore India's vibrant journey to 2050 as a global economic powerhouse, guided by insightful global perspectives on its innovative entrepreneurship, tech revolution, pivotal policies and its dazzling soft power.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
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
    <div className="lg:container mx-auto w-full px-4 lg:px-0  py-4 lg:py-10">
      <FeaturedArticles />

      <TrendingVideo />

      <section className="py-0 pb-20">
        <PageTitle title="IndusTV" />
        <div className="lg:grid lg:grid-cols-4 lg:gap-4 ">
          {videoNews
            .filter((video) => video.category === 'industv')
            .map((video) => (
              <div key={`video_page_${video._id}`} className="mb-5 lg:mb-0">
                <Link href={`/industv/${video.slug}`}>
                  <ImageComponent
                    src={getArticleImageUrl(
                      video.images,
                      'detailsPageBackground'
                    )}
                    alt={video.name}
                    width={640}
                    height={427}
                    className="mb-2"
                  />
                </Link>
                <h6 className="text-black mb-2 text-lg leading-6 font-bold hover:underline">
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
          className="py-0 pb-7 lg:pb-20"
        >
          <PageTitle title={category.name} href={`category/${category.slug}`} />
          <p className="text-lg mb-5 line-clamp-2">{category.description}</p>
          <Carousel
            slidesPerView={4}
            gridRows={1}
            loop={true}
            spaceBetween={20}
            items={articles
              .filter(
                (article) =>
                  article.category === category.id && article.images.length
              )
              .map((articleItem) => (
                <div key={articleItem._id} className="py-0 lg:py-4">
                  <Link
                    href={`category/${category.slug}?name=${articleItem.slug}`}
                  >
                    <ImageComponent
                      src={getArticleImageUrl(
                        articleItem.images,
                        'detailsPageBackground'
                      )}
                      alt={articleItem.name}
                      width={810}
                      height={540}
                      className="mb-2 aspect-auto"
                    />
                  </Link>
                  <h6 className="text-black mb-2 text-lg leading-6 font-bold">
                    {articleItem.name}
                  </h6>
                  <p className="text-sm mb-2 text-gray-500">
                    {getFirstAuthorName(articleItem.author)}
                  </p>
                </div>
              ))}
          />
        </section>
      ))}

      <section className="py-0 pb-20">
        <PageTitle title="Other Stories" />
        <div className="lg:grid lg:grid-cols-2 gap-5">
          {[11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26].map(
            (articleIndex) => (
              <div
                key={`other_stories_${articleIndex}`}
                className="border mb-5 lg:mb-0"
              >
                <Link href={`articles/${articles[articleIndex].slug}`}>
                  <ImageComponent
                    src={getArticleImageUrl(
                      articles[articleIndex].images,
                      'detailsPageBackground'
                    )}
                    width={640}
                    height={427}
                    alt={articles[articleIndex].name}
                  />
                </Link>
                <div className="p-5">
                  <h5 className="text-xl lg:text-3xl font-bold mb-2">
                    {articles[articleIndex].name}
                  </h5>
                  <p className="text-md lg:text-lg mb-3 line-clamp-2">
                    {articles[articleIndex].excerpt}
                  </p>
                  <p className="text-gray-500">
                    {getFirstAuthorName(articles[articleIndex].author)}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}
