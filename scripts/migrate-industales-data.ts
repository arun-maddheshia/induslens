/**
 * One-time migration: import IndusTales anchors and articles into the production DB.
 * Sets siteId = 'industales' on all imported records.
 *
 * Usage:
 *   npx tsx scripts/migrate-industales-data.ts [--dry-run]
 *
 * Prerequisites:
 *   - DATABASE_URL must be set in .env
 *   - Run from the induslens-production root directory
 *   - Images are stored as relative paths (e.g. /assets/v2/...). These paths
 *     reference static files in the industales-nextjs project.
 *     TODO: run scripts/upload-local-assets-to-s3.ts after copying those assets
 *     into public/assets/ to migrate images to S3.
 */

import { PrismaClient } from "@prisma/client"
import { anchors } from "../../industales-nextjs/data/anchor"
import { articles } from "../../industales-nextjs/data/articles"

const prisma = new PrismaClient()
const SITE_ID = "industales"

// Map industales contentType strings to Prisma ContentType enum values
function mapContentType(ct: string): "NEWS" | "CONTENT_BLOCK" | "ARTICLES" | "ANCHOR" {
  switch (ct?.toLowerCase()) {
    case "news": return "NEWS"
    case "content-block":
    case "content_block": return "CONTENT_BLOCK"
    case "anchor": return "ANCHOR"
    default: return "ARTICLES"
  }
}

async function migrateAnchors(dryRun: boolean) {
  console.log(`\n=== Migrating ${anchors.length} anchors ===`)
  let created = 0, skipped = 0, errors = 0

  for (const anchor of anchors) {
    try {
      const data = {
        name: anchor.name,
        aboutTheAnchor: anchor.aboutTheAnchor || "",
        email: anchor.email || null,
        slug: anchor.slug || anchor.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        description: anchor.description || null,
        facebookUrl: anchor.facebookUrl || null,
        linkedinUrl: anchor.linkedinUrl || null,
        twitterUrl: anchor.twitterUrl || null,
        instagramUrl: anchor.instagramUrl || null,
        youtubeUrl: anchor.youtubeUrl || null,
        websiteUrl: anchor.websiteUrl || null,
        authorUrl: anchor.authorUrl || null,
        contentType: anchor.contentType || "anchor",
        countryName: anchor.countryName || null,
        status: anchor.status || "Published",
        isContent: anchor.isContent ?? true,
        siteId: SITE_ID,
        shows: anchor.shows || [],
        anchorKey: anchor.anchorKey || null,
        order: anchor.key || 1,
        publishedAt: anchor.publishedAt ? new Date(anchor.publishedAt) : null,
      }

      if (dryRun) {
        console.log(`[DRY] anchor: ${anchor.name} (${anchor._id})`)
        created++
        continue
      }

      await prisma.author.upsert({
        where: { id: anchor._id },
        create: {
          id: anchor._id,
          ...data,
          images: anchor.images?.length
            ? {
                create: anchor.images.map((img) => ({
                  imageCategory: img.imageCategory || "",
                  imageCategoryValue: img.imageCategoryValue || null,
                  imageDescription: img.imageDescription || null,
                  imageUrl: img.imageUrl || [],
                  key: img.key || null,
                })),
              }
            : undefined,
        },
        update: { siteId: SITE_ID },
      })
      created++
    } catch (err) {
      console.error(`  ERROR anchor ${anchor.name} (${anchor._id}):`, err)
      errors++
    }
  }

  console.log(`  created/updated: ${created}, skipped: ${skipped}, errors: ${errors}`)
}

async function migrateArticles(dryRun: boolean) {
  console.log(`\n=== Migrating ${articles.length} articles ===`)
  let created = 0, skipped = 0, errors = 0

  // Pre-fetch existing slugs to detect conflicts
  const existingSlugs = dryRun
    ? new Set<string>()
    : new Set((await prisma.article.findMany({ select: { slug: true, siteId: true } }))
        .filter((a) => a.siteId !== SITE_ID)
        .map((a) => a.slug))

  for (const article of articles) {
    try {
      const rawSlug = article.slug || article.headline.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
      const slug = existingSlugs.has(rawSlug) ? `industales-${rawSlug}` : rawSlug

      // Resolve authorId from the first author entry
      const authorRef = Array.isArray(article.author) && article.author.length > 0
        ? article.author[0]
        : null
      const authorId = authorRef && typeof authorRef === "object" && "id" in authorRef
        ? (authorRef as { id: string }).id
        : null

      const data = {
        headline: article.headline || "",
        alternativeHeadline: article.alternativeHeadline || null,
        excerpt: article.excerpt || "",
        articleBody: article.articleBody || "",
        pageContent: article.pageContent || null,
        diveContent: article.diveContent || null,
        description: article.description || null,
        contentType: mapContentType(article.contentType as string),
        category: article.category || null,
        subCategories: article.subCategories || [],
        genre: article.genre || [],
        tags: article.tags || [],
        keywords: article.keywords || [],
        language: article.language || "en",
        metaTitle: article.metaTitle || article.headline || "",
        metaDescription: article.metaDescription || article.excerpt || "",
        slug,
        status: (article.status?.toUpperCase() as "PUBLISHED" | "DRAFT" | "ARCHIVED") || "PUBLISHED",
        visibility: article.visibility ?? true,
        siteId: SITE_ID,
        authorId: authorId || null,
        publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
      }

      if (dryRun) {
        const conflict = existingSlugs.has(rawSlug) ? " (slug conflict → prefixed)" : ""
        console.log(`[DRY] article: ${article.headline.slice(0, 60)}${conflict}`)
        created++
        continue
      }

      await prisma.article.upsert({
        where: { id: article._id },
        create: {
          id: article._id,
          ...data,
          images: article.images?.length
            ? {
                create: article.images.map((img) => ({
                  imageCategory: img.imageCategory || "",
                  imageCategoryValue: img.imageCategoryValue || null,
                  imageDescription: img.imageDescription || null,
                  imageUrl: img.imageUrl || [],
                })),
              }
            : undefined,
        },
        update: { siteId: SITE_ID, slug },
      })
      created++
    } catch (err) {
      console.error(`  ERROR article ${article.headline?.slice(0, 40)} (${article._id}):`, err)
      errors++
    }
  }

  console.log(`  created/updated: ${created}, skipped: ${skipped}, errors: ${errors}`)
}

async function main() {
  const dryRun = process.argv.includes("--dry-run")
  if (dryRun) console.log("DRY RUN — no database writes\n")

  await migrateAnchors(dryRun)
  await migrateArticles(dryRun)

  console.log("\nDone.")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
