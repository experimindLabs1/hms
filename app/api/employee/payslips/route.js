export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session) {
            console.log('No session found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('Session user:', session.user); // Debug log

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month') ? parseInt(searchParams.get('month')) : new Date().getMonth() + 1;
        const year = searchParams.get('year') ? parseInt(searchParams.get('year')) : new Date().getFullYear();

        console.log('Fetching payslips for:', { month, year, userId: session.user.id }); // Debug log

        const payslips = await prisma.payslip.findMany({
            where: {
                employeeId: session.user.id,
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

        console.log('Found payslips:', payslips); // Debug log
        return NextResponse.json(payslips);
        
    } catch (error) {
        console.error('Error fetching payslips:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payslips: ' + error.message },
            { status: 500 }
        );
    }
} 