import React from 'react';

import ArticleView from '@/components/ArticleView';

type Props = {
  params: { slug: string };
};

export default async function page({ params }: Props) {
  console.log(params);
  return <ArticleView params={params} />;
}
