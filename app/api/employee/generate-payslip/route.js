import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function POST(req) {
    try {
        const { month, year } = await req.json();
        console.log('Processing request for:', { month, year });

        // Verify token
        const token = req.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            console.error('No token provided');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            console.error('Token verification failed:', error);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const employeeId = decoded.id;
        console.log('Employee ID:', employeeId);

        // Fetch employee data
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId }
        });

        console.log('Employee data:', {
            id: employee.id,
            name: `${employee.firstName} ${employee.lastName}`,
            baseSalary: employee.baseSalary
        });

        // Fetch attendance data
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        
        console.log('Querying attendance for date range:', {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });

        const attendance = await prisma.attendance.findMany({
            where: {
                employeeId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });

        console.log('Found attendance records:', attendance);

        // Calculate payroll details
        const presentDays = attendance.filter(a => {
            console.log('Checking attendance record:', {
                date: a.date,
                status: a.status,
                isPresent: a.status.toLowerCase() === 'present'
            });
            return a.status.toLowerCase() === 'present';
        }).length;

        console.log('Present days calculated:', presentDays);

        const daysInMonth = new Date(year, month, 0).getDate();
        const perDaySalary = employee.baseSalary / daysInMonth;
        const payableAmount = perDaySalary * presentDays;

        console.log('Final calculations:', {
            daysInMonth,
            perDaySalary,
            presentDays,
            payableAmount
        });

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
        doc.text(`Employee Name: ${employee.firstName} ${employee.lastName}`, 20, y);
        y += 8;
        doc.text(`Employee ID: ${employee.employeeId || 'N/A'}`, 20, y);
        y += 8;
        doc.text(`Department: ${employee.department || 'N/A'}`, 20, y);
        y += 8;
        doc.text(`Position: ${employee.position || 'N/A'}`, 20, y);
        y += 15;

        // Salary details
        doc.text('SALARY DETAILS', 20, y);
        y += 10;

        // Create table-like structure
        const details = [
            ['Basic Salary', `Rs. ${employee.baseSalary.toFixed(2)}`],
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
                'Content-Disposition': `attachment; filename=payslip-${month}-${year}.pdf`
            }
        });
    } catch (error) {
        console.error('Error generating payslip:', error);
        return NextResponse.json({ error: 'Failed to generate payslip' }, { status: 500 });
    }
} 