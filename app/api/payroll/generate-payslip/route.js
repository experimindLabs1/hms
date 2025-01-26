export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { prisma } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

export async function POST(request) {
    try {
        const user = await authenticateUser(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { employeeId, month, year } = await request.json();

        // Fetch employee data
        const employee = await prisma.user.findUnique({
            where: { id: employeeId },
            include: {
                employeeDetails: true,
                attendance: {
                    where: {
                        date: {
                            gte: new Date(year, month - 1, 1),
                            lt: new Date(year, month, 1)
                        }
                    }
                }
            }
        });

        if (!employee) {
            return NextResponse.json(
                { error: 'Employee not found' },
                { status: 404 }
            );
        }

        // Calculate payroll details
        const daysInMonth = new Date(year, month, 0).getDate();
        const perDaySalary = employee.employeeDetails?.salary ? employee.employeeDetails.salary / daysInMonth : 0;
        const presentDays = employee.attendance.filter(a => a.status === 'PRESENT').length;
        const payableAmount = perDaySalary * presentDays;

        // Create PDF document
        const doc = new jsPDF();
        let y = 20;

        // Add company header
        doc.setFontSize(20);
        doc.text('Experimind Labs Private Limited', 105, y, { align: 'center' });
        y += 10;

        doc.setFontSize(16);
        doc.text('SALARY SLIP', 105, y, { align: 'center' });
        y += 20;

        // Add month and year
        doc.setFontSize(12);
        doc.text(`For the month of: ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`, 20, y);
        y += 15;

        // Employee details
        doc.text(`Employee Name: ${employee.name || 'N/A'}`, 20, y);
        y += 8;
        doc.text(`Employee ID: ${employee.employeeDetails?.employeeCode || 'N/A'}`, 20, y);
        y += 8;
        doc.text(`Department: ${employee.employeeDetails?.department || 'N/A'}`, 20, y);
        y += 8;
        doc.text(`Position: ${employee.employeeDetails?.position || 'N/A'}`, 20, y);
        y += 15;

        // Salary details
        doc.text('SALARY DETAILS', 20, y);
        y += 10;

        // Create table-like structure
        const details = [
            ['Basic Salary', `Rs. ${(employee.employeeDetails?.salary || 0).toFixed(2)}`],
            ['Per Day Salary', `Rs. ${perDaySalary.toFixed(2)}`],
            ['Days in Month', daysInMonth.toString()],
            ['Present Days', presentDays.toString()],
            ['Payable Amount', `Rs. ${payableAmount.toFixed(2)}`]
        ];

        details.forEach(([label, value]) => {
            doc.text(label, 20, y);
            doc.text(value, 120, y);
            y += 8;
        });

        // Add footer
        doc.setFontSize(10);
        doc.text('This is a computer-generated document and does not require a signature.', 105, 270, { align: 'center' });

        // Get PDF as bytes
        const pdfBytes = doc.output('arraybuffer');

        // Return the PDF
        return new NextResponse(pdfBytes, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=payslip-${employee.name || 'employee'}-${month}-${year}.pdf`
            }
        });
    } catch (error) {
        console.error('Error generating payslip:', error);
        return NextResponse.json(
            { error: 'Failed to generate payslip' },
            { status: 500 }
        );
    }
} 