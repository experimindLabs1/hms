import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/utils/auth';

export async function POST(request) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tokenData = await verifyToken(token);
        if (!tokenData) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const body = await request.json();
        const { selectedDates, reason } = body;

        console.log('Received request:', { selectedDates, reason });

        // Find the employee using id instead of email
        const employee = await prisma.employee.findUnique({
            where: { id: tokenData.id }
        });

        if (!employee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        console.log('Found employee:', employee);

        // Create leave request with explicit dates
        const leaveRequest = await prisma.leaveRequest.create({
            data: {
                employeeId: employee.id,
                reason: reason,
                status: 'PENDING',
                leaveDates: {
                    create: selectedDates.map(date => ({ 
                        date: new Date(date)
                    }))
                }
            },
            include: {
                leaveDates: true,
                employee: true
            }
        });

        console.log('Created leave request:', leaveRequest);
        return NextResponse.json(leaveRequest);

    } catch (error) {
        console.error('Error creating leave request:', error);
        return NextResponse.json({ 
            error: 'Internal server error', 
            details: error.message 
        }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tokenData = await verifyToken(token);
        if (!tokenData) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const leaveRequests = await prisma.leaveRequest.findMany({
            where: {
                employeeId: tokenData.id
            },
            include: {
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
        return NextResponse.json({ 
            error: 'Internal server error', 
            details: error.message 
        }, { status: 500 });
    }
} 