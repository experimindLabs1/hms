export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

export async function GET(request) {
    try {
        const user = await authenticateUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month') ? parseInt(searchParams.get('month')) : new Date().getMonth() + 1;
        const year = searchParams.get('year') ? parseInt(searchParams.get('year')) : new Date().getFullYear();

        const payslips = await prisma.payslip.findMany({
            where: {
                employeeId: user.id,
                month: month,
                year: year
            },
            select: {
                id: true,
                month: true,
                year: true,
                basicSalary: true,
                grossEarnings: true,
                totalDeductions: true,
                netPayable: true,
                paidDays: true,
                lopDays: true,
                payDate: true
            },
            orderBy: {
                payDate: 'desc'
            }
        });

        return NextResponse.json(payslips);
        
    } catch (error) {
        console.error('Error fetching payslips:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payslips: ' + error.message },
            { status: 500 }
        );
    }
} 