import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateAuthorRelations() {
  console.log('Starting author relations migration...')

  try {
    // Step 1: Move existing authorId values to legacyAuthorId
    const result = await prisma.$executeRaw`
      UPDATE "Article"
      SET "legacyAuthorId" = "authorId"
      WHERE "authorId" IS NOT NULL AND "legacyAuthorId" IS NULL
    `
    console.log(`✓ Moved ${result} existing author relationships to legacy field`)

    // Step 2: Clear authorId field to prepare for new foreign key
    await prisma.$executeRaw`UPDATE "Article" SET "authorId" = NULL`
    console.log('✓ Cleared authorId field')

    console.log('✓ Migration completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Run: npx prisma db push')
    console.log('2. Run: npx tsx scripts/migrate-authors.ts')
    console.log('3. Manually assign authors to articles as needed')

  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

async function main() {
  try {
    await migrateAuthorRelations()
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)