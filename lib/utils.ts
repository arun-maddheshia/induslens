import { type ClassValue, clsx } from 'clsx';
import toast from 'react-hot-toast';
import { twMerge } from 'tailwind-merge';

/*
    Merge multiple classnames
*/
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncate(text: string, truncateLength: number) {
  return text.length > truncateLength
    ? text.slice(0, truncateLength - 1) + '...'
    : text;
}

export function getArticleImageUrl(
  images: PostImage[],
  type: string,
  defaultImageUrl: string = ''
): string {
  if (images && images.length > 0) {
    const matchedImage = images.find(
      (image) => image.imageCategoryValue === type
    );
    return matchedImage ? matchedImage.imageUrl[0] : defaultImageUrl;
  }
  return defaultImageUrl;
}

export function normalizeText(text: string) {
  return text.replace('_', ' ').replace('-', ' ');
}

/**
 * Extracts the name of the first author from the given input.
 * @param author - The author input, which can be an array of author objects or an array of names.
 * @returns The name of the first author or an empty string if no author is found.
 */
export function getFirstAuthorName(author: ArticleAuthor): string {
  if (Array.isArray(author) && author.length > 0) {
    if (typeof author[0] === 'string') {
      // If the first element is a string, return it directly
      return author[0] as string;
    } else {
      // Assume the array contains objects with 'name' property
      return (author[0] as AuthorObject).name;
    }
  }
  return '';
}

// export const getFallbackImageUrl = () => '/fallback-image.jpg';
// export const getPlaceholderImageUrl = () => '/placeholder-image.jpg';

export function isMeaningfulContent(html: string) {
  // Simple client-side check for non-empty content
  // Strip HTML tags and whitespace
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
  const formattedDate = formatter.format(newDate);
  return formattedDate;
}

export function getFacebookShareUrl(url: string) {
  const encodedUrl = encodeURIComponent(url);
  return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
}

export function getTwitterShareUrl(url: string, title: string) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
}

export function getLinkedinShareUrl(url: string) {
  const encodedUrl = encodeURIComponent(url);
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
}
