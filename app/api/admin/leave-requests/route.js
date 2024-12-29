import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/utils/auth';

export async function GET(request) {
    try {
        console.log('Admin: Starting to fetch leave requests...');
        const token = request.headers.get('authorization')?.split(' ')[1];
        
        if (!token) {
            console.error('Admin: No token provided');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tokenData = await verifyToken(token);
        console.log('Admin: Token data:', tokenData);

        if (!tokenData || tokenData.role !== 'admin') {
            console.error('Admin: Invalid token or not admin role');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('Admin: Querying database for leave requests...');

        // Updated query to sort by latest first
        const leaveRequests = await prisma.leaveRequest.findMany({
            include: {
                employee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeId: true
                    }
                },
                leaveDates: {
                    orderBy: {
                        date: 'asc' // Keep dates in chronological order
                    }
                }
            },
            orderBy: [
                {
                    createdAt: 'desc' // Latest requests first
                }
            ]
        });

        console.log('Admin: Successfully fetched leave requests:', leaveRequests.length);
        return NextResponse.json(leaveRequests);

    } catch (error) {
        console.error('Admin: Error fetching leave requests:', error);
        return NextResponse.json({ 
            error: 'Failed to fetch leave requests',
            details: error.message 
        }, { status: 500 });
    }
}

// Add PATCH handler for updating leave requests
export async function PATCH(request, { params }) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 });
        }

        const tokenData = await verifyToken(token);
        if (!tokenData || tokenData.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const { status, dates } = await request.json();

        console.log('Updating leave request:', { id, status, dates });

        // Update the leave request with explicit dates
        const updatedLeaveRequest = await prisma.leaveRequest.update({
            where: { id: Number(id) },
            data: {
                status,
                leaveDates: {
                    deleteMany: {}, // Delete existing dates
                    create: dates.map(date => ({ date: new Date(date) })) // Create new dates
                }
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        employeeId: true,
                        firstName: true,
                        lastName: true,
                    }
                },
                leaveDates: {
                    select: {
                        date: true
                    }
                }
            }
        });

        return NextResponse.json(updatedLeaveRequest);

    } catch (error) {
        console.error('Error updating leave request:', error);
        return NextResponse.json({ 
            error: 'Internal server error', 
            details: error.message 
        }, { status: 500 });
    }
} 