export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

export async function GET(request) {
    try {
        const user = await authenticateUser(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const leaveRequests = await prisma.leaveRequest.findMany({
            where: {
                status: 'PENDING'
            },
            include: {
                employee: {
                    select: {
                        name: true,
                        email: true,
                        employeeDetails: {
                            select: {
                                department: true,
                                position: true
                            }
                        }
                    }
                },
                leaveDates: {
                    select: {
                        date: true
                    }
                }
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

export async function PATCH(request) {
    try {
        const user = await authenticateUser(request);
        if (!user || user.role !== 'ADMIN') {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }    

        const data = await request.json();
        const { leaveRequestId, status } = data;

        const updatedRequest = await prisma.leaveRequest.update({
            where: { id: leaveRequestId },
            data: { status },
            include: {
                employee: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                leaveDates: true
            }
        });

        if (status === 'APPROVED') {
            await Promise.all(
                updatedRequest.leaveDates.map(date =>
                    prisma.attendance.upsert({
                        where: {
                            employeeId_date: {
                                employeeId: updatedRequest.employeeId,
                                date: date.date
                            }
                        },
                        update: {
                            status: 'ON_LEAVE'
                        },
                        create: {
                            employeeId: updatedRequest.employeeId,
                            date: date.date,
                            status: 'ON_LEAVE'
                        }
                    })
                )
            );
        }

        return NextResponse.json(updatedRequest);
    } catch (error) {
        console.error('Error updating leave request:', error);
        return NextResponse.json(
            { error: 'Failed to update leave request' },
            { status: 500 }
        );
    }
} 