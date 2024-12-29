import { prisma } from '/lib/db';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const month = parseInt(searchParams.get("month")) || new Date().getMonth() + 1;
        const year = parseInt(searchParams.get("year")) || new Date().getFullYear();

        // Fetch all employees with their attendance records
        const employees = await prisma.employee.findMany({
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

        // Calculate payroll information for each employee
        const employeesWithPayroll = employees.map(employee => {
            // Calculate payroll information based on baseSalary
            const perDaySalary = employee.baseSalary / 30; // Assuming 30 days per month
            const presentDays = employee.attendance.filter(a => a.status.toLowerCase() === 'present').length;
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
    const employeeData = await req.json();
    const {
      employeeId,
      password, // New field
      firstName,
      lastName,
      email,
      position,
      phone,
      gender,
      department,
      dateOfJoining,
      dateOfBirth,
      fatherName,
      pan,
      personalEmail,
      residentialAddress,
      paymentMode,
      accountNumber,
      accountHolderName,
      bankName,
      ifsc,
      accountType,
      baseSalary, // Include this field
    } = employeeData;

    const parsedBaseSalary = parseFloat(baseSalary);
    if (isNaN(parsedBaseSalary)) {
      throw new Error('Invalid baseSalary value');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newEmployee = await prisma.employee.create({
      data: {
        employeeId,
        password: hashedPassword, // Store the hashed password
        firstName,
        lastName,
        email,
        position,
        phone,
        gender,
        department,
        dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        fatherName,
        pan,
        personalEmail,
        residentialAddress,
        paymentMode,
        accountNumber,
        accountHolderName,
        bankName,
        ifsc,
        accountType,
        baseSalary: parsedBaseSalary, // Save it as a float

      },
    });
    return new Response(JSON.stringify(newEmployee), { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    console.log("Received employee ID:", id);

    const existingEmployee = await prisma.employee.findUnique({
      where: { id: parseInt(id) },
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

