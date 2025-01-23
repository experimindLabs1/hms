import { prisma } from '/lib/db'; // Import Prisma Client

export async function POST(req) {
  try {
    const { employeeId, status, date } = await req.json();
    
    // Convert date string to Date object
    const formattedDate = new Date(date);
    
    const attendance = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: employeeId,
          date: formattedDate
        }
      },
      update: { 
        status: status,
        updatedAt: new Date() // Add this to force update
      },
      create: {
        employeeId: employeeId,
        status: status,
        date: formattedDate
      },
      select: {
        id: true,
        status: true,
        date: true,
        employeeId: true
      }
    });

    return Response.json(attendance);
  } catch (error) {
    console.error('Attendance update error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    const date = searchParams.get('date');

    const attendance = await prisma.attendance.findMany({
      take: limit,
      skip: skip,
      where: date ? {
        date: {
          equals: new Date(date).toISOString()
        }
      } : undefined,
      orderBy: {
        date: 'desc'
      },
      select: {
        id: true,
        employeeId: true,
        status: true,
        date: true
      }
    });

    const total = await prisma.attendance.count({
      where: date ? {
        date: {
          equals: new Date(date).toISOString()
        }
      } : undefined
    });

    return Response.json({
      data: attendance,
      pagination: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return Response.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

