import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/utils/auth';

const prisma = new PrismaClient();

export async function GET(request) {
    try {
        const token = request.cookies.get('token')?.value;
        const authResult = await verifyToken(token);

        if (!authResult.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('Auth Result:', authResult);

        const employee = await prisma.employee.findUnique({
            where: {
                id: authResult.id
            }
        });

        console.log('Found Employee:', {
            id: employee.id,
            canAccessPayslip: employee.canAccessPayslip,
            firstName: employee.firstName
        });

        if (!employee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        const response = {
            ...employee,
            canAccessPayslip: employee.canAccessPayslip ?? false
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error fetching employee profile:', error);
        return NextResponse.json(
            { error: 'Failed to fetch employee profile', details: error.message },
            { status: 500 }
        );
    }
} 