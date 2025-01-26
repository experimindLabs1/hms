export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateUser, hashPassword } from '@/lib/auth';

export async function POST(req) {
    try {
        const data = await req.json();
        
        // Hash the password before storing
        const hashedPassword = await hashPassword(data.password);
        
        // Get the latest employee ID
        const lastEmployee = await prisma.user.findFirst({
            where: {
                role: 'EMPLOYEE'
            },
            orderBy: {
                employeeId: 'desc'
            }
        });

        // Generate new employee ID
        let newEmployeeId;
        if (!lastEmployee) {
            newEmployeeId = 'EMP001';  // First employee
        } else {
            const lastNumber = parseInt(lastEmployee.employeeId.replace('EMP', ''));
            newEmployeeId = `EMP${String(lastNumber + 1).padStart(3, '0')}`;
        }

        // Create user with auto-generated employeeId and all related records
        const user = await prisma.user.create({
            data: {
                employeeId: newEmployeeId,
                email: data.email,
                password: hashedPassword,
                name: data.name,
                role: "EMPLOYEE",
                employeeDetails: {
                    create: {
                        position: data.position,
                        department: data.department,
                        salary: data.salary,
                        bankAccountNumber: data.bankAccountNumber,
                        bankName: data.bankName,
                        employmentType: data.employmentType,
                        joinedAt: data.joinedAt,
                        dateOfBirth: data.dateOfBirth,
                        personalEmail: data.personalEmail,
                        phone: data.phone,
                        address: data.address,
                        gender: data.gender,
                    }
                },
                leaveBalance: {
                    create: {
                        annual: 18,
                        sick: 12,
                        maternity: 180,
                        paternity: 30,
                        unpaid: 0
                    }
                }
            },
            include: {
                employeeDetails: true,
                leaveBalance: true
            }
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error('Error creating employee:', error);
        return NextResponse.json(
            { error: 'Failed to create employee', details: error.message },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    try {
        const user = await authenticateUser(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const employees = await prisma.user.findMany({
            where: {
                role: 'EMPLOYEE'
            },
            include: {
                employeeDetails: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        // Remove passwords from response
        const safeEmployees = employees.map(emp => {
            const { password, ...employeeWithoutPassword } = emp;
            return employeeWithoutPassword;
        });

        return NextResponse.json(safeEmployees);

    } catch (error) {
        console.error('Error fetching employees:', error);
        return NextResponse.json(
            { error: 'Failed to fetch employees' },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const user = await authenticateUser(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const url = new URL(request.url);
        const employeeId = url.pathname.split('/').pop();

        // Check if the employee exists
        const employee = await prisma.user.findUnique({
            where: { id: employeeId },
            include: { employeeDetails: true }
        });

        if (!employee) {
            return NextResponse.json(
                { error: 'Employee not found' },
                { status: 404 }
            );
        }

        // Delete the employee and related details
        await prisma.user.delete({
            where: { id: employeeId }
        });

        return NextResponse.json({ message: 'Employee deleted successfully' });

    } catch (error) {
        console.error('Error deleting employee:', error);
        return NextResponse.json(
            { error: 'Failed to delete employee' },
            { status: 500 }
        );
    }
} 