export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';
import { getAttendanceByDate } from '@/services/attendanceService'

const VALID_STATUSES = new Set(['PRESENT', 'ABSENT', 'ON_LEAVE', 'UNMARKED']);

export async function POST(request) {
    try {
        // Check authentication
        const user = await authenticateUser(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
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

        // Fix timezone handling
        const localDate = new Date(date);
        localDate.setHours(0, 0, 0, 0);
        const tzOffset = localDate.getTimezoneOffset() * 60000; // offset in milliseconds
        const attendanceDate = new Date(localDate.getTime() - tzOffset);

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
            { error: 'Failed to mark attendance' },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    try {
        // Check authentication
        const user = await authenticateUser(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        
        // Fix timezone for GET request
        const localDate = new Date(date);
        localDate.setHours(0, 0, 0, 0);
        const tzOffset = localDate.getTimezoneOffset() * 60000;
        const adjustedDate = new Date(localDate.getTime() - tzOffset);
        
        const attendance = await getAttendanceByDate(adjustedDate);
        
        return NextResponse.json(attendance, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
            }
        });
    } catch (error) {
        console.error('Attendance error:', error);
        return NextResponse.json(
            { error: 'Failed to get attendance status' },
            { status: 500 }
        );
    }
}

