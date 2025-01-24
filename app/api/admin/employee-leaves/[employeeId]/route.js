import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { employeeId } = params;

        const leaveHistory = await prisma.leaveRequest.findMany({
            where: {
                employeeId: employeeId
            },
            include: {
                leaveDates: {
                    orderBy: {
                        date: 'asc'
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(leaveHistory);
    } catch (error) {
        console.error('Error fetching employee leave history:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leave history' },
            { status: 500 }
        );
    }
} 