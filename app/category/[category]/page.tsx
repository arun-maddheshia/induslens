import ImageComponent from '@/components/ImageComponent';
import ReadMore from '@/components/UI/ReadMore';
import { Share } from '@/components/UI/Share';
import { articles } from '@/data/articles';
import { categories } from '@/data/categories';
import { cn, getImageUrl, getFirstAuthorName } from '@/lib/utils';
import { Metadata } from 'next';

import Link from 'next/link';
import { notFound } from 'next/navigation';

type Props = {
  params: { category: string };
  searchParams: { name: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const articleCategory = categories.filter(
    (category) => category.slug === params.category,
  )[0];

  return {
    title: articleCategory?.name,
    description: articleCategory?.description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_API_URL}/articles/${articleCategory?.slug}`,
    },
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
    (category) => category.slug === params.category,
  )[0];

  if (!articleCategory) {
    notFound();
  }

  const isSingleGridView =
    articleCategory.id === 'IndusLens_OSINT' ||
    articleCategory.id === 'Worldview_India';

  const gridColumnClass = isSingleGridView
    ? 'lg:max-w-[60%] mx-auto'
    : 'lg:grid lg:grid-cols-2 gap-5 lg:max-w-[90%] mx-auto';

  const articleList = articles.filter(
    (article) => article.category === articleCategory.id,
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
    <section className="container mx-auto my-5 px-5 py-10 lg:px-0">
      <div
        className={cn(
          isSingleGridView
            ? 'mx-auto lg:max-w-[50%]'
            : 'mx-auto lg:max-w-[80%]',
        )}
      >
        <h1 className="mb-4 text-center text-4xl font-bold">
          {articleCategory ? articleCategory.name : ''}
        </h1>
        <p className="text-md mb-10 text-center">
          {articleCategory ? articleCategory.description : ''}
        </p>
      </div>
      <div className={gridColumnClass}>
        {articleList.map((article: Article) => (
          <div key={article._id} className="relative mb-5 border">
            <Link href={`/category/${articleCategory.slug}/${article.slug}`}>
              <ImageComponent
                src={getImageUrl(article.images, 'detailsPageBackground')}
                alt={article.name}
                width={810}
                height={540}
                className="mb-2 aspect-[11/7] object-cover"
              />
            </Link>
            <div className="relative p-5">
              <Link href={`/category/${articleCategory.slug}/${article.slug}`}>
                <h6 className="mb-4 text-2xl font-bold leading-8 text-black hover:underline md:text-3xl">
                  {article.name}
                </h6>
                <div className="pr-[40px]">
                  <ReadMore
                    text={article.excerpt}
                    maxLength={300}
                    className="mb-4"
                    href={`/category/${articleCategory.slug}/${article.slug}`}
                  ></ReadMore>
                </div>
                <p className="text-md mt-2 text-gray-500">
                  {getFirstAuthorName(article.author)}
                </p>
              </Link>
            </div>
            <div className="absolute bottom-2 right-4">
              <Share
                shareUrl={`${process.env.NEXT_PUBLIC_API_URL}/category/${articleCategory.slug}/${article.slug}`}
                title={article.name}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
