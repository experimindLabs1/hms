import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { employeeId, month, year } = await req.json();

        // Fetch employee data
        const employee = await prisma.user.findUnique({
            where: { id: employeeId },
            include: {
                employeeDetails: true
            }
        });

        if (!employee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        // Fetch attendance data
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        
        const attendance = await prisma.attendance.findMany({
            where: {
                employeeId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });

        // Calculate payroll details
        const daysInMonth = new Date(year, month, 0).getDate();
        const perDaySalary = employee.baseSalary ? employee.baseSalary / daysInMonth : 0;
        const presentDays = attendance.filter(a => a.status.toLowerCase() === 'present').length;
        const payableAmount = perDaySalary * presentDays;

        // Create PDF document
        const doc = new jsPDF();
        
        // Set initial y position
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
        doc.text(`Employee Name: ${employee.firstName || 'N/A'} ${employee.lastName || 'N/A'}`, 20, y);
        y += 8;
        doc.text(`Employee ID: ${employee.employeeId || 'N/A'}`, 20, y);
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
            ['Basic Salary', `Rs. ${(employee.baseSalary || 0).toFixed(2)}`],
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
                'Content-Disposition': `attachment; filename=payslip-${employee.firstName || 'N/A'}-${month}-${year}.pdf`
            }
        });
    } catch (error) {
        console.error('Error generating payslip:', error);
        return NextResponse.json({ error: 'Failed to generate payslip' }, { status: 500 });
    }
} 