import { db } from './db'

// ─── Page Settings ────────────────────────────────────────────────────────────

export async function getSpecialsPage() {
  return db.specialsPage.upsert({
    where: { id: 'main' },
    create: {},
    update: {},
  })
}

export async function updateSpecialsPage(data: { title?: string; description?: string }) {
  return db.specialsPage.upsert({
    where: { id: 'main' },
    create: { title: data.title ?? 'IndusLens Specials', description: data.description ?? '' },
    update: data,
  })
}

// ─── Specials ─────────────────────────────────────────────────────────────────

export async function getAllSpecials() {
  return db.special.findMany({
    orderBy: { order: 'asc' },
    include: {
      categoryRef: { select: { id: true, name: true, slug: true } },
    },
  })
}

export async function getSpecialsWithArticles() {
  const specials = await db.special.findMany({
    where: { categoryId: { not: null } },
    orderBy: { order: 'asc' },
    include: {
      categoryRef: { select: { id: true, name: true, slug: true } },
    },
  })

  const withArticles = await Promise.all(
    specials.map(async (special) => {
      const articles = await db.article.findMany({
        where: { categoryId: special.categoryId!, status: 'PUBLISHED', visibility: true },
        orderBy: [{ categoryOrder: 'asc' }, { publishedAt: 'desc' }],
        take: 12,
        select: {
          id: true,
          headline: true,
          slug: true,
          excerpt: true,
          categoryId: true,
          publishedAt: true,
          images: {
            select: {
              imageCategory: true,
              imageCategoryValue: true,
              imageDescription: true,
              imageUrl: true,
            },
          },
        },
      })
      return { ...special, categoryArticles: articles }
    })
  )

  return withArticles
}

export async function getSpecialById(id: string) {
  return db.special.findUnique({
    where: { id },
    include: {
      categoryRef: { select: { id: true, name: true, slug: true } },
    },
  })
}

export async function createSpecial(data: { title: string; description?: string; categoryId?: string }) {
  const maxOrder = await db.special.aggregate({ _max: { order: true } })
  return db.special.create({
    data: {
      title: data.title,
      description: data.description ?? '',
      categoryId: data.categoryId ?? null,
      order: (maxOrder._max.order ?? 0) + 1,
    },
    include: { categoryRef: { select: { id: true, name: true, slug: true } } },
  })
}

export async function updateSpecial(
  id: string,
  data: { title?: string; description?: string; order?: number; categoryId?: string | null }
) {
  return db.special.update({
    where: { id },
    data,
    include: { categoryRef: { select: { id: true, name: true, slug: true } } },
  })
}

export async function deleteSpecial(id: string) {
  return db.special.delete({ where: { id } })
}

export async function updateSpecialOrders(updates: { id: string; order: number }[]) {
  return db.$transaction(
    updates.map(({ id, order }) => db.special.update({ where: { id }, data: { order } }))
  )
}
