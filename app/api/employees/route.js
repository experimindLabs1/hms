import { prisma } from '/lib/db';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const month = parseInt(searchParams.get("month")) || new Date().getMonth() + 1;
        const year = parseInt(searchParams.get("year")) || new Date().getFullYear();
        const limit = 50; // Add reasonable limit

        // First, get employees with basic info
        const employees = await prisma.employee.findMany({
            take: limit,
            select: {
                id: true,
                employeeId: true,
                firstName: true,
                lastName: true,
                baseSalary: true,
            }
        });

        // Then, get attendance data in a separate query
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);
        
        const attendance = await prisma.attendance.groupBy({
            by: ['employeeId'],
            where: {
                employeeId: {
                    in: employees.map(emp => emp.id)
                },
                date: {
                    gte: startDate,
                    lt: endDate
                },
                status: 'present'
            },
            _count: {
                status: true
            }
        });

        // Combine the data
        const employeesWithPayroll = employees.map(employee => {
            const presentDays = attendance.find(a => a.employeeId === employee.id)?._count?.status || 0;
            const perDaySalary = employee.baseSalary / 30;
            const payableAmount = perDaySalary * presentDays;

            return {
                ...employee,
                perDaySalary,
                payableAmount,
                uniquePresentDays: presentDays
            };
        });

        return NextResponse.json(employeesWithPayroll);
    } catch (error) {
        console.error("Error fetching employees:", error);
        return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const data = await req.json();
        
        // Validate and format dates
        const validateDate = (dateStr) => {
            if (!dateStr) return null;
            const date = new Date(dateStr);
            // Check if date is valid and within reasonable range (1900-2100)
            if (isNaN(date.getTime()) || date.getFullYear() < 1900 || date.getFullYear() > 2100) {
                throw new Error('Invalid date format or out of range');
            }
            return date.toISOString();
        };

        const formattedData = {
            ...data,
            dateOfJoining: validateDate(data.dateOfJoining),
            dateOfBirth: validateDate(data.dateOfBirth),
            baseSalary: parseFloat(data.baseSalary)
        };

        const employee = await prisma.employee.create({
            data: formattedData,
            select: {
                id: true,
                employeeId: true,
                firstName: true,
                lastName: true,
                email: true,
                position: true,
                department: true,
                dateOfJoining: true,
                baseSalary: true
            }
        });

        return NextResponse.json(employee);
    } catch (error) {
        console.error("Error creating employee:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create employee" },
            { status: 400 }
        );
    }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    console.log("Received employee ID:", id);

    const existingEmployee = await prisma.employee.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true
      }
    });

    if (!existingEmployee) {
      return new Response(
        JSON.stringify({ error: 'Employee not found' }),
        { status: 404 }
      );
    }

    await prisma.employee.delete({
      where: { id: parseInt(id) },
    });

    return new Response(
      JSON.stringify({ message: 'Employee deleted successfully' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting employee:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

