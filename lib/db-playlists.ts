import { db } from "./db"

export type PlaylistType = 'hero' | 'other-stories'

// Get all playlists with their articles
export async function getPlaylist(type: PlaylistType) {
  if (!db) {
    throw new Error("Database connection not available")
  }

  try {
    if (type === 'hero') {
      return await db.heroPlaylist.findMany({
        include: {
          article: {
            select: {
              id: true,
              headline: true,
              excerpt: true,
              status: true,
              publishedAt: true,
              author: {
                select: { id: true, name: true }
              },
              images: {
                where: {
                  imageCategoryValue: 'posterImage'
                },
                select: {
                  imageUrl: true
                },
                take: 1
              }
            }
          }
        },
        orderBy: { order: 'asc' }
      })
    } else {
      return await db.otherStoriesPlaylist.findMany({
        include: {
          article: {
            select: {
              id: true,
              headline: true,
              excerpt: true,
              status: true,
              publishedAt: true,
              author: {
                select: { id: true, name: true }
              },
              images: {
                where: {
                  imageCategoryValue: 'posterImage'
                },
                select: {
                  imageUrl: true
                },
                take: 1
              }
            }
          }
        },
        orderBy: { order: 'asc' }
      })
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

    if (type === 'hero') {
      const result = await db.heroPlaylist.aggregate({
        _max: { order: true }
      })
      maxOrder = result._max.order ?? 0
    } else {
      const result = await db.otherStoriesPlaylist.aggregate({
        _max: { order: true }
      })
      maxOrder = result._max.order ?? 0
    }

    const nextOrder = maxOrder + 1

    // Check if article already exists in playlist
    const existing = type === 'hero'
      ? await db.heroPlaylist.findFirst({ where: { articleId } })
      : await db.otherStoriesPlaylist.findFirst({ where: { articleId } })

    if (existing) {
      throw new Error("Article already exists in this playlist")
    }

    // Add to playlist
    if (type === 'hero') {
      return await db.heroPlaylist.create({
        data: {
          articleId,
          order: nextOrder
        },
        include: {
          article: {
            select: {
              id: true,
              headline: true,
              excerpt: true,
              status: true,
              author: { select: { id: true, name: true } }
            }
          }
        }
      })
    } else {
      return await db.otherStoriesPlaylist.create({
        data: {
          articleId,
          order: nextOrder
        },
        include: {
          article: {
            select: {
              id: true,
              headline: true,
              excerpt: true,
              status: true,
              author: { select: { id: true, name: true } }
            }
          }
        }
      })
    }
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
    if (type === 'hero') {
      const deleted = await db.heroPlaylist.delete({
        where: { id: playlistId }
      })

      // Reorder remaining items to fill gaps
      await reorderPlaylistItems(type)

      return deleted
    } else {
      const deleted = await db.otherStoriesPlaylist.delete({
        where: { id: playlistId }
      })

      // Reorder remaining items to fill gaps
      await reorderPlaylistItems(type)

      return deleted
    }
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
    // Update order for all items
    const updatePromises = items.map((item, index) => {
      const newOrder = index + 1 // Start from 1

      if (type === 'hero') {
        return db.heroPlaylist.update({
          where: { id: item.id },
          data: { order: newOrder }
        })
      } else {
        return db.otherStoriesPlaylist.update({
          where: { id: item.id },
          data: { order: newOrder }
        })
      }
    })

    await Promise.all(updatePromises)

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
    let items

    if (type === 'hero') {
      items = await db.heroPlaylist.findMany({
        orderBy: { order: 'asc' }
      })
    } else {
      items = await db.otherStoriesPlaylist.findMany({
        orderBy: { order: 'asc' }
      })
    }

    // Update each item with sequential order
    const updatePromises = items.map((item, index) => {
      const newOrder = index + 1

      if (type === 'hero') {
        return db.heroPlaylist.update({
          where: { id: item.id },
          data: { order: newOrder }
        })
      } else {
        return db.otherStoriesPlaylist.update({
          where: { id: item.id },
          data: { order: newOrder }
        })
      }
    })

    await Promise.all(updatePromises)
  } catch (error) {
    console.error(`Error reordering ${type} playlist:`, error)
  }
}

// Search articles that can be added to playlist
export async function searchArticlesForPlaylist(query?: string, excludeFromPlaylist?: PlaylistType) {
  if (!db) {
    return []
  }

  try {
    const where: any = {
      status: 'PUBLISHED' // Only show published articles
    }

    // Add search filter
    if (query) {
      where.OR = [
        { headline: { contains: query, mode: 'insensitive' } },
        { excerpt: { contains: query, mode: 'insensitive' } }
      ]
    }

    // Exclude articles already in specific playlist
    if (excludeFromPlaylist) {
      if (excludeFromPlaylist === 'hero') {
        const existingIds = await db.heroPlaylist.findMany({
          select: { articleId: true }
        })
        const excludeIds = existingIds.map(item => item.articleId)
        if (excludeIds.length > 0) {
          where.id = { notIn: excludeIds }
        }
      } else {
        const existingIds = await db.otherStoriesPlaylist.findMany({
          select: { articleId: true }
        })
        const excludeIds = existingIds.map(item => item.articleId)
        if (excludeIds.length > 0) {
          where.id = { notIn: excludeIds }
        }
      }
    }

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
          where: {
            imageCategoryValue: 'posterImage'
          },
          select: {
            imageUrl: true
          },
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