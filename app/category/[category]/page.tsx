import ImageComponent from '@/components/ImageComponent';
import { articles } from '@/data/articles';
import { categories } from '@/data/categories';
import { getArticleImageUrl, getFirstAuthorName } from '@/lib/utils';

import Link from 'next/link';

type Props = {
  params: { category: string };
};

export default async function page({ params }: Props) {
  const articleCategory = categories.filter(
    (category) => category.slug === params.category
  )[0];

  const articleList = articles.filter(
    (article) => article.category === articleCategory.id
  );
  return (
    <section className="py-10 my-5 container mx-auto  px-5 lg:px-0">
      <h1 className="font-bold text-center text-4xl mb-4">
        {articleCategory ? articleCategory.name : ''}
      </h1>
      <p className="text-md text-center mb-10">
        {articleCategory ? articleCategory.description : ''}
      </p>
      <div className="lg:grid lg:grid-cols-2 gap-10">
        {articleList.map((article: Article) => (
          <div key={article._id} className="border mb-5 lg:mb-0">
            <Link href={`/category/${articleCategory.slug}/${article.slug}`}>
              <ImageComponent
                src={getArticleImageUrl(
                  article.images,
                  'detailsPageBackground'
                )}
                alt={article.name}
                width={810}
                height={540}
                className="mb-2 aspect-auto"
              />
            </Link>
            <div className="p-5">
              <h6 className="text-black text-3xl leading-6 font-bold mb-4">
                {article.name}
              </h6>
              <p className=" mb-4">{article.excerpt}</p>
              <p className="text-sm mb-2 text-gray-500">
                {getFirstAuthorName(article.author)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
