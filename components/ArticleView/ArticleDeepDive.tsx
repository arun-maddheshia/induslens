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
    <div className="border bg-gray-100 p-10 deepDive">
      <h6 className="font-bold text-xl mb-5">Deep Dive</h6>
      <div dangerouslySetInnerHTML={{ __html: htmlContent }}></div>
    </div>
  );
};

export default ArticleDeepDive;
