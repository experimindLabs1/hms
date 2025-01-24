import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET employee details
export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        const employee = await prisma.user.findUnique({
            where: {
                id: id
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

        // Remove sensitive information
        const { password, resetToken, resetTokenExpiry, ...safeEmployee } = employee;

        return NextResponse.json(safeEmployee);
    } catch (error) {
        console.error('Error fetching employee:', error);
        return NextResponse.json(
            { error: 'Failed to fetch employee data' },
            { status: 500 }
        );
    }
}

// DELETE employee
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        // Delete related records first
        await prisma.$transaction([
            prisma.attendance.deleteMany({
                where: { employeeId: id }
            }),
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
            prisma.leaveBalance.delete({
                where: { employeeId: id }
            }).catch(() => {}), // Ignore if doesn't exist
            prisma.employeeDetails.delete({
                where: { employeeId: id }
            }).catch(() => {}), // Ignore if doesn't exist
            prisma.payslip.deleteMany({
                where: { employeeId: id }
            }),
            prisma.user.delete({
                where: { id: id }
            })
        ]);

        return NextResponse.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        return NextResponse.json(
            { error: 'Failed to delete employee' },
            { status: 500 }
        );
    }
}

// PATCH employee details
export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
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

        // Remove sensitive information
        const { password, resetToken, resetTokenExpiry, ...safeEmployee } = updatedEmployee;

        return NextResponse.json(safeEmployee);
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