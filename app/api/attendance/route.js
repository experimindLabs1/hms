import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAttendanceByDate } from '@/services/attendanceService'

const VALID_STATUSES = new Set(['PRESENT', 'ABSENT', 'ON_LEAVE', 'UNMARKED']);

export async function POST(request) {
    try {
        // Auth check
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { employeeId, status, date } = await request.json();

        // Fast validation using Set
        const normalizedStatus = status.toUpperCase();
        if (!VALID_STATUSES.has(normalizedStatus)) {
            return NextResponse.json(
                { error: 'Invalid attendance status' },
                { status: 400 }
            );
        }

        // Optimize date handling
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        // Single efficient query with transaction
        const result = await prisma.$transaction(async (tx) => {
            // Update attendance
            const attendance = await tx.attendance.upsert({
                where: {
                    employeeId_date: {
                        employeeId,
                        date: attendanceDate
                    }
                },
                update: {
                    status: normalizedStatus
                },
                create: {
                    employeeId,
                    date: attendanceDate,
                    status: normalizedStatus
                }
            });

            // Get updated counts for the month
            const startOfMonth = new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), 1);
            const endOfMonth = new Date(attendanceDate.getFullYear(), attendanceDate.getMonth() + 1, 0);

            const presentDays = await tx.attendance.count({
                where: {
                    employeeId,
                    status: 'PRESENT',
                    date: {
                        gte: startOfMonth,
                        lte: endOfMonth
                    }
                }
            });

            return {
                attendance,
                presentDays
            };
        });

        return NextResponse.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error('Attendance error:', error);
        return NextResponse.json(
            { error: 'Failed to update attendance' },
            { status: 500 }
        );
    }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    const attendance = await getAttendanceByDate(date);
    
    // Set cache headers
    const headers = {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
    };

    return NextResponse.json(attendance, { headers });
  } catch (error) {
    console.error('Attendance Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

