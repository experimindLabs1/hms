import { NextResponse } from 'next/server';
import { prisma } from '/lib/db';
import { verifyToken } from '@/utils/auth';

export async function GET(request) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            console.log('No token found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tokenData = await verifyToken(token);
        console.log('Token data:', tokenData);

        if (!tokenData) {
            console.log('Invalid token data');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const employee = await prisma.employee.findUnique({
            where: { 
                employeeId: tokenData.employeeId 
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                position: true,
                department: true,
                dateOfJoining: true,
                employeeId: true,
                baseSalary: true,
                personalEmail: true,
                gender: true,
                dateOfBirth: true
            }
        });

        console.log('Found employee:', employee);

        if (!employee) {
            console.log('No employee found for ID:', tokenData.employeeId);
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        return NextResponse.json(employee);
    } catch (error) {
        console.error('Error in profile route:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 