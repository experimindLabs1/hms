import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import PDFDocument from 'pdfkit';

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = parseInt(searchParams.get('employeeId'));
    const month = parseInt(searchParams.get('month'));
    const year = parseInt(searchParams.get('year'));

    // Fetch payslip data
    const payslip = await prisma.payslip.findUnique({
      where: {
        employeeId_month_year: {
          employeeId,
          month,
          year
        }
      },
      include: {
        employee: true
      }
    });

    if (!payslip) {
      return NextResponse.json({ error: 'Payslip not found' }, { status: 404 });
    }

    // Create PDF
    const doc = new PDFDocument();
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    
    // Add content to PDF
    doc
      .fontSize(20)
      .text('EXPERIMIND LABS PRIVATE LIMITED', { align: 'center' })
      .fontSize(12)
      .moveDown()
      .text('Mandodari Nilaya, Gadhalli Cross Sirsi Karnataka 581401 India', { align: 'center' })
      .moveDown()
      .text(`Payslip for ${new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`, { align: 'center' })
      .moveDown()
      .moveDown();

    // Employee details
    doc
      .fontSize(14)
      .text('Employee Details')
      .fontSize(10)
      .moveDown()
      .text(`Name: ${payslip.employee.firstName} ${payslip.employee.lastName}`)
      .text(`Employee ID: ${payslip.employee.employeeId}`)
      .text(`Department: ${payslip.employee.department}`)
      .moveDown();

    // Salary details
    doc
      .fontSize(14)
      .text('Salary Details')
      .fontSize(10)
      .moveDown()
      .text(`Basic Salary: ₹${payslip.basicSalary.toFixed(2)}`)
      .text(`Gross Earnings: ₹${payslip.grossEarnings.toFixed(2)}`)
      .text(`Total Deductions: ₹${payslip.totalDeductions.toFixed(2)}`)
      .text(`Net Payable: ₹${payslip.netPayable.toFixed(2)}`)
      .moveDown();

    // Attendance details
    doc
      .fontSize(14)
      .text('Attendance Details')
      .fontSize(10)
      .moveDown()
      .text(`Paid Days: ${payslip.paidDays}`)
      .text(`LOP Days: ${payslip.lopDays}`)
      .moveDown();

    doc.end();

    // Combine chunks into a single buffer
    const pdfBuffer = Buffer.concat(chunks);

    // Return PDF
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=payslip-${employeeId}-${month}-${year}.pdf`
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
} 