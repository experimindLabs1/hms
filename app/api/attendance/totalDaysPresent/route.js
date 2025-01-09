import { prisma } from '/lib/db'; // Import Prisma Client

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    // Get employeeId from query parameters
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return new Response(JSON.stringify({ error: "Employee ID is required" }), { status: 400 });
    }

    // Get the current date and extract the current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Month is 0-indexed
    const currentYear = currentDate.getFullYear();

    // Fetch attendance records for the given employee in the current month
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        employeeId: parseInt(employeeId),
        status: "present",
        date: {
          gte: new Date(currentYear, currentMonth - 1, 1), // Start of the current month
          lt: new Date(currentYear, currentMonth, 0), // End of the current month
        },
      },
    });

    // Count the number of unique days the employee was present
    const uniquePresentDays = new Set(
      attendanceRecords.map((record) => record.date.toISOString().split("T")[0]) // Extract unique date strings
    ).size;

    // Log the fetched details for debugging
    console.log("Fetched attendance records:", attendanceRecords);
    console.log("Number of unique present days:", uniquePresentDays);

    // Return the total number of present days in the current month
    return new Response(
      JSON.stringify({
        // totalDaysPresent: attendanceRecords.length, // Total records fetched
        uniquePresentDays: uniquePresentDays, // Unique days the employee was present
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return new Response(JSON.stringify({ error: "Error fetching attendance data" }), { status: 500 });
  }
}
