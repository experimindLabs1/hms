import { prisma } from '/lib/db'; // Import Prisma Client

export async function POST(req) {
  try {
    const { employeeId, status, date } = await req.json();

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });
    if (!employee) {
      return new Response(JSON.stringify({ error: 'Employee not found' }), {
        status: 404,
      });
    }

    // Use upsert to create or update the attendance record
    const attendanceRecord = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: new Date(Date.UTC(
            new Date(date).getUTCFullYear(),
            new Date(date).getUTCMonth(),
            new Date(date).getUTCDate()
          )),
        },
      },
      update: {
        status,
      },
      create: {
        employeeId,
        status,
        date: new Date(Date.UTC(
          new Date(date).getUTCFullYear(),
          new Date(date).getUTCMonth(),
          new Date(date).getUTCDate()
        )),
      },
    });

    return new Response(JSON.stringify(attendanceRecord), { status: 200 });
  } catch (error) {
    console.error('Error creating/updating attendance record:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const attendance = await prisma.attendance.findMany();
    return new Response(JSON.stringify(attendance), { status: 200 });
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}

