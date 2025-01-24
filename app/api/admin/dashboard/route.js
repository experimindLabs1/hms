export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Helper function to get days in month
const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

export async function GET(request) {
  try {
    // Auth check
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get date from query params and optimize date objects
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    const today = dateParam ? new Date(dateParam) : new Date()
    
    // Optimize date calculations
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    const daysInCurrentMonth = getDaysInMonth(today);

    // Parallel queries for better performance
    const [employees, attendanceCounts, todayAttendance] = await Promise.all([
      // Base employee data
      prisma.user.findMany({
        where: {
          role: 'EMPLOYEE',
        },
        select: {
          id: true,
          name: true,
          email: true,
          employeeDetails: {
            select: {
              position: true,
              department: true,
              salary: true,
              bankName: true,
              bankAccountNumber: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      }),

      // Monthly attendance counts
      prisma.attendance.groupBy({
        by: ['employeeId', 'status'],
        where: {
          date: {
            gte: startOfMonth,
            lte: endOfMonth
          },
          status: 'PRESENT'
        },
        _count: {
          status: true
        }
      }),

      // Today's attendance
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
      })
    ])

    // Create lookup maps for faster access
    const attendanceMap = new Map(
      todayAttendance.map(a => [a.employeeId, a.status])
    )

    const presentDaysMap = new Map(
      attendanceCounts.map(count => [
        count.employeeId,
        count._count.status
      ])
    )

    // Efficient data transformation
    const formattedEmployees = employees.map(emp => {
      const status = attendanceMap.get(emp.id) || 'UNMARKED'
      const totalDaysPresent = presentDaysMap.get(emp.id) || 0
      const perDaySalary = (emp.employeeDetails?.salary || 0) / daysInCurrentMonth
      const payableAmount = perDaySalary * totalDaysPresent

      return {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        position: emp.employeeDetails?.position || 'N/A',
        department: emp.employeeDetails?.department || 'N/A',
        status,
        perDaySalary: perDaySalary.toFixed(2),
        totalDaysPresent,
        payableAmount: payableAmount.toFixed(2),
        daysInMonth: daysInCurrentMonth,
        bankDetails: {
          bankName: emp.employeeDetails?.bankName || 'N/A',
          accountNumber: emp.employeeDetails?.bankAccountNumber || 'N/A'
        }
      }
    })

    // Efficient summary calculation using reduce
    const summary = formattedEmployees.reduce((acc, emp) => {
      const status = emp.status.toLowerCase()
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {
      present: 0,
      absent: 0,
      on_leave: 0,
      unmarked: 0
    })

    return NextResponse.json({
      employees: formattedEmployees,
      summary
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    )
  }
} 