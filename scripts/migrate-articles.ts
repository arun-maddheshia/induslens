import { PrismaClient, ContentType, ArticleStatus } from "@prisma/client"
import { articles } from "../data/articles"

const db = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
})

function parseDate(dateString: string | undefined | null): Date | null {
  if (!dateString || dateString.trim() === '') {
    return null
  }

  try {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? null : date
  } catch (error) {
    console.warn(`Failed to parse date: ${dateString}`)
    return null
  }
}

function emptyToNull(value: string | undefined): string | null {
  return (value && value.trim() !== '') ? value.trim() : null
}

function safeArray(arr: any): string[] {
  if (!Array.isArray(arr)) return []
  return arr.filter(item => item && typeof item === 'string' && item.trim() !== '')
}

function mapContentType(contentType: string): ContentType {
  switch (contentType?.toLowerCase()) {
    case 'news':
      return ContentType.NEWS
    case 'content_block':
      return ContentType.CONTENT_BLOCK
    case 'articles':
      return ContentType.ARTICLES
    case 'anchor':
      return ContentType.ANCHOR
    default:
      console.warn(`Unknown content type: ${contentType}, defaulting to ARTICLES`)
      return ContentType.ARTICLES
  }
}

function mapStatus(status: string): ArticleStatus {
  switch (status?.toLowerCase()) {
    case 'published':
      return ArticleStatus.PUBLISHED
    case 'draft':
      return ArticleStatus.DRAFT
    case 'archived':
      return ArticleStatus.ARCHIVED
    case 'scheduled':
      return ArticleStatus.SCHEDULED
    default:
      console.warn(`Unknown status: ${status}, defaulting to DRAFT`)
      return ArticleStatus.DRAFT
  }
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  if (!baseSlug || baseSlug.trim() === '') {
    baseSlug = 'untitled-article'
  }

  let slug = baseSlug
  let counter = 1

  while (await db.article.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

async function findOrCreateUser(authorData: { id: string; name: string } | null): Promise<string | null> {
  if (!authorData || !authorData.name?.trim()) {
    return null
  }

  const email = `${authorData.id}@migrated.user` // Generate a temporary email
  const existingUser = await db.user.findUnique({ where: { email } })

  if (existingUser) {
    return existingUser.id
  }

  try {
    const newUser = await db.user.create({
      data: {
        email,
        password: 'temp_password_' + Math.random().toString(36).substring(2), // Temporary password
        name: authorData.name.trim(),
      }
    })
    return newUser.id
  } catch (error) {
    console.warn(`Failed to create user for: ${authorData.name}`, error)
    return null
  }
}

async function migrateArticles() {
  console.log(`🚀 Starting migration of ${articles.length} articles...`)

  let successCount = 0
  let errorCount = 0
  const errors: Array<{ article: any; error: string }> = []

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i]

    try {
      console.log(`📝 Processing article ${i + 1}/${articles.length}: ${article.headline || article._id}`)

      // Handle author - get the first author if exists
      const firstAuthor = Array.isArray(article.author) && article.author.length > 0
        ? article.author[0]
        : null

      const authorId = await findOrCreateUser(firstAuthor)

      // Ensure unique slug
      const uniqueSlug = await ensureUniqueSlug(article.slug)

      // Parse dates
      const createdAt = parseDate(article.createdAt)
      const updatedAt = parseDate(article.updatedAt)
      const publishedAt = parseDate(article.publishedAt)
      const archivedAt = parseDate(article.archivedAt)

      // Map status and determine publishedAt
      const mappedStatus = mapStatus(article.status)
      const finalPublishedAt = mappedStatus === ArticleStatus.PUBLISHED
        ? (publishedAt || createdAt || new Date())
        : publishedAt

      // Prepare article data
      const articleData = {
        // Core content - ensuring required fields are not empty
        headline: article.headline?.trim() || `Untitled Article ${i + 1}`,
        alternativeHeadline: emptyToNull(article.alternativeHeadline),
        excerpt: article.excerpt?.trim() || `Excerpt for article ${i + 1}`,
        description: emptyToNull(article.description),
        articleBody: article.articleBody?.trim() || article.pageContent?.trim() || '',
        pageContent: emptyToNull(article.pageContent),
        diveContent: emptyToNull(article.diveContent),

        // Classification
        contentType: mapContentType(article.contentType),
        newsType: emptyToNull(article.newsType),
        category: article.category?.trim() || 'uncategorized',
        subCategories: safeArray(article.subCategories),
        genre: safeArray(article.genre),
        tags: safeArray(article.tags),
        keywords: safeArray(article.keywords),
        language: article.language?.trim() || 'en',

        // SEO / Meta - ensuring required fields
        metaTitle: article.metaTitle?.trim() || article.headline?.trim() || `Article ${i + 1}`,
        metaDescription: article.metaDescription?.trim() || article.excerpt?.trim() || `Description for article ${i + 1}`,
        slug: uniqueSlug,
        url: emptyToNull(article.url),
        canonicalUrl: null, // Not present in source data

        // Publishing
        status: mappedStatus,
        visibility: article.visibility !== false, // Default to true if undefined
        publishedAt: finalPublishedAt,
        archivedAt: archivedAt,
        expiresAt: null, // Not present in source data

        // Authorship
        authorId: authorId,
        editorId: null, // Editor field in source is empty string

        // Source
        agency: emptyToNull(article.agency),
        publisher: emptyToNull(article.publisher),
        sourceType: emptyToNull(article.sourceType),
        siteId: emptyToNull(article.siteId),

        // Timestamps
        createdAt: createdAt || new Date(),
        updatedAt: updatedAt || new Date(),
      }

      // Create the article
      const createdArticle = await db.article.create({
        data: articleData
      })

      if (Array.isArray(article.images) && article.images.length > 0) {
        const imagePromises = article.images.map((img: any) => {
          if (!img.imageCategory) return null

          return db.articleImage.create({
            data: {
              articleId: createdArticle.id,
              imageCategory: img.imageCategory,
              imageCategoryValue: emptyToNull(img.imageCategoryValue),
              imageDescription: emptyToNull(img.imageDescription),
              imageUrl: Array.isArray(img.imageUrl) ? img.imageUrl.filter(Boolean) : [],
            }
          })
        }).filter(Boolean)

        if (imagePromises.length > 0) {
          await Promise.all(imagePromises)
          console.log(`   ✅ Created ${imagePromises.length} images for article`)
        }
      }

      successCount++
      console.log(`   ✅ Successfully migrated: ${createdArticle.headline}`)

    } catch (error) {
      errorCount++
      const errorMessage = error instanceof Error ? error.message : String(error)
      errors.push({
        article: {
          _id: article._id,
          headline: article.headline,
          slug: article.slug
        },
        error: errorMessage
      })
      console.error(`   ❌ Failed to migrate article ${article.headline || article._id}:`, errorMessage)
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log(`📊 MIGRATION SUMMARY`)
  console.log('='.repeat(60))
  console.log(`✅ Successfully migrated: ${successCount} articles`)
  console.log(`❌ Failed migrations: ${errorCount} articles`)
  console.log(`📈 Success rate: ${((successCount / articles.length) * 100).toFixed(2)}%`)

  if (errors.length > 0) {
    console.log('\n❌ ERRORS ENCOUNTERED:')
    errors.forEach((err, idx) => {
      console.log(`${idx + 1}. ${err.article.headline || err.article._id}`)
      console.log(`   Slug: ${err.article.slug}`)
      console.log(`   Error: ${err.error}`)
      console.log('')
    })
  }

  // Verification queries
  console.log('\n📋 VERIFICATION:')
  const totalArticles = await db.article.count()
  const publishedArticles = await db.article.count({
    where: { status: ArticleStatus.PUBLISHED }
  })
  const totalImages = await db.articleImage.count()
  const totalUsers = await db.user.count()

  console.log(`📰 Total articles in database: ${totalArticles}`)
  console.log(`📢 Published articles: ${publishedArticles}`)
  console.log(`🖼️  Total images: ${totalImages}`)
  console.log(`👥 Total users created: ${totalUsers}`)

  return { successCount, errorCount, errors }
}

async function main() {
  try {
    console.log('🔗 Connecting to database...')
    await db.$connect()
    console.log('✅ Connected to database successfully')

    await migrateArticles()

    console.log('\n🎉 Migration completed!')

  } catch (error) {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
    console.log('📤 Disconnected from database')
  }
}

// Run the migration
if (require.main === module) {
  main()
}