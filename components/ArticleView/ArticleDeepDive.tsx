import { isMeaningfulContent } from '@/lib/utils';
import React from 'react';

type ArticleDeepDiveProps = {
  htmlContent: string;
};

const ArticleDeepDive: React.FC<ArticleDeepDiveProps> = ({ htmlContent }) => {
  if (!isMeaningfulContent(htmlContent)) {
    return null;
  }

  return (
    <div className="deepDive border bg-gray-100 p-10">
      <h6 className="mb-5 text-xl font-bold">Deep Dive</h6>
      <div
        className="htmlContent"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      ></div>
    </div>
  );
};

export default ArticleDeepDive;
