export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

export async function GET(request) {
    try {
        const user = await authenticateUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const month = parseInt(searchParams.get('month'));
        const year = parseInt(searchParams.get('year'));

        const employee = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
                employeeDetails: true,
                attendance: {
                    where: {
                        date: {
                            gte: new Date(year, month - 1, 1),
                            lte: new Date(year, month, 0)
                        }
                    }
                }
            }
        });

        if (!employee || !employee.employeeDetails) {
            return NextResponse.json(
                { error: 'Employee details not found' },
                { status: 404 }
            );
        }

        const daysInMonth = new Date(year, month, 0).getDate();
        const presentDays = employee.attendance.filter(a => a.status === 'PRESENT').length;
        const salary = employee.employeeDetails.salary;
        const perDaySalary = salary / daysInMonth;
        const payableAmount = perDaySalary * presentDays;

        return NextResponse.json({
            amount: salary,
            perDaySalary: perDaySalary,
            payableAmount: payableAmount,
            presentDays: presentDays,
            workingDays: daysInMonth
        });

    } catch (error) {
        console.error('Error fetching payroll:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payroll' },
            { status: 500 }
        );
    }
} 