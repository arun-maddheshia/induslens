import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  resolveStoredImageToUrl,
  type MediaEntity,
} from '@/lib/image-storage';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncate(text: string, truncateLength: number) {
  return text.length > truncateLength
    ? text.slice(0, truncateLength - 1) + '...'
    : text;
}

export function getImageUrl(
  images: PostImage[],
  type: string,
  defaultImageUrl: string = '',
  entity: MediaEntity = 'articles',
): string {
  if (images && images.length > 0) {
    const matchedImage = images.find(
      (image) => image.imageCategoryValue === type,
    );
    if (!matchedImage) return defaultImageUrl;
    const raw = matchedImage.imageUrl[0] || '';
    if (!raw) return defaultImageUrl;
    return resolveStoredImageToUrl(
      raw,
      entity,
      matchedImage.imageCategoryValue || type,
    );
  }
  return defaultImageUrl;
}

export function normalizeText(text: string) {
  return text.replace('_', ' ').replace('-', ' ');
}

export function getFirstAuthorName(author: ArticleAuthor): string {
  if (Array.isArray(author) && author.length > 0) {
    if (typeof author[0] === 'string') {
      return author[0] as string;
    } else {
      return (author[0] as AuthorObject).name;
    }
  }
  return '';
}

export function isMeaningfulContent(html: string) {
  const strippedContent = html.replace(/<\/?[^>]+(>|$)/g, '').trim();
  return strippedContent.length > 0;
}

export function slugify(url: string) {
  return url
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getFormattedDate(date: string) {
  const newDate = new Date(date);
  const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });
  return formatter.format(newDate);
}

export function getFacebookShareUrl(url: string) {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

export function getTwitterShareUrl(url: string, title: string) {
  return `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
}

export function getLinkedinShareUrl(url: string) {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}
