import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/utils/auth';

const prisma = new PrismaClient();

export async function POST(request) {
    try {
        const token = request.cookies.get('token')?.value;
        
        if (!token) {
            return NextResponse.json({ error: 'No token found' }, { status: 401 });
        }

        const authResult = await verifyToken(token);
        
        if (!authResult.success || authResult.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { employeeId, month, year, isApproved } = await request.json();

        // Only use fields that are definitely in the database
        const updatedPayslip = await prisma.payslip.upsert({
            where: {
                employeeId_month_year: {
                    employeeId: parseInt(employeeId),
                    month: parseInt(month),
                    year: parseInt(year)
                }
            },
            update: {
                isApproved,
                approvedAt: isApproved ? new Date() : null,
                amount: 0
            },
            create: {
                employeeId: parseInt(employeeId),
                month: parseInt(month),
                year: parseInt(year),
                isApproved,
                approvedAt: isApproved ? new Date() : null,
                amount: 0
            }
        });

        return NextResponse.json({
            success: true,
            message: `Payslip ${isApproved ? 'approved' : 'unapproved'} successfully`,
            data: updatedPayslip
        });

    } catch (error) {
        console.error('Error updating payslip approval:', error);
        return NextResponse.json(
            { error: 'Failed to update payslip approval', details: error.message },
            { status: 500 }
        );
    }
}

// GET endpoint to fetch payslip permissions
export async function GET() {
    try {
        const payslips = await prisma.payslip.findMany({
            select: {
                employeeId: true,
                isApproved: true
            }
        });

        // Convert array to object with employeeId as key
        const permissions = payslips.reduce((acc, curr) => {
            acc[curr.employeeId] = curr.isApproved;
            return acc;
        }, {});

        return NextResponse.json(permissions);
    } catch (error) {
        console.error('Error fetching payslip permissions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payslip permissions' },
            { status: 500 }
        );
    }
}
