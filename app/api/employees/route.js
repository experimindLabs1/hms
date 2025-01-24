import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

async function generateEmployeeCode() {
    // Find the last employee code
    const lastEmployee = await prisma.employeeDetails.findFirst({
        orderBy: {
            employeeCode: 'desc'
        }
    });

    if (!lastEmployee) {
        return 'EMP001'; // First employee
    }

    // Extract the number from the last code and increment
    const lastNumber = parseInt(lastEmployee.employeeCode.replace('EMP', ''));
    const nextNumber = lastNumber + 1;
    return `EMP${nextNumber.toString().padStart(3, '0')}`;
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        
        // Generate the next employee code
        const employeeCode = await generateEmployeeCode();

        // Hash the password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Validate required fields
        if (!data.bankAccountNumber) {
            return NextResponse.json(
                { error: 'Bank account number is required' },
                { status: 400 }
            );
        }

        // Parse salary as float
        const salary = parseFloat(data.salary);
        if (isNaN(salary)) {
            return NextResponse.json(
                { error: 'Valid salary is required' },
                { status: 400 }
            );
        }

        // Validate date
        const joinedAt = new Date(data.dateOfJoining);
        if (isNaN(joinedAt.getTime())) {
            return NextResponse.json(
                { error: 'Valid joining date is required' },
                { status: 400 }
            );
        }

        // Create user with employee details
        const newUser = await prisma.user.create({
            data: {
                email: data.email,
                username: data.email.split('@')[0],
                password: hashedPassword,
                name: data.name,
                role: 'EMPLOYEE',
                employeeDetails: {
                    create: {
                        employeeCode,
                        position: data.position || 'Not Specified',
                        department: data.department || 'Not Specified',
                        salary: salary,
                        bankAccountNumber: data.bankAccountNumber,
                        bankName: data.bankName || 'Not Specified',
                        taxId: data.taxId || 'Not Specified',
                        joinedAt: joinedAt,
                        employmentType: data.employmentType || 'FULL_TIME'
                    }
                }
            },
            include: {
                employeeDetails: true
            }
        });

        // Remove sensitive information
        const { password, ...userWithoutPassword } = newUser;
        
        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error('Error creating employee:', error);
        return NextResponse.json(
            { error: 'Failed to create employee: ' + error.message },
            { status: 500 }
        );
    }
} 