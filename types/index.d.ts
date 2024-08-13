// Enum for content types
declare type ContentType = 'news' | 'content-block' | 'articles' | 'anchor';

// Enum for source types
declare type SourceType = 'youtube' | 'audio/mp3';

declare type ImageCategory =
  | 'posterImage'
  | 'detailsPageBackground'
  | 'mobileDetailsPageBackground';

declare type AuthorObject = {
  id: string;
  name: string;
};

declare type ArticleAuthor = AuthorObject[] | string[];

// Article interface
declare interface Article {
  _id: string;
  newsType: string;
  agency: string;
  alternativeHeadline: string;
  ampValidationMessage: string;
  archivedAt: string;
  articleBody: string;
  author: ArticleAuthor;
  categories: string[];
  category: string;
  contentType: ContentType;
  dateCreated: string;
  dateModified: string;
  datePublished: string;
  diveContent?: string;
  editor: string;
  excerpt: string;
  expires: string;
  genre: string[];
  headline: string;
  keywords: string[];
  language: string;
  locationCreated?: string;
  mainEntityOfPage?: string;
  metaDescription: string;
  metaTitle: string;
  pageContent: string;
  publishedAt?: string;
  publisher: string;
  siteId: string;
  sourceType: string;
  subCategories: string[];
  tags: string[];
  url: string;
  key: number;
  contentType: ContentType;
  isContent: boolean;
  description: string;
  name: string;
  slug: string;
  status: string;
  visibility?: boolean;
  optionalfield?: string;
  createdAt: string;
  updatedAt: string;
  images: PostImage[];
}

// ArticleCategory interface
declare interface ArticleCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
}

// PostImage interface
declare interface PostImage {
  imageCategory: string;
  imageCategoryValue: string;
  imageDescription: string;
  imageUrl: string[];
  key: string;
}

// Author interface
declare interface Author {
  _id: string;
  name: string;
  aboutTheAnchor: string;
  anchorKey: string;
  email: string;
  contentType: ContentType;
  images: PostImage[];
  facebookUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  websiteUrl?: string;
  shows: string[];
  siteId: string;
  authorUrl?: string;
  countryName?: string;
  createdAt: string;
  description: string;
  status: string;
  key: number;
  slug?: string;
  publishedAt?: string;
  updatedAt?: string;
  isContent: boolean;
}

// VideoArticle interface
declare interface VideoArticle {
  ChannelName: string;
  _id: string;
  acquisitionDepartment: string;
  ageGroup: string[];
  author: string;
  cast: string[];
  category: string;
  channelId: string;
  contentId: string;
  contentKey: string;
  contentType: ContentType;
  duration?: string;
  genre: string[];
  language?: string;
  languageCode: string;
  metaDescription: string;
  metaTitle: string;
  notes: string;
  originalLanguage: string[];
  productionCountry: string[];
  productionHouse: string;
  productionYear: string;
  rights: string[];
  siteId: string;
  slug: string;
  sourceType: SourceType;
  status: string;
  streamingSource: string;
  supplier: string[];
  synopsis: string;
  tags: string[];
  translatedTitle: string;
  createdAt: string;
  images: PostImage[];
  isContent: boolean;
  key: number;
  name: string;
  publishedAt?: string;
  updatedAt: string;
}

// Eminence interface
declare interface Eminence {
  _id: string;
  author: string;
  content: string;
  contentType: string;
  countryName: string;
  createdAt: string;
  category?: string;
  excerpt: string;
  facebookUrl: string;
  images: PostImage[];
  instagramUrl: string;
  isContent?: boolean;
  key?: number;
  language?: string;
  linkedinUrl: string;
  name: string;
  pageContent?: string;
  publishedAt?: string;
  siteId?: string;
  slug: string;
  status: string;
  subtitle: string;
  subTitle?: string;
  twitterUrl: string;
  updatedAt?: string;
  websiteUrl: string;
}

declare interface PaginatedResponse<T> {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  data: T[];
  extra?: unknown;
}
