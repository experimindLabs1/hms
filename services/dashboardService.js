import prisma from '@/lib/db'
import redis from '@/lib/redis'

export async function getDashboardData(date) {
  const cacheKey = `dashboard:${date}`
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  const startOfDay = new Date(date)
  startOfDay.setUTCHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setUTCHours(23, 59, 59, 999)

  // Parallel queries for better performance
  const [employees, attendance, leaveRequests, payrollData] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: 'EMPLOYEE'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeDetails: {
          select: {
            position: true,
            department: true,
            salary: true,
            joinedAt: true
          }
        }
      }
    }),
    prisma.attendance.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      select: {
        employeeId: true,
        status: true
      }
    }),
    prisma.leaveRequest.findMany({
      where: {
        status: 'PENDING'
      },
      select: {
        id: true,
        employeeId: true,
        leaveType: true,
        leaveDates: {
          select: {
            date: true
          }
        }
      }
    }),
    prisma.employeeDetails.groupBy({
      by: ['department'],
      _sum: {
        salary: true
      },
      _count: {
        employeeId: true
      }
    })
  ])

  // Process and merge data
  const mergedData = employees.map(employee => {
    const attendanceRecord = attendance.find(a => a.employeeId === employee.id)
    const activeLeaveRequest = leaveRequests.find(l => l.employeeId === employee.id)

    return {
      ...employee,
      status: attendanceRecord?.status || 'UNMARKED',
      onLeave: !!activeLeaveRequest,
      perDaySalary: employee.employeeDetails.salary / 30, // Assuming 30 days month
    }
  })

  const summary = {
    totalEmployees: employees.length,
    presentToday: attendance.filter(a => a.status === 'PRESENT').length,
    absentToday: attendance.filter(a => a.status === 'ABSENT').length,
    onLeaveToday: attendance.filter(a => a.status === 'ON_LEAVE').length,
    pendingLeaveRequests: leaveRequests.length,
    departmentStats: payrollData.map(dept => ({
      department: dept.department,
      employeeCount: dept._count.employeeId,
      totalSalary: dept._sum.salary
    }))
  }

  const result = {
    employees: mergedData,
    summary
  }

  // Cache for 5 minutes
  await redis.set(cacheKey, JSON.stringify(result), { ex: 300 })
  return result
} 