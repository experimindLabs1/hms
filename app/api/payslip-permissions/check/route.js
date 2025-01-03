import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(req) {
    try {
        // Get token from header
        const token = req.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            console.error('Token verification failed:', error);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const employeeId = decoded.id;

        // Check if employee has permission
        const permission = await prisma.payslipPermission.findUnique({
            where: {
                employeeId: employeeId
            }
        });

        // Return true if permission exists and is allowed, false otherwise
        return NextResponse.json({
            allowed: permission?.allowed ?? false
        });

    } catch (error) {
        console.error('Error checking payslip permission:', error);
        return NextResponse.json(
            { error: 'Failed to check permission' }, 
            { status: 500 }
        );
    }
} 