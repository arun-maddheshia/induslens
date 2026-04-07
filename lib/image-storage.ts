/**
 * Media storage: DB keeps filenames (or legacy full URLs / paths).
 * Public URLs are built from NEXT_PUBLIC_MEDIA_BASE_URL (or AWS bucket+region) + images/{entity}/{folder}/{filename}.
 */

export type MediaEntity = "articles" | "authors" | "videos" | "eminence"

const ENTITY_FOLDER: Record<
  MediaEntity,
  Partial<Record<string, string>>
> = {
  articles: {
    posterImage: "poster-image",
    detailsPageBackground: "details-background",
    mobileDetailsPageBackground: "mobile-details-background",
  },
  authors: {
    mobileDetailsPageBackground: "mobile-details-background",
    avatar: "mobile-details-background",
  },
  videos: {
    featuredImage: "thumbnail-image",
    detailsPageBackground: "details-background",
    posterImage: "poster-image",
  },
  eminence: {
    mobileDetailsPageBackground: "content-blocks/mobile-details-background",
  },
}

export function getMediaBaseUrl(): string {
  const explicit =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_MEDIA_BASE_URL
      ? process.env.NEXT_PUBLIC_MEDIA_BASE_URL.trim().replace(/\/$/, "")
      : ""
  if (explicit) return explicit

  const bucket =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME ||
        process.env.AWS_S3_BUCKET_NAME
      : ""
  const region =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_AWS_REGION ||
        process.env.AWS_REGION ||
        "ap-south-1"
      : "ap-south-1"
  if (bucket) {
    return `https://${bucket}.s3.${region}.amazonaws.com`
  }
  return ""
}

export function folderPathForSlot(
  entity: MediaEntity,
  imageCategoryValue: string | null | undefined
): string {
  const v = imageCategoryValue || ""
  const mapped = ENTITY_FOLDER[entity]?.[v]
  if (mapped) return mapped
  return v
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "")
    .replace(/_/g, "-")
}

/**
 * Resolve a stored value to a browser-ready URL (absolute https, or legacy /assets path).
 */
export function resolveStoredImageToUrl(
  stored: string,
  entity: MediaEntity,
  imageCategoryValue: string | null | undefined
): string {
  const trimmed = (stored || "").trim()
  if (!trimmed) return ""

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  if (trimmed.startsWith("/")) {
    return trimmed
  }

  const base = getMediaBaseUrl()
  if (!base) {
    return trimmed
  }

  if (trimmed.startsWith("images/")) {
    return `${base}/${trimmed}`
  }

  const folder = folderPathForSlot(entity, imageCategoryValue)
  return `${base}/images/${entity}/${folder}/${trimmed}`
}

export type ImageRow = {
  imageCategory: string
  imageCategoryValue?: string | null
  imageDescription?: string | null
  imageUrl: string[]
  key?: string | null
}

export function hydratePostImages<T extends ImageRow>(
  images: T[] | null | undefined,
  entity: MediaEntity
): T[] {
  if (!images?.length) return []
  return images.map((img) => ({
    ...img,
    imageUrl: (img.imageUrl || []).map((u) =>
      resolveStoredImageToUrl(u, entity, img.imageCategoryValue)
    ),
  }))
}

/** Extract filename from a full S3 URL, path, or return as-is if already a filename. */
export function normalizeToStoredFileName(input: string): string {
  const s = (input || "").trim()
  if (!s) return ""

  if (/^https?:\/\//i.test(s)) {
    try {
      const path = new URL(s).pathname
      const seg = path.split("/").filter(Boolean).pop()
      return seg || s
    } catch {
      return s
    }
  }

  if (s.startsWith("/")) {
    return s.split("/").filter(Boolean).pop() || s
  }

  if (s.startsWith("images/")) {
    return s.split("/").filter(Boolean).pop() || s
  }

  return s
}

export function normalizeImageUrlArrayForStorage(urls: string[] | undefined): string[] {
  if (!urls?.length) return []
  return urls.map(normalizeToStoredFileName).filter(Boolean)
}

export function normalizeImagesForStorage<
  T extends { imageUrl: string[]; imageCategoryValue?: string | null }
>(images: T[] | undefined | null): T[] {
  if (!images?.length) return []
  return images.map((img) => ({
    ...img,
    imageUrl: normalizeImageUrlArrayForStorage(img.imageUrl),
  }))
}

/** Build absolute URL for OG / Twitter when the resolved value may be https, site-relative, or empty. */
export function absoluteUrlForOg(
  resolvedPathOrUrl: string,
  siteBase: string,
  fallbackPath = "/social.png"
): string {
  const base = (siteBase || "").replace(/\/$/, "")
  const u = (resolvedPathOrUrl || "").trim()
  if (!u) return `${base}${fallbackPath}`
  if (/^https?:\/\//i.test(u)) return u
  return `${base}${u.startsWith("/") ? u : `/${u}`}`
}
