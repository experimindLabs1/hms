import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req) {
  try {
    const { month, year } = await req.json();

    // Get all employees
    const employees = await prisma.employee.findMany({
      include: {
        attendance: {
          where: {
            date: {
              gte: new Date(Date.UTC(year, month - 1, 1)),
              lte: new Date(Date.UTC(year, month - 1 + 1, 0, 23, 59, 59))
            }
          }
        }
      }
    });

    const payslips = await Promise.all(
      employees.map(async (employee) => {
        // Calculate paid days (present days)
        const paidDays = new Set(
          employee.attendance
            .filter(a => a.status.toLowerCase() === 'present')
            .map(record => record.date.toISOString().split('T')[0])
        ).size;

        // Calculate amounts
        const daysInMonth = new Date(year, month, 0).getDate();
        const lopDays = daysInMonth - paidDays;
        const perDaySalary = employee.baseSalary / daysInMonth;
        const basicSalary = perDaySalary * paidDays;
        const grossEarnings = basicSalary;
        const totalDeductions = 0; // Add deduction logic if needed
        const netPayable = grossEarnings - totalDeductions;

        // Create or update payslip
        return prisma.payslip.upsert({
          where: {
            employeeId_month_year: {
              employeeId: employee.id,
              month,
              year
            }
          },
          update: {
            basicSalary,
            grossEarnings,
            totalDeductions,
            netPayable,
            paidDays,
            lopDays,
            payDate: new Date()
          },
          create: {
            employeeId: employee.id,
            month,
            year,
            basicSalary,
            grossEarnings,
            totalDeductions,
            netPayable,
            paidDays,
            lopDays,
            payDate: new Date()
          }
        });
      })
    );

    return NextResponse.json({ success: true, payslips });
  } catch (error) {
    console.error('Error generating payslips:', error);
    return NextResponse.json({ error: 'Failed to generate payslips' }, { status: 500 });
  }
} 