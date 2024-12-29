import { prisma } from '@/lib/db';

export async function GET(req, { params }) {
  const { date } = params;

  console.log('Received date:', date);

  try {
    // Parse the date and set it to the start of the day in UTC
    const parsedDate = new Date(date);
    parsedDate.setUTCHours(0, 0, 0, 0);

    if (isNaN(parsedDate.getTime())) {
      console.error('Invalid date format:', date);
      return new Response('Invalid date format', { status: 400 });
    }

    // console.log('Querying for date:', parsedDate.toISOString());

    const attendance = await prisma.attendance.findMany({
      where: {
        date: {
          gte: parsedDate,
          lt: new Date(parsedDate.getTime() + 24 * 60 * 60 * 1000), // Next day
        },
      },
      include: {
        employee: true,
      },
    });
    
    console.log(`Found ${attendance.length} attendance records`);

    return new Response(JSON.stringify(attendance), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
