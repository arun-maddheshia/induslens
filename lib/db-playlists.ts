import { db } from "./db"

export type PlaylistType = 'hero' | 'other-stories' | 'industales'

// Get all playlists with their articles
export async function getPlaylist(type: PlaylistType) {
  if (!db) {
    throw new Error("Database connection not available")
  }

  const articleSelect = {
    id: true,
    headline: true,
    excerpt: true,
    status: true,
    publishedAt: true,
    author: { select: { id: true, name: true } },
    images: {
      where: { imageCategoryValue: 'posterImage' },
      select: { imageUrl: true, imageCategoryValue: true },
      take: 1,
    },
  }
  try {
    if (type === 'hero') {
      return await db.heroPlaylist.findMany({ include: { article: { select: articleSelect } }, orderBy: { order: 'asc' } })
    } else if (type === 'other-stories') {
      return await db.otherStoriesPlaylist.findMany({ include: { article: { select: articleSelect } }, orderBy: { order: 'asc' } })
    } else {
      return await db.indusTalesPlaylist.findMany({ include: { article: { select: articleSelect } }, orderBy: { order: 'asc' } })
    }
  } catch (error) {
    console.error(`Error fetching ${type} playlist:`, error)
    return []
  }
}

// Add article to playlist
export async function addArticleToPlaylist(type: PlaylistType, articleId: string) {
  if (!db || !articleId) {
    throw new Error("Database connection or articleId not available")
  }

  try {
    // Get the next order number
    let maxOrder = 0

    const model = type === 'hero' ? db.heroPlaylist : type === 'other-stories' ? db.otherStoriesPlaylist : db.indusTalesPlaylist
    const agg = await (model as any).aggregate({ _max: { order: true } })
    maxOrder = agg._max.order ?? 0
    const nextOrder = maxOrder + 1

    const existing = await (model as any).findFirst({ where: { articleId } })
    if (existing) throw new Error("Article already exists in this playlist")

    const articleSelect = { id: true, headline: true, excerpt: true, status: true, author: { select: { id: true, name: true } } }
    return await (model as any).create({ data: { articleId, order: nextOrder }, include: { article: { select: articleSelect } } })
  } catch (error) {
    console.error(`Error adding article to ${type} playlist:`, error)
    throw error
  }
}

// Remove article from playlist
export async function removeArticleFromPlaylist(type: PlaylistType, playlistId: string) {
  if (!db || !playlistId) {
    throw new Error("Database connection or playlistId not available")
  }

  try {
    const model = type === 'hero' ? db.heroPlaylist : type === 'other-stories' ? db.otherStoriesPlaylist : db.indusTalesPlaylist
    const deleted = await (model as any).delete({ where: { id: playlistId } })
    await reorderPlaylistItems(type)
    return deleted
  } catch (error) {
    console.error(`Error removing article from ${type} playlist:`, error)
    throw error
  }
}

// Update playlist order
export async function updatePlaylistOrder(type: PlaylistType, items: Array<{ id: string; order: number }>) {
  if (!db || !Array.isArray(items)) {
    throw new Error("Database connection not available or invalid items")
  }

  try {
    const model = type === 'hero' ? db.heroPlaylist : type === 'other-stories' ? db.otherStoriesPlaylist : db.indusTalesPlaylist
    await Promise.all(
      items.map((item, index) =>
        (model as any).update({ where: { id: item.id }, data: { order: index + 1 } })
      )
    )

    console.log(`Updated order for ${items.length} items in ${type} playlist`)
  } catch (error) {
    console.error(`Error updating ${type} playlist order:`, error)
    throw error
  }
}

// Helper function to reorder items sequentially (remove gaps)
async function reorderPlaylistItems(type: PlaylistType) {
  if (!db) return

  try {
    const model = type === 'hero' ? db.heroPlaylist : type === 'other-stories' ? db.otherStoriesPlaylist : db.indusTalesPlaylist
    const items = await (model as any).findMany({ orderBy: { order: 'asc' } })
    await Promise.all(
      items.map((item: any, index: number) =>
        (model as any).update({ where: { id: item.id }, data: { order: index + 1 } })
      )
    )
  } catch (error) {
    console.error(`Error reordering ${type} playlist:`, error)
  }
}

// Search articles that can be added to playlist
export async function searchArticlesForPlaylist(query?: string, excludeFromPlaylist?: PlaylistType) {
  if (!db) {
    return []
  }

  const where: any = {
    status: 'PUBLISHED'
  }

  if (query) {
    where.OR = [
      { headline: { contains: query, mode: 'insensitive' } },
      { excerpt: { contains: query, mode: 'insensitive' } }
    ]
  }

  // Exclude articles already in the target playlist — isolated so a failure here
  // doesn't prevent article results from being returned.
  if (excludeFromPlaylist) {
    try {
      const model = excludeFromPlaylist === 'hero'
        ? db.heroPlaylist
        : excludeFromPlaylist === 'other-stories'
        ? db.otherStoriesPlaylist
        : db.indusTalesPlaylist
      const existingIds = await (model as any).findMany({ select: { articleId: true } })
      const excludeIds = existingIds.map((item: any) => item.articleId)
      if (excludeIds.length > 0) where.id = { notIn: excludeIds }
    } catch (err) {
      console.error('Error fetching playlist exclusions (proceeding without exclusions):', err)
    }
  }

  try {
    return await db.article.findMany({
      where,
      select: {
        id: true,
        headline: true,
        excerpt: true,
        publishedAt: true,
        author: {
          select: { id: true, name: true }
        },
        images: {
          where: { imageCategoryValue: 'posterImage' },
          select: { imageUrl: true },
          take: 1
        }
      },
      orderBy: { publishedAt: 'desc' },
      take: 50
    })
  } catch (error) {
    console.error('Error searching articles for playlist:', error)
    return []
  }
}