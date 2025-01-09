import prisma from '@/lib/db';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month'), 10);
    const year = parseInt(searchParams.get('year'), 10);

    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      console.error('No token provided');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error('Token verification failed:', error);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const employeeId = decoded.id;
    console.log('Fetching payroll for:', { employeeId, month, year });

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        attendance: {
          where: {
            AND: [
              { date: { gte: new Date(year, month - 1, 1) } },
              { date: { lt: new Date(year, month - 1 + 1, 1) } }
            ]
          }
        }
      }
    });

    if (!employee) {
      console.error('Employee not found:', employeeId);
      return new Response(JSON.stringify({ error: 'Employee not found' }), { status: 404 });
    }

    // Calculate the number of days in the given month
    const daysInMonth = new Date(year, month, 0).getDate();

    // Calculate per-day salary using actual days in month
    const perDaySalary = employee.baseSalary / daysInMonth;

    // Count unique present days
    const uniquePresentDays = new Set(
      employee.attendance
        .filter(a => a.status.toLowerCase() === 'present')
        .map(record => record.date.toISOString().split('T')[0])
    ).size;

    // Calculate payable amount
    const payableAmount = perDaySalary * uniquePresentDays;

    const payrollData = {
      amount: employee.baseSalary,
      perDaySalary: perDaySalary,
      payableAmount: payableAmount,
      uniquePresentDays: uniquePresentDays,
      daysInMonth: daysInMonth // Added for reference
    };

    console.log('Payroll data:', payrollData);
    return new Response(JSON.stringify(payrollData), { status: 200 });
  } catch (error) {
    console.error('Payroll fetch error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch payroll' }), { status: 500 });
  }
} 