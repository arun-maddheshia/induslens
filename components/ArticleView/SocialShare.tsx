'use client';

import {
  LinkedinIcon,
  FacebookIcon,
  TwitterIcon,
  CopyLinkIcon,
} from '@/components/Icons';
import Tooltip from '@/components/UI/Tooltip';
import toast from 'react-hot-toast';

type SocialShare = {
  shareUrl: string;
  title: string;
  description: string;
  shareImage: string;
};

const SocialShare = ({
  shareUrl,
  title,
  description,
  shareImage,
}: SocialShare) => {
  const handleCopyToClipboard = async () => {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share URL copied successfully!');
    }
  };

  return (
    <div className="flex justify-between border-slate-300 border-t border-b py-4 mb-4">
      <div>22 June 2024</div>
      <div className="flex space-x-5">
        <Tooltip text="Share on Facebook">
          <a href="#" target="_blank">
            <FacebookIcon width={20} height={20} fill="#000" />
          </a>
        </Tooltip>
        <Tooltip text="Share on Twitter">
          <a
            href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${description}`}
            target="_blank"
          >
            <TwitterIcon width={20} height={20} fill="#000" />
          </a>
        </Tooltip>
        <Tooltip text="Share on Linkedin">
          <a
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${title}&summary=${description}&source=${shareImage}`}
            target="_blank"
          >
            <LinkedinIcon width={20} height={20} fill="#000" />
          </a>
        </Tooltip>
        <Tooltip text="Copy the URL">
          <button
            type="button"
            className="outline-0 border-0 p-0 m-0"
            onClick={async () => await handleCopyToClipboard()}
          >
            <CopyLinkIcon width={20} height={20} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default SocialShare;
