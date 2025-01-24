import prisma from '@/lib/db'
import redis from '@/lib/redis'

export async function getAttendanceByDate(date) {
  const cacheKey = `attendance:${date}`
  
  // Try cache first
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  // Optimized query with specific selections
  const attendance = await prisma.attendance.findMany({
    where: {
      date: {
        gte: new Date(new Date(date).setUTCHours(0, 0, 0, 0)),
        lte: new Date(new Date(date).setUTCHours(23, 59, 59, 999))
      }
    },
    select: {
      id: true,
      date: true,
      status: true,
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
      }
    }
  })

  // Cache for 1 hour
  await redis.set(cacheKey, JSON.stringify(attendance), { ex: 3600 })
  return attendance
}

export async function getMonthlyAttendance(employeeId, month, year) {
  const cacheKey = `attendance:monthly:${employeeId}:${month}:${year}`
  
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  const startDate = new Date(Date.UTC(year, month - 1, 1))
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59))

  // Batch query for better performance
  const [attendance, leaveRequests] = await Promise.all([
    prisma.attendance.findMany({
      where: {
        employeeId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        date: true,
        status: true
      },
      orderBy: {
        date: 'asc'
      }
    }),
    prisma.leaveRequest.findMany({
      where: {
        employeeId,
        status: 'APPROVED',
        leaveDates: {
          some: {
            date: {
              gte: startDate,
              lte: endDate
            }
          }
        }
      },
      select: {
        leaveType: true,
        leaveDates: {
          select: {
            date: true
          }
        }
      }
    })
  ])

  const result = {
    attendance,
    summary: {
      totalDays: new Date(year, month, 0).getDate(),
      presentDays: attendance.filter(a => a.status === 'PRESENT').length,
      absentDays: attendance.filter(a => a.status === 'ABSENT').length,
      leaveDays: attendance.filter(a => a.status === 'ON_LEAVE').length,
      leaveBreakdown: leaveRequests.reduce((acc, curr) => {
        acc[curr.leaveType] = (acc[curr.leaveType] || 0) + curr.leaveDates.length
        return acc
      }, {})
    }
  }

  // Cache for 30 minutes
  await redis.set(cacheKey, JSON.stringify(result), { ex: 1800 })
  return result
} 