import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/utils/auth';

const prisma = new PrismaClient();

export async function PATCH(request, { params }) {
    try {
        const token = request.cookies.get('token')?.value;
        const authResult = await verifyToken(token);
        
        if (!authResult.success || authResult.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { canAccess } = await request.json();
        const employeeId = parseInt(params.id);

        // Simplified update operation
        const updatedEmployee = await prisma.$executeRaw`
            UPDATE Employee 
            SET canAccessPayslip = ${canAccess} 
            WHERE id = ${employeeId}
        `;

        return NextResponse.json({
            success: true,
            message: 'Payslip access updated successfully'
        });

    } catch (error) {
        console.error('Error updating payslip access:', error);
        return NextResponse.json(
            { error: 'Failed to update payslip access', details: error.message },
            { status: 500 }
        );
    }
} 