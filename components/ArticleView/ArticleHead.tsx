import React from 'react';

type ArticleHeadProps = {
  title: string;
  excerpt: string;
  authorName?: string;
};

const ArticleHead: React.FC<ArticleHeadProps> = ({
  title,
  excerpt,
  authorName,
}) => (
  <div>
    <h1 className="font-bold text-4xl mb-2">{title}</h1>
    <p className="text-xl pb-7">{excerpt}</p>
    {authorName && <p className="font-bold text-xl pb-7">{authorName}</p>}
  </div>
);

export default ArticleHead;
