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

        // Fetch employee data with attendance for the specified month
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            include: {
                attendance: {
                    where: {
                        AND: [
                            { date: { gte: new Date(year, month - 1, 1) } },
                            { date: { lt: new Date(year, month, 1) } }
                        ]
                    }
                }
            }
        });

        if (!employee) {
            return new Response(JSON.stringify({ error: 'Employee not found' }), { status: 404 });
        }

        // Calculate payslip details
        const presentDays = employee.attendance.filter(a => a.status.toLowerCase() === 'present').length;
        const daysInMonth = new Date(year, month, 0).getDate();
        const perDaySalary = employee.baseSalary / daysInMonth;
        const payableAmount = perDaySalary * presentDays;

        const payslipData = {
            id: `${year}-${month}-${employeeId}`,
            month: new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' }),
            amount: payableAmount,
            date: new Date(year, month - 1, 1).toISOString(),
            baseSalary: employee.baseSalary,
            perDaySalary: perDaySalary,
            presentDays: presentDays,
            daysInMonth: daysInMonth
        };

        return new Response(JSON.stringify(payslipData), { status: 200 });
    } catch (error) {
        console.error('Error fetching payslip:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch payslip data' }), { status: 500 });
    }
} 