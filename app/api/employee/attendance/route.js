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

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const month = parseInt(searchParams.get('month'));
        const year = parseInt(searchParams.get('year'));

        // Calculate date range for the month
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const attendance = await prisma.attendance.findMany({
            where: {
                employeeId: user.id,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });

        // Calculate attendance statistics
        const workingDays = endDate.getDate();
        const presentDays = attendance.filter(a => a.status === 'PRESENT').length;
        const absentDays = attendance.filter(a => a.status === 'ABSENT').length;
        const leaveDays = attendance.filter(a => a.status === 'ON_LEAVE').length;
        const attendancePercentage = Math.round((presentDays / workingDays) * 100);

        return NextResponse.json({
            workingDays,
            presentDays,
            absentDays,
            leaveDays,
            attendancePercentage
        });

    } catch (error) {
        console.error('Error fetching attendance:', error);
        return NextResponse.json(
            { error: 'Failed to fetch attendance' },
            { status: 500 }
        );
    }
} 