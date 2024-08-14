import React from 'react';
import { TwitterFollowIcon } from '@/components/Icons';
import Link from 'next/link';

export default function StickyFollowTwitter() {
  return (
    <Link
      href="https://twitter.com/Indus_Lens"
      target="_blank"
      className="w-[210px] h-[50px] bg-[#1da1f2] z-10 fixed bottom-5 right-5 rounded-full flex items-center justify-between pl-4 pr-1 pt-1 pb-1 shadow-lg"
    >
      <span className="text-[12px] text-white font-bold">
        Follow to stay updated
      </span>
      <TwitterFollowIcon width={44} height={44} />
    </Link>
  );
}
