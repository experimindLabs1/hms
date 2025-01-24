import prisma from '@/lib/db'
import redis from '@/lib/redis'

export async function getUsersWithDetails(filters = {}, page = 1, limit = 10) {
  const cacheKey = `users:${JSON.stringify(filters)}:${page}:${limit}`
  
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  const where = {
    ...(filters.department && {
      employeeDetails: {
        department: filters.department
      }
    }),
    ...(filters.search && {
      OR: [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } }
      ]
    })
  }

  // Parallel queries for efficiency
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        employeeDetails: {
          select: {
            employeeId: true,
            position: true,
            department: true
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.user.count({ where })
  ])

  const result = {
    users,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit
    }
  }

  // Cache for 5 minutes
  await redis.set(cacheKey, JSON.stringify(result), { ex: 300 })
  return result
} 