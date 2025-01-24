import prisma from '@/lib/db'
import redis from '@/lib/redis'

export async function getLeaveRequests(filters = {}, page = 1, limit = 10) {
  const cacheKey = `leaves:${JSON.stringify(filters)}:${page}:${limit}`
  
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  const where = {
    ...(filters.status && { status: filters.status }),
    ...(filters.employeeId && { employeeId: filters.employeeId }),
    ...(filters.leaveType && { leaveType: filters.leaveType })
  }

  const [requests, total] = await Promise.all([
    prisma.leaveRequest.findMany({
      where,
      select: {
        id: true,
        reason: true,
        status: true,
        leaveType: true,
        createdAt: true,
        employee: {
          select: {
            id: true,
            name: true,
            employeeDetails: {
              select: {
                department: true,
                position: true
              }
            }
          }
        },
        leaveDates: {
          select: {
            date: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.leaveRequest.count({ where })
  ])

  const result = {
    requests,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit
    }
  }

  await redis.set(cacheKey, JSON.stringify(result), { ex: 300 })
  return result
}

export async function createLeaveRequest(data) {
  const { employeeId, reason, leaveType, dates } = data

  // Check leave balance in transaction
  const result = await prisma.$transaction(async (tx) => {
    const balance = await tx.leaveBalance.findUnique({
      where: { employeeId }
    })

    if (!balance || balance[leaveType.toLowerCase()] < dates.length) {
      throw new Error('Insufficient leave balance')
    }

    // Create leave request
    const request = await tx.leaveRequest.create({
      data: {
        employeeId,
        reason,
        leaveType,
        leaveDates: {
          create: dates.map(date => ({ date: new Date(date) }))
        }
      },
      include: {
        leaveDates: true,
        employee: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Clear relevant caches
    await redis.del(`leaves:${employeeId}*`)
    
    return request
  })

  return result
}

export async function updateLeaveStatus(id, status, updatedBy) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.leaveRequest.update({
      where: { id },
      data: { status },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        leaveDates: true
      }
    })

    if (status === 'APPROVED') {
      // Update leave balance
      await tx.leaveBalance.update({
        where: { employeeId: request.employeeId },
        data: {
          [request.leaveType.toLowerCase()]: {
            decrement: request.leaveDates.length
          }
        }
      })

      // Create attendance records for approved leaves
      await tx.attendance.createMany({
        data: request.leaveDates.map(date => ({
          employeeId: request.employeeId,
          date: date.date,
          status: 'ON_LEAVE'
        }))
      })
    }

    // Clear relevant caches
    await redis.del(`leaves:${request.employeeId}*`)
    await redis.del(`attendance:${request.employeeId}*`)

    return request
  })
} 