'use client';
import React from 'react';

type ArticleHeadProps = {
  title: string;
  excerpt: string;
  authorName?: string;
  onAuthorClick?: () => void;
};

const ArticleHead: React.FC<ArticleHeadProps> = ({
  title,
  excerpt,
  authorName,
  onAuthorClick,
}) => (
  <div>
    <h1 className="font-bold text-4xl mb-2">{title}</h1>
    <p className="text-xl pb-7">{excerpt}</p>
    {authorName && (
      <button
        onClick={onAuthorClick}
        className="font-bold text-md pb-7 hover:underline"
      >
        {authorName}
      </button>
    )}
  </div>
);

export default ArticleHead;
