import { PrismaClient } from "@prisma/client"

const db = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
})

// Hero playlist article IDs (from the DB after migration)
const HERO_ARTICLE_IDS = [
  "cmnioobs1001d13c64fb1f8bm",
  "cmnioocqp002113c6xpk8bk59",
  "cmnioo8y9000113c6180i2pk9",
  "cmniooerf003l13c6oq7pj93v",
  "cmnioof5r003t13c6yms5jcu2",
  "cmnioobvq000p13c6t3pq3ico",
  "cmniooa5s000913c69b2afvxl",
]

// Other Stories slugs — articles with category === 'none' in the original data
const OTHER_STORIES_SLUGS = [
  "healthcare-beyond-borders",
  "tech--trade-poised-to-deepen-uk-india-ties",
  "the-melodi-equation",
  "modi-30-what-indias-election-means-for-australia-and-the-world",
  "the-undeniable-global-appeal-of-indian-cuisine",
  "modi-30---india-and-sri-lanka",
  "indias-agricultural-progress-inspires-ghana",
  "the-wow-country",
  "indias-remarkable-rise",
  "indo-british-trade-council-cheers-economic-surge",
  "how-usa-destroyed-the-afghan-republic",
  "chabahar-deal-india-sidesteps-rivals-expands-geopolitical-influence",
  "indias-role-in-sri-lankas-economic-renewal",
  "indias-democracy-empowers-women",
  "bollywood-dance-taking-the-world-by-storm",
  "21st-century-colonialism-chinas-quest-for-empire",
  "decoding-worlds-largest-democracy",
  "securing-indias-future",
  "the-global-influence-of-indian-music",
  "waging-war-against-global-terror",
  "the-world-turns-blind-to-the-plight-of-afghan-women",
  "islamic-state-renewal-highlights-indias-old-concerns",
  "the-quagmire-of-afghan-pak-tensions",
  "Championing-Systemic-Change-through-Consensus-Building",
  "From-Shah-Rukh-to-Stardom-My-Dance-with-Bollywood",
  "new-heights-in-aus-india-trade",
  "russia-a-land-of-the-rishis",
  "cine-magic-of-indian-storytelling",
  "russian-literatures-indian-soul-unites-east-and-west",
  "india-rising-for-its-polo-renaissance",
  "india-a-global-sports-powerhouse",
  "india-advances-education-in-tanzania",
  "indias-emerging-dominance-in-the-processed-food-industry",
  "India's-Lunar-Leap-Chandrayaan-Ignites-Dreams-Beyond-Borders",
  "from-kabul-to-the-classrooms-of-india-a-tale-of-historical-ties-cricket-and-people-to-people-warmth",
  "from-punjab-to-the-fjords-dr-chef-sakirat-waraichs-extraordinary-culinary-bridge-between-india--norway",
  "iranians-besotted-with-use-of-colours-flowers-music-and-dance-in-indian-films",
  "embracing-indias-transformation-my-witness-to-a-nations-remarkable-journey",
  "why-are-india-canada-relations-strained",
  "Global-Power-Play-CCP's-Ignition-Plan-Unmasked",
]

async function seedHeroPlaylist() {
  console.log("🎬 Seeding HeroPlaylist...")

  // Clear existing entries
  await db.heroPlaylist.deleteMany()

  let seeded = 0
  let skipped = 0

  for (let i = 0; i < HERO_ARTICLE_IDS.length; i++) {
    const articleId = HERO_ARTICLE_IDS[i]

    const article = await db.article.findUnique({ where: { id: articleId }, select: { id: true, headline: true } })
    if (!article) {
      console.warn(`  ⚠️  Article not found with id: ${articleId}`)
      skipped++
      continue
    }

    await db.heroPlaylist.create({
      data: {
        articleId: article.id,
        order: i + 1,
      },
    })

    console.log(`  ✅ [${i + 1}] ${article.headline}`)
    seeded++
  }

  console.log(`\n  📊 HeroPlaylist: ${seeded} seeded, ${skipped} skipped\n`)
}

async function seedOtherStoriesPlaylist() {
  console.log("📰 Seeding OtherStoriesPlaylist...")

  // Clear existing entries
  await db.otherStoriesPlaylist.deleteMany()

  let seeded = 0
  let skipped = 0

  for (let i = 0; i < OTHER_STORIES_SLUGS.length; i++) {
    const slug = OTHER_STORIES_SLUGS[i]

    const article = await db.article.findUnique({ where: { slug }, select: { id: true, headline: true } })
    if (!article) {
      console.warn(`  ⚠️  Article not found with slug: ${slug}`)
      skipped++
      continue
    }

    await db.otherStoriesPlaylist.create({
      data: {
        articleId: article.id,
        order: i + 1,
      },
    })

    console.log(`  ✅ [${i + 1}] ${article.headline}`)
    seeded++
  }

  console.log(`\n  📊 OtherStoriesPlaylist: ${seeded} seeded, ${skipped} skipped\n`)
}

async function main() {
  try {
    console.log("🔗 Connecting to database...")
    await db.$connect()
    console.log("✅ Connected\n")

    await seedHeroPlaylist()
    await seedOtherStoriesPlaylist()

    console.log("🎉 Playlist seeding complete!")
  } catch (error) {
    console.error("💥 Seeding failed:", error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

main()
