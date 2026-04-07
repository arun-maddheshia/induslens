/**
 * Normalize ArticleImage / AuthorImage / VideoImage / EminenceImage.imageUrl[]
 * to store only filenames (not full HTTPS URLs or /assets/... paths).
 *
 * Run after uploading assets to S3. Safe to run multiple times.
 *
 * Usage: npx tsx scripts/migrate-db-images-to-filenames.ts [--dry-run]
 */

import { PrismaClient } from "@prisma/client"
import { normalizeToStoredFileName } from "../lib/image-storage"

const prisma = new PrismaClient()

async function main() {
  const dryRun = process.argv.includes("--dry-run")

  const tables = [
    { name: "ArticleImage" as const, rows: await prisma.articleImage.findMany({ select: { id: true, imageUrl: true } }) },
    { name: "AuthorImage" as const, rows: await prisma.authorImage.findMany({ select: { id: true, imageUrl: true } }) },
    { name: "VideoImage" as const, rows: await prisma.videoImage.findMany({ select: { id: true, imageUrl: true } }) },
    { name: "EminenceImage" as const, rows: await prisma.eminenceImage.findMany({ select: { id: true, imageUrl: true } }) },
  ]

  for (const { name, rows } of tables) {
    let updated = 0
    for (const row of rows) {
      const next = row.imageUrl.map((u) => normalizeToStoredFileName(u))
      const same =
        next.length === row.imageUrl.length &&
        next.every((v, i) => v === row.imageUrl[i])
      if (same) continue
      updated++
      if (dryRun) {
        console.log(`[${name}] ${row.id}:`, row.imageUrl, "->", next)
        continue
      }
      if (name === "ArticleImage") {
        await prisma.articleImage.update({ where: { id: row.id }, data: { imageUrl: next } })
      } else if (name === "AuthorImage") {
        await prisma.authorImage.update({ where: { id: row.id }, data: { imageUrl: next } })
      } else if (name === "VideoImage") {
        await prisma.videoImage.update({ where: { id: row.id }, data: { imageUrl: next } })
      } else {
        await prisma.eminenceImage.update({ where: { id: row.id }, data: { imageUrl: next } })
      }
    }
    console.log(`[${name}] ${dryRun ? "would update" : "updated"} ${updated} row(s)`)
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
