/**
 * Upload files under public/assets/* to S3 and optionally update Prisma image rows
 * so imageUrl[] stores filenames for values that pointed at those local/S3 paths.
 *
 * Requires: AWS_S3_BUCKET_NAME, AWS credentials; DATABASE_URL for DB sync.
 *
 * Usage:
 *   npx tsx scripts/upload-local-assets-to-s3.ts [--dry-run] [--no-db]
 */

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { PrismaClient } from "@prisma/client"
import * as fs from "fs"
import * as path from "path"

const ASSETS_ROOT = path.join(process.cwd(), "public", "assets")

export type UploadedAssetRef = {
  /** Path under public/assets, e.g. articles/poster-image/foo.jpg */
  relFromAssets: string
  filename: string
  s3Key: string
}

function relPathToS3Key(relFromAssets: string): string | null {
  const r = relFromAssets.replace(/\\/g, "/")
  if (r.startsWith("articles/")) {
    return `images/articles/${r.slice("articles/".length)}`
  }
  if (r.startsWith("videos/")) {
    return `images/videos/${r.slice("videos/".length)}`
  }
  if (r.startsWith("anchors/")) {
    return `images/authors/${r.slice("anchors/".length)}`
  }
  if (r.startsWith("content-blocks/")) {
    return `images/eminence/content-blocks/${r.slice("content-blocks/".length)}`
  }
  return null
}

function walkFiles(dir: string): string[] {
  const out: string[] = []
  if (!fs.existsSync(dir)) return out
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) out.push(...walkFiles(p))
    else out.push(p)
  }
  return out
}

function contentType(file: string): string {
  const ext = path.extname(file).toLowerCase()
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
  }
  return map[ext] || "application/octet-stream"
}

function pathnameOf(stored: string): string {
  const s = stored.trim()
  if (!s) return ""
  if (/^https?:\/\//i.test(s)) {
    try {
      return new URL(s).pathname
    } catch {
      return s
    }
  }
  return s.startsWith("/") ? s : `/${s}`
}

/**
 * If `stored` refers to this asset (local /assets/... or same path on S3), return filename to store.
 */
function replacementFilename(
  stored: string,
  relFromAssets: string,
  filename: string
): string | null {
  const t = stored.trim()
  if (!t) return null
  if (t === filename) return null

  const r = relFromAssets.replace(/\\/g, "/")
  const p = pathnameOf(t)
  const suffix = "/" + r
  if (p.endsWith(suffix) || p === "/assets/" + r) {
    return filename
  }
  return null
}

function mapImageUrlArray(
  urls: string[],
  assetsSortedLongestFirst: UploadedAssetRef[]
): string[] | null {
  let changed = false
  const next = urls.map((u) => {
    for (const a of assetsSortedLongestFirst) {
      const rep = replacementFilename(u, a.relFromAssets, a.filename)
      if (rep !== null) {
        changed = true
        return rep
      }
    }
    return u
  })
  return changed ? next : null
}

async function syncImageUrlsInDatabase(
  prisma: PrismaClient,
  assets: UploadedAssetRef[],
  dryRun: boolean
) {
  if (assets.length === 0) {
    console.log("[db] no mapped assets to sync")
    return
  }

  const sorted = [...assets].sort(
    (a, b) => b.relFromAssets.length - a.relFromAssets.length
  )

  const tables = [
    {
      name: "ArticleImage" as const,
      rows: await prisma.articleImage.findMany({
        select: { id: true, imageUrl: true },
      }),
    },
    {
      name: "AuthorImage" as const,
      rows: await prisma.authorImage.findMany({
        select: { id: true, imageUrl: true },
      }),
    },
    {
      name: "VideoImage" as const,
      rows: await prisma.videoImage.findMany({
        select: { id: true, imageUrl: true },
      }),
    },
    {
      name: "EminenceImage" as const,
      rows: await prisma.eminenceImage.findMany({
        select: { id: true, imageUrl: true },
      }),
    },
  ]

  for (const { name, rows } of tables) {
    let updated = 0
    for (const row of rows) {
      const next = mapImageUrlArray(row.imageUrl, sorted)
      if (!next) continue
      updated++
      if (dryRun) {
        console.log(`[db dry-run] ${name} ${row.id}:`, row.imageUrl, "->", next)
        continue
      }
      if (name === "ArticleImage") {
        await prisma.articleImage.update({
          where: { id: row.id },
          data: { imageUrl: next },
        })
      } else if (name === "AuthorImage") {
        await prisma.authorImage.update({
          where: { id: row.id },
          data: { imageUrl: next },
        })
      } else if (name === "VideoImage") {
        await prisma.videoImage.update({
          where: { id: row.id },
          data: { imageUrl: next },
        })
      } else {
        await prisma.eminenceImage.update({
          where: { id: row.id },
          data: { imageUrl: next },
        })
      }
    }
    console.log(
      `[db] ${name} ${dryRun ? "would update" : "updated"} ${updated} row(s)`
    )
  }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run")
  const noDb = process.argv.includes("--no-db")
  const region = process.env.AWS_REGION || "ap-south-1"
  const bucket = process.env.AWS_S3_BUCKET_NAME
  if (!bucket && !dryRun) {
    console.error("Set AWS_S3_BUCKET_NAME (and AWS credentials) to upload.")
    process.exit(1)
  }

  const client = dryRun
    ? null
    : new S3Client({
        region,
        credentials: process.env.AWS_ACCESS_KEY_ID
          ? {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            }
          : undefined,
      })

  const files = walkFiles(ASSETS_ROOT)
  let uploaded = 0
  let skipped = 0
  const uploadedAssets: UploadedAssetRef[] = []

  for (const abs of files) {
    const rel = path.relative(ASSETS_ROOT, abs).replace(/\\/g, "/")
    const key = relPathToS3Key(rel)
    if (!key) {
      skipped++
      console.log(`[skip] no mapping: ${rel}`)
      continue
    }
    const body = fs.readFileSync(abs)
    const filename = path.basename(abs)

    uploadedAssets.push({
      relFromAssets: rel,
      filename,
      s3Key: key,
    })

    if (dryRun) {
      console.log(`[dry-run] ${key} (${body.length} bytes)`)
      uploaded++
      continue
    }

    await client!.send(
      new PutObjectCommand({
        Bucket: bucket!,
        Key: key,
        Body: body,
        ContentType: contentType(abs),
      })
    )
    uploaded++
    console.log(`Uploaded ${key}`)
  }

  console.log(`Done. uploaded=${uploaded} skipped_unmapped=${skipped}`)

  if (noDb) {
    console.log("[db] skipped (--no-db)")
    return
  }

  if (!process.env.DATABASE_URL) {
    console.warn(
      "[db] DATABASE_URL not set — skip DB sync. Set it to update imageUrl rows."
    )
    return
  }

  const prisma = new PrismaClient()
  try {
    await syncImageUrlsInDatabase(prisma, uploadedAssets, dryRun)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
