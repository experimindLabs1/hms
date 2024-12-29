import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/utils/auth';

export async function PATCH(request, { params }) {
    try {
        const { id } = params;
        console.log('Admin: Updating leave request status for ID:', id);

        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            console.error('Admin: No token provided');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tokenData = await verifyToken(token);
        if (!tokenData || tokenData.role !== 'admin') {
            console.error('Admin: Invalid token or not admin role');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { status } = await request.json();
        console.log('Admin: New status:', status);

        // First, get the leave request with its dates and employee info
        const leaveRequest = await prisma.leaveRequest.findUnique({
            where: { id: parseInt(id) },
            include: {
                employee: true,
                leaveDates: true
            }
        });

        if (!leaveRequest) {
            return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
        }

        // Start a transaction to update both leave request and attendance
        const updatedRequest = await prisma.$transaction(async (prisma) => {
            // Update the leave request status
            const updated = await prisma.leaveRequest.update({
                where: { id: parseInt(id) },
                data: { status },
                include: {
                    employee: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            employeeId: true
                        }
                    },
                    leaveDates: true
                }
            });

            // If the request is approved, update or create attendance records
            if (status === 'APPROVED') {
                // Create or update attendance records for each leave date
                for (const leaveDate of leaveRequest.leaveDates) {
                    await prisma.attendance.upsert({
                        where: {
                            employeeId_date: {
                                employeeId: leaveRequest.employeeId,
                                date: leaveDate.date
                            }
                        },
                        create: {
                            employeeId: leaveRequest.employeeId,
                            date: leaveDate.date,
                            status: 'on leave',
                            type: 'LEAVE',
                            leaveRequestId: leaveRequest.id
                        },
                        update: {
                            status: 'on leave',
                            type: 'LEAVE',
                            leaveRequestId: leaveRequest.id
                        }
                    });
                }
                console.log('Admin: Updated attendance records for approved leave');
            }

            return updated;
        });

        console.log('Admin: Updated leave request and attendance:', updatedRequest);
        return NextResponse.json(updatedRequest);

    } catch (error) {
        console.error('Admin: Error updating leave request:', error);
        return NextResponse.json({ 
            error: 'Failed to update leave request',
            details: error.message 
        }, { status: 500 });
    }
} 