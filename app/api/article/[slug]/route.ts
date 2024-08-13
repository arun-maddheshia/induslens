import { anchors } from '@/data/anchor';
import { articles } from '@/data/articles';

import { NextResponse, NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: { slug: string } }
) {
  const { params } = context;

  if (params.slug) {
    const article = articles.find((article) => article.slug === params.slug);
    let author: any;
    if (article) {
      const authors = article.author.map((allAuthors) => allAuthors);

      if (authors && authors.length) {
        author = anchors.find(
          // @ts-ignore
          (anchor) => anchor._id === authors[0].id
        );
      }
    }

    return NextResponse.json({
      status: 200,
      data: { article: article, author: author },
      message: 'Article details',
    });
  }

  return NextResponse.json({
    status: 404,
    message: 'Article not found',
  });
}
