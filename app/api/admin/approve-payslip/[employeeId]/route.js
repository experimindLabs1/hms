import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyAuth } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request, { params }) {
    try {
        // Verify admin authentication
        const authResult = await verifyAuth(request);
        if (!authResult.success || authResult.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { employeeId } = params;
        const { month, year } = await request.json();

        // Find the payslip
        const payslip = await prisma.payslip.findFirst({
            where: {
                employeeId: parseInt(employeeId),
                month: parseInt(month),
                year: parseInt(year)
            }
        });

        if (!payslip) {
            return NextResponse.json(
                { error: 'Payslip not found' },
                { status: 404 }
            );
        }

        // Update the payslip approval status
        const updatedPayslip = await prisma.payslip.update({
            where: {
                id: payslip.id
            },
            data: {
                isApproved: true,
                approvedBy: authResult.id,
                approvedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Payslip approved successfully',
            data: updatedPayslip
        });

    } catch (error) {
        console.error('Error approving payslip:', error);
        return NextResponse.json(
            { error: 'Failed to approve payslip' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// Get approval status
export async function GET(request, { params }) {
    try {
        const { employeeId } = params;
        const searchParams = request.nextUrl.searchParams;
        const month = searchParams.get('month');
        const year = searchParams.get('year');

        const payslip = await prisma.payslip.findFirst({
            where: {
                employeeId: parseInt(employeeId),
                month: parseInt(month),
                year: parseInt(year)
            },
            select: {
                isApproved: true,
                approvedAt: true,
                approvedBy: true
            }
        });

        if (!payslip) {
            return NextResponse.json(
                { error: 'Payslip not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: payslip
        });

    } catch (error) {
        console.error('Error fetching payslip approval status:', error);
        return NextResponse.json(
            { error: 'Failed to fetch approval status' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 