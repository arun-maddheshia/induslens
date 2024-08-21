'use client';

import React from 'react';
import { CopyLinkIcon } from './Icons';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

type CopyToClipboardProps = {
  url: string;
  hasTitle: boolean;
};

export const CopyToClipboard = (props: CopyToClipboardProps) => {
  const { url, hasTitle } = props;

  const handleCopyToClipboard = async (url: string) => {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(url);
      toast.success('The URL is now copied to your clipboard.');
    }
  };

  return (
    <button
      type="button"
      className={cn('m-0 border-0 p-0 outline-0', hasTitle ? 'flex' : '')}
      onClick={async () => await handleCopyToClipboard(url)}
    >
      <CopyLinkIcon width={20} height={20} />
      {hasTitle ? <>&nbsp;Copy Link</> : ''}
    </button>
  );
};
