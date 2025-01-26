export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

// GET employee details
export async function GET(request, { params }) {
    try {
        const user = await authenticateUser(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const employee = await prisma.user.findUnique({
            where: {
                id: params.id
            },
            include: {
                employeeDetails: true,
                leaveBalance: true,
                leaveRequests: {
                    include: {
                        leaveDates: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                attendance: {
                    orderBy: {
                        date: 'desc'
                    },
                    take: 30 // Last 30 days of attendance
                },
                payslips: {
                    orderBy: {
                        payDate: 'desc'
                    },
                    take: 12 // Last 12 months of payslips
                }
            }
        });

        if (!employee) {
            return NextResponse.json(
                { error: 'Employee not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(employee);
    } catch (error) {
        console.error('Error fetching employee:', error);
        return NextResponse.json(
            { error: 'Failed to fetch employee' },
            { status: 500 }
        );
    }
}

// DELETE employee
export async function DELETE(request, { params }) {
    try {
        const user = await authenticateUser(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = params;

        // First check if employee exists
        const employee = await prisma.user.findUnique({
            where: { id },
            include: {
                employeeDetails: true
            }
        });

        if (!employee) {
            return NextResponse.json(
                { error: 'Employee not found' },
                { status: 404 }
            );
        }

        // Delete employee and related records in a transaction
        await prisma.$transaction([
            // Delete attendance records
            prisma.attendance.deleteMany({
                where: { employeeId: id }
            }),
            // Delete leave requests and associated dates
            prisma.leaveDate.deleteMany({
                where: {
                    leaveRequest: {
                        employeeId: id
                    }
                }
            }),
            prisma.leaveRequest.deleteMany({
                where: { employeeId: id }
            }),
            // Delete leave balance
            prisma.leaveBalance.deleteMany({
                where: { employeeId: id }
            }),
            // Delete payslips
            prisma.payslip.deleteMany({
                where: { employeeId: id }
            }),
            // Delete employee details only if they exist
            ...(employee.employeeDetails 
                ? [prisma.employeeDetails.delete({
                    where: { employeeId: id }
                })]
                : []
            ),
            // Finally delete the user
            prisma.user.delete({
                where: { id }
            })
        ]);

        return NextResponse.json({ message: 'Employee deleted successfully' });

    } catch (error) {
        console.error('Error deleting employee:', error);
        return NextResponse.json(
            { 
                error: 'Failed to delete employee',
                details: error.message
            },
            { status: 500 }
        );
    }
}

// PATCH employee details
export async function PATCH(request, { params }) {
    try {
        const user = await authenticateUser(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const data = await request.json();

        const { employeeDetails, leaveBalance, ...userData } = data;

        // Update user data
        const updatedEmployee = await prisma.user.update({
            where: { id },
            data: {
                ...userData,
                employeeDetails: employeeDetails ? {
                    update: employeeDetails
                } : undefined,
                leaveBalance: leaveBalance ? {
                    update: leaveBalance
                } : undefined
            },
            include: {
                employeeDetails: true,
                leaveBalance: true
            }
        });

        return NextResponse.json(updatedEmployee);
    } catch (error) {
        console.error('Error updating employee:', error);
        return NextResponse.json(
            { error: 'Failed to update employee' },
            { status: 500 }
        );
    }
}

// UPDATE employee details
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();

        // Update user and employee details in a transaction
        const updatedEmployee = await prisma.$transaction(async (tx) => {
            // Update user basic info
            const user = await tx.user.update({
                where: { id: params.id },
                data: {
                    name: data.name,
                    email: data.email,
                }
            });

            // Update or create employee details
            const details = await tx.employeeDetails.upsert({
                where: { userId: params.id },
                update: {
                    position: data.position,
                    department: data.department,
                    salary: parseFloat(data.salary),
                    bankName: data.bankName,
                    bankAccountNumber: data.bankAccountNumber,
                },
                create: {
                    userId: params.id,
                    position: data.position,
                    department: data.department,
                    salary: parseFloat(data.salary),
                    bankName: data.bankName,
                    bankAccountNumber: data.bankAccountNumber,
                }
            });

            return { ...user, employeeDetails: details };
        });

        return NextResponse.json(updatedEmployee);

    } catch (error) {
        console.error('Error updating employee:', error);
        return NextResponse.json(
            { error: 'Failed to update employee details' },
            { status: 500 }
        );
    }
} 