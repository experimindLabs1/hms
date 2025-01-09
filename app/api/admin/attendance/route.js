import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';


export async function POST(req) {
    try {
        const body = await req.json();
        console.log('Received attendance request body:', body);

        const { employeeId, date, status, type, leaveRequestId } = body;

        // Convert employeeId and leaveRequestId to numbers
        const employeeIdNum = Number(employeeId);
        const leaveRequestIdNum = leaveRequestId ? Number(leaveRequestId) : null;

        const attendance = await prisma.attendance.upsert({
            where: {
                employeeId_date: {
                    employeeId: employeeIdNum,
                    date: new Date(date + 'T00:00:00.000Z')
                }
            },
            update: {
                status: status,
                type: type,
                leaveRequestId: leaveRequestIdNum
            },
            create: {
                employeeId: employeeIdNum,
                date: new Date(date + 'T00:00:00.000Z'),
                status: status,
                type: type,
                leaveRequestId: leaveRequestIdNum
            }
        });

        console.log('Created/Updated attendance:', attendance);
        return NextResponse.json(attendance);
    } catch (error) {
        console.error('Detailed error:', error);
        return NextResponse.json(
            { error: 'Failed to create attendance record', details: error.message },
            { status: 500 }
        );
    }
} 