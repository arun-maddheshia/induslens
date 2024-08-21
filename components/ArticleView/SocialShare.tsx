import { LinkedinIcon, FacebookIcon, TwitterIcon } from '@/components/Icons';
import Tooltip from '@/components/UI/Tooltip';
import { CopyToClipboard } from '../CopyToClipboard';
import {
  getFacebookShareUrl,
  getFormattedDate,
  getLinkedinShareUrl,
  getTwitterShareUrl,
} from '@/lib/utils';
type SocialShare = {
  shareUrl: string;
  title: string;
  publishedDate: string;
};

const SocialShare = ({ shareUrl, title, publishedDate }: SocialShare) => {
  return (
    <div className="mb-4 flex justify-between border-b border-t border-slate-300 py-4">
      <div>{getFormattedDate(publishedDate)}</div>
      <div className="flex space-x-5">
        <Tooltip text="Share on Facebook">
          <a href={getFacebookShareUrl(shareUrl)} target="_blank">
            <FacebookIcon width={20} height={20} fill="#000" />
          </a>
        </Tooltip>
        <Tooltip text="Share on Twitter">
          <a href={getTwitterShareUrl(shareUrl, title)} target="_blank">
            <TwitterIcon width={20} height={20} fill="#000" />
          </a>
        </Tooltip>
        <Tooltip text="Share on Linkedin">
          <a href={getLinkedinShareUrl(shareUrl)} target="_blank">
            <LinkedinIcon width={20} height={20} fill="#000" />
          </a>
        </Tooltip>
        <Tooltip text="Copy the URL">
          <CopyToClipboard url={shareUrl} hasTitle={false} />
        </Tooltip>
      </div>
    </div>
  );
};

export default SocialShare;
