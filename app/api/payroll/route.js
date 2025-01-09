import { prisma } from '/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const month = parseInt(searchParams.get("month")) || new Date().getMonth() + 1;
    const year = parseInt(searchParams.get("year")) || new Date().getFullYear();

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    // Fetch employee details
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(employeeId) },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Calculate the number of days in the given month
    const daysInMonth = new Date(year, month, 0).getDate();

    // Add these debug logs
    console.log('Date range:', {
      start: new Date(year, month - 1, 1),
      end: new Date(year, month - 1 + 1, 0)
    });

    // Fetch attendance records for the given employee in the specified month
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        employeeId: parseInt(employeeId),
        status: "present",
        date: {
          gte: new Date(Date.UTC(year, month - 1, 1)),
          lte: new Date(Date.UTC(year, month - 1 + 1, 0, 23, 59, 59))
        },
      },
    });

    // Add this debug log
    console.log('Found attendance records:', attendanceRecords);

    // Count the number of unique days the employee was present
    const uniquePresentDays = new Set(
      attendanceRecords.map((record) => record.date.toISOString().split("T")[0])
    ).size;

    // Add this debug log after uniquePresentDays calculation
    console.log('Unique present days:', uniquePresentDays);

    // Calculate per-day salary
    const perDaySalary = employee.baseSalary / daysInMonth;

    // Calculate payable amount
    const payableAmount = perDaySalary * uniquePresentDays;

    return NextResponse.json({
      employeeId: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      baseSalary: employee.baseSalary,
      month,
      year,
      daysInMonth,
      uniquePresentDays,
      perDaySalary,
      payableAmount,
    });

  } catch (error) {
    console.error("Error calculating payroll:", error);
    return NextResponse.json({ error: "Error calculating payroll" }, { status: 500 });
  }
}

