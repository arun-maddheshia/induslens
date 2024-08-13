import Link from 'next/link';
import React from 'react';

type PageTitleProps = {
  title: string;
  href?: string;
};

export const PageTitle = ({ title, href }: PageTitleProps) => {
  if (!href) {
    return <h2 className="font-bold text-3xl text-black mb-5">{title}</h2>;
  }

  return (
    <h2 className="font-bold text-3xl text-black mb-5">
      <Link className="hover:underline" href={href}>
        {title}
      </Link>
    </h2>
  );
};
