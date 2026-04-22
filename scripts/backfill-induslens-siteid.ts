/**
 * Backfill siteId = 'induslens' for all Article, Author, Video, and Eminence
 * records that currently have siteId = null or siteId = ''.
 *
 * IndusTales records (siteId = 'industales') are left untouched.
 *
 * Usage:
 *   npx tsx scripts/backfill-induslens-siteid.ts [--dry-run]
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const SITE_ID = "induslens"

async function main() {
  const dryRun = process.argv.includes("--dry-run")

  if (dryRun) console.log("--- DRY RUN — no changes will be written ---\n")

  // Show all distinct siteId values currently in the Article table
  const siteIdGroups = await prisma.article.groupBy({ by: ["siteId"], _count: true })
  console.log("Current Article siteId distribution:")
  for (const g of siteIdGroups) {
    console.log(`  siteId=${JSON.stringify(g.siteId)}  count=${g._count}`)
  }
  console.log()

  // Records that should be backfilled: null, "", or any value that is not a known site id
  const KNOWN_SITE_IDS = ["induslens", "industales"]
  const notInduslens = { NOT: { siteId: { in: KNOWN_SITE_IDS } } }

  const tables = [
    {
      name: "Article",
      count: () => prisma.article.count({ where: notInduslens }),
      update: () => prisma.article.updateMany({ where: notInduslens, data: { siteId: SITE_ID } }),
    },
    {
      name: "Author",
      count: () => prisma.author.count({ where: notInduslens }),
      update: () => prisma.author.updateMany({ where: notInduslens, data: { siteId: SITE_ID } }),
    },
    {
      name: "Video",
      count: () => prisma.video.count({ where: notInduslens }),
      update: () => prisma.video.updateMany({ where: notInduslens, data: { siteId: SITE_ID } }),
    },
    {
      name: "Eminence",
      count: () => prisma.eminence.count({ where: notInduslens }),
      update: () => prisma.eminence.updateMany({ where: notInduslens, data: { siteId: SITE_ID } }),
    },
  ]

  for (const table of tables) {
    const affected = await table.count()
    console.log(`${table.name}: ${affected} record(s) without siteId`)

    if (affected === 0) continue
    if (dryRun) continue

    const result = await table.update()
    console.log(`  → updated ${result.count} record(s) to siteId='${SITE_ID}'`)
  }

  console.log("\nDone.")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
