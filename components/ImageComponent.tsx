import Image from 'next/image';
// import { getFallbackImageUrl } from '@/lib/utils';

interface ImageComponentProps {
  src: string;
  alt: string;
  /** Use with a sized parent (`relative` + aspect ratio). Omit `width`/`height` when true. */
  fill?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
  className?: string;
}

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#eee" offset="20%" />
      <stop stop-color="#fff" offset="50%" />
      <stop stop-color="#eee" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#eee" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

const ImageComponent = ({
  src,
  alt,
  fill,
  sizes,
  width,
  height,
  className,
}: ImageComponentProps) => {
  // const imageUrl = src || getFallbackImageUrl();

  const dims =
    fill === true
      ? { fill: true, sizes: sizes ?? '(max-width: 1024px) 100vw, 45vw' }
      : { width: width!, height: height! };

  return (
    <Image
      src={src}
      alt={alt}
      {...dims}
      className={className}
      placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
      loading="lazy"
    />
  );
};

export default ImageComponent;
