import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        console.log('Deleting employee with ID:', id);

        // Use a transaction to delete all related records and then the employee
        await prisma.$transaction(async (prisma) => {
            // Delete all attendance records
            await prisma.attendance.deleteMany({
                where: { employeeId: parseInt(id) }
            });

            // Delete all leave dates through leave requests
            await prisma.leaveRequest.deleteMany({
                where: { employeeId: parseInt(id) }
            });

            // Finally delete the employee
            await prisma.employee.delete({
                where: { id: parseInt(id) }
            });
        });

        console.log('Successfully deleted employee and related records');
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

// GET an employee by ID
export async function GET(req, { params }) {
  const { id } = params;

  try {
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!employee) {
      return new Response(
        JSON.stringify({ error: 'Employee not found' }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(employee), { status: 200 });
  } catch (error) {
    console.error('Error fetching employee:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}

// PATCH to update employee information
export async function PATCH(req, { params }) {
  const { id } = params;

  try {
    const body = await req.json(); // Parse the JSON request body

    // Validate that at least one field is being updated
    if (Object.keys(body).length === 0) {
      return new Response(
        JSON.stringify({ error: 'No fields provided for update' }),
        { status: 400 }
      );
    }

    const existingEmployee = await prisma.employee.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existingEmployee) {
      return new Response(
        JSON.stringify({ error: 'Employee not found' }),
        { status: 404 }
      );
    }

    // Prepare the data for update
    const updateData = {};
    for (const [key, value] of Object.entries(body)) {
      // Handle special cases
      if (key === 'baseSalary') {
        updateData[key] = parseFloat(value);
      } else if (key === 'dateOfBirth' || key === 'dateOfJoining') {
        updateData[key] = new Date(value);
      } else {
        updateData[key] = value;
      }
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id: parseInt(id, 10) },
      data: updateData,
    });

    return new Response(
      JSON.stringify({ message: 'Employee updated successfully', employee: updatedEmployee }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating employee:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}

