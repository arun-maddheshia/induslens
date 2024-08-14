import ImageComponent from '@/components/ImageComponent';
import ReadMore from '@/components/UI/ReadMore';
import { articles } from '@/data/articles';
import { categories } from '@/data/categories';
import { cn, getArticleImageUrl, getFirstAuthorName } from '@/lib/utils';
import { Metadata } from 'next';

import Link from 'next/link';

type Props = {
  params: { category: string };
  searchParams: { name: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const articleCategory = categories.filter(
    (category) => category.slug === params.category
  )[0];

  return {
    title: articleCategory?.name,
    description: articleCategory?.description,
    openGraph: {
      title: articleCategory?.name,
      description: articleCategory?.description,
      images: `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@Indus_Lens',
      title: articleCategory?.name,
      description: articleCategory?.description,
      images: `${process.env.NEXT_PUBLIC_API_URL}/social.png`,
    },
  };
}

export default async function page({ params, searchParams }: Props) {
  const { name } = searchParams;
  const articleCategory = categories.filter(
    (category) => category.slug === params.category
  )[0];

  const isSingleGridView =
    articleCategory.id === 'IndusLens_OSINT' ||
    articleCategory.id === 'Worldview_India';

  const gridColumnClass = isSingleGridView
    ? 'lg:max-w-[60%] mx-auto'
    : 'lg:grid lg:grid-cols-2 gap-5 lg:max-w-[90%] mx-auto';

  const articleList = articles.filter(
    (article) => article.category === articleCategory.id
  );

  if (name && articleList.length) {
    articleList.sort((a, b) => {
      const aIsArticle = a.slug === name;
      const bIsArticle = b.slug === name;

      if (aIsArticle && !bIsArticle) return -1;
      if (!aIsArticle && bIsArticle) return 1;
      return 0;
    });
  }

  return (
    <section className="py-10 my-5 container mx-auto px-5 lg:px-0">
      <div
        className={cn(
          isSingleGridView ? 'mx-auto lg:max-w-[50%]' : 'mx-auto lg:max-w-[80%]'
        )}
      >
        <h1 className="font-bold text-center text-4xl mb-4">
          {articleCategory ? articleCategory.name : ''}
        </h1>
        <p className="text-md text-center mb-10">
          {articleCategory ? articleCategory.description : ''}
        </p>
      </div>
      <div className={gridColumnClass}>
        {articleList.map((article: Article) => (
          <div key={article._id} className="border mb-5">
            <Link href={`/category/${articleCategory.slug}/${article.slug}`}>
              <ImageComponent
                src={getArticleImageUrl(
                  article.images,
                  'detailsPageBackground'
                )}
                alt={article.name}
                width={810}
                height={540}
                className="mb-2 aspect-[11/7] object-cover"
              />
            </Link>
            <div className="p-5">
              <h6 className="text-black text-2xl md:text-3xl leading-8 font-bold mb-4">
                <Link
                  href={`/category/${articleCategory.slug}/${article.slug}`}
                  className="hover:underline"
                >
                  {article.name}
                </Link>
              </h6>
              <ReadMore
                text={article.excerpt}
                maxLength={300}
                className="mb-4"
                href={`/category/${articleCategory.slug}/${article.slug}`}
              ></ReadMore>
              <p className="text-md mt-2 text-gray-500">
                {getFirstAuthorName(article.author)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
