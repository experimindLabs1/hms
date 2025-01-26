export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

export async function GET(request, { params }) {
    try {
        const user = await authenticateUser(request);
        if (!user || user.role !== 'ADMIN') {
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