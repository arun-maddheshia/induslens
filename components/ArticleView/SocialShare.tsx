// components/SocialShare.tsx
import React from 'react';
import {
  LinkedinIcon,
  FacebookIcon,
  TwitterIcon,
  CopyLinkIcon,
} from '@/components/Icons';
import Tooltip from '@/components/UI/Tooltip';

const SocialShare: React.FC = () => (
  <div className="flex justify-between border-slate-300 border-t border-b py-4 mb-4">
    <div>22 June 2024</div>
    <div className="flex space-x-5">
      <Tooltip text="Share on Facebook">
        <a href="#" target="_blank">
          <FacebookIcon width={20} height={20} fill="#000" />
        </a>
      </Tooltip>
      <Tooltip text="Share on Twitter">
        <a href="#" target="_blank">
          <TwitterIcon width={20} height={20} fill="#000" />
        </a>
      </Tooltip>
      <Tooltip text="Share on Linkedin">
        <a href="#" target="_blank">
          <LinkedinIcon width={20} height={20} fill="#000" />
        </a>
      </Tooltip>
      <Tooltip text="Copy the URL">
        <a href="#" target="_blank">
          <CopyLinkIcon width={20} height={20} />
        </a>
      </Tooltip>
    </div>
  </div>
);

export default SocialShare;
