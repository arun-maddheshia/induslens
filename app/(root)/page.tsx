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

export default function Home() {
  const articleCategories: ArticleCategory[] = categories;

  return (
    <div className="lg:container w-full lg:px-0 px-5 mx-auto py-10">
      <FeaturedArticles />

      <TrendingVideo />

      <section className="py-0 pb-20">
        <PageTitle title="IndusTV" />
        <div className="grid grid-cols-4 gap-4">
          {videoNews
            .filter((video) => video.category === 'industv')
            .map((video) => (
              <div key={video._id}>
                <Link href={`/industv/${video.slug}`}>
                  <ImageComponent
                    src={getArticleImageUrl(
                      video.images,
                      'detailsPageBackground'
                    )}
                    alt={video.name}
                    width={640}
                    height={427}
                    className="mb-2 aspect-auto"
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
        <section key={category.id} className="py-0 pb-20">
          <PageTitle title={category.name} href={`category/${category.slug}`} />
          <p className="text-lg mb-5">{truncate(category.description, 300)}</p>
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
                <div key={articleItem._id} className="py-10">
                  <Link href={`category/${category.slug}?${articleItem.slug}`}>
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
                    {/* @ts-ignore */}
                    {articleItem.author.map((author) => author.name)}
                  </p>
                </div>
              ))}
          />
        </section>
      ))}

      <section className="py-0 pb-20">
        <PageTitle title="Other Stories" />
        <div className="lg:grid lg:grid-cols-2 gap-5">
          {[11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25].map(
            (articleIndex) => (
              <>
                <div className="border mb-5 lg:mb-0">
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
                    <h5 className="text-3xl font-bold mb-2">
                      {articles[articleIndex].name}
                    </h5>
                    <p className="text-lg mb-3 line-clamp-2">
                      {articles[articleIndex].excerpt}
                    </p>
                    <p className="text-gray-500">
                      {getFirstAuthorName(articles[articleIndex].author)}
                    </p>
                  </div>
                </div>
              </>
            )
          )}
        </div>
      </section>
    </div>
  );
}
