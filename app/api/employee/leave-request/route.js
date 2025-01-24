import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { reason, leaveType, dates } = data;

        // Create leave request with dates
        const leaveRequest = await prisma.leaveRequest.create({
            data: {
                employeeId: session.user.id,
                reason,
                leaveType,
                leaveDates: {
                    create: dates.map(date => ({
                        date: new Date(date)
                    }))
                }
            },
            include: {
                leaveDates: true
            }
        });

        return NextResponse.json(leaveRequest);
    } catch (error) {
        console.error('Error creating leave request:', error);
        return NextResponse.json(
            { error: 'Failed to create leave request' },
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

        const leaveRequests = await prisma.leaveRequest.findMany({
            where: {
                employeeId: session.user.id
            },
            include: {
                leaveDates: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(leaveRequests);
    } catch (error) {
        console.error('Error fetching leave requests:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leave requests' },
            { status: 500 }
        );
    }
} 