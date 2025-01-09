import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/utils/auth';

export async function GET(request) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tokenData = await verifyToken(token);
        if (!tokenData) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const month = parseInt(searchParams.get('month'));
        const year = parseInt(searchParams.get('year'));

        // First get the employee to ensure we have the correct employeeId
        const employee = await prisma.employee.findUnique({
            where: {
                employeeId: tokenData.employeeId
            }
        });

        if (!employee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        // Fix the date range calculation
        const startDate = new Date(Date.UTC(year, month - 1, 1));
        const endDate = new Date(Date.UTC(year, month - 1 + 1, 0, 23, 59, 59));

        // Get attendance records for the specific employee
        const attendance = await prisma.attendance.findMany({
            where: {
                employeeId: employee.id,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: {
                date: 'asc',
            },
        });

        // Get total days in the month
        const totalDaysInMonth = new Date(year, month, 0).getDate();

        // Count unique days for each status
        const uniquePresentDays = new Set(
            attendance
                .filter(record => record.status.toLowerCase() === 'present')
                .map(record => record.date.toISOString().split('T')[0])
        ).size;

        const uniqueAbsentDays = new Set(
            attendance
                .filter(record => record.status.toLowerCase() === 'absent')
                .map(record => record.date.toISOString().split('T')[0])
        ).size;

        const uniqueLeaveDays = new Set(
            attendance
                .filter(record => record.status.toLowerCase() === 'on leave')
                .map(record => record.date.toISOString().split('T')[0])
        ).size;

        const summary = {
            presentDays: uniquePresentDays,
            absentDays: uniqueAbsentDays,
            leaveDays: uniqueLeaveDays,
            totalDays: totalDaysInMonth,
            attendancePercentage: uniquePresentDays > 0 
                ? ((uniquePresentDays / totalDaysInMonth) * 100).toFixed(2) 
                : "0.00",
            records: attendance.map(record => ({
                date: record.date,
                status: record.status
            })),
            month: month,
            year: year
        };

        return NextResponse.json(summary);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic' 