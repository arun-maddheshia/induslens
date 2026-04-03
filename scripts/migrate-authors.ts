import { PrismaClient } from '@prisma/client'
import { anchors } from '../data/anchor'

const prisma = new PrismaClient()

async function migrateAuthors() {
  console.log('Starting author migration...')

  let successCount = 0
  let skipCount = 0
  let errorCount = 0

  for (const anchor of anchors) {
    try {
      // Check if author already exists
      const existingAuthor = await prisma.author.findUnique({
        where: { id: anchor._id }
      })

      if (existingAuthor) {
        console.log(`Author ${anchor.name} already exists, skipping...`)
        skipCount++
        continue
      }

      // Process images
      const processedImages = anchor.images?.map(img => ({
        imageCategory: img.imageCategory,
        imageCategoryValue: img.imageCategoryValue || null,
        imageDescription: img.imageDescription || null,
        imageUrl: img.imageUrl,
        key: img.key || null,
      })) || []

      // Create author with preserved ID
      await prisma.author.create({
        data: {
          id: anchor._id,
          name: anchor.name,
          aboutTheAnchor: anchor.aboutTheAnchor || '',
          email: anchor.email || null,
          slug: anchor.slug || anchor.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          description: anchor.description || null,
          facebookUrl: anchor.facebookUrl || null,
          linkedinUrl: anchor.linkedinUrl || null,
          twitterUrl: anchor.twitterUrl || null,
          instagramUrl: anchor.instagramUrl || null,
          youtubeUrl: anchor.youtubeUrl || null,
          websiteUrl: anchor.websiteUrl || null,
          authorUrl: anchor.authorUrl || null,
          contentType: anchor.contentType || 'anchor',
          countryName: anchor.countryName || null,
          status: anchor.status || 'Published',
          isContent: anchor.isContent ?? true,
          key: anchor.key || null,
          siteId: anchor.siteId || null,
          publishedAt: anchor.publishedAt ? new Date(anchor.publishedAt) : null,
          anchorKey: anchor.anchorKey || null,
          shows: anchor.shows || [],
          images: {
            create: processedImages
          }
        }
      })

      console.log(`✓ Migrated author: ${anchor.name}`)
      successCount++
    } catch (error) {
      console.error(`✗ Error migrating author ${anchor.name}:`, error)
      errorCount++
    }
  }

  console.log('\n=== Migration Summary ===')
  console.log(`Total authors: ${anchors.length}`)
  console.log(`Successfully migrated: ${successCount}`)
  console.log(`Skipped (already exist): ${skipCount}`)
  console.log(`Errors: ${errorCount}`)
}

async function main() {
  try {
    await migrateAuthors()
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)