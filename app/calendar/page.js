"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import CustomCalendar from "./components/CustomCalendar";

// Helper to ensure the date is always in YYYY-MM-DD
const formatDateToISO = (date) => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
};

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployeesAndAttendance = async () => {
      setLoading(true);
      setError(null);
      const formattedDate = formatDateToISO(selectedDate);

      try {
        // Fetch all employees
        const employeesResponse = await axios.get(`/api/employees`);
        const allEmployees = employeesResponse.data;

        // Fetch attendance for the selected date
        const attendanceResponse = await axios.get(`/api/attendance/${formattedDate}`);
        const todaysAttendance = attendanceResponse.data;

        // Merge employee list with attendance data
        const mergedData = allEmployees.map((employee) => {
          const attendanceRecord = todaysAttendance.find(
            (record) => record.employee.id === employee.id
          );

          return {
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            position: employee.position,
            status: attendanceRecord ? attendanceRecord.status : "Unmarked",
          };
        });

        setEmployees(mergedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeesAndAttendance();
  }, [selectedDate]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "present":
        return "bg-green-500";
      case "absent":
        return "bg-red-500";
      case "late":
        return "bg-yellow-500";
      case "unmarked":
        return "bg-gray-300";
      default:
        return "bg-gray-500";
    }
  };

  const attendanceSummary = {
    present: employees.filter((e) => e.status.toLowerCase() === "present").length,
    absent: employees.filter((e) => e.status.toLowerCase() === "absent").length,
    late: employees.filter((e) => e.status.toLowerCase() === "late").length,
    unmarked: employees.filter((e) => e.status.toLowerCase() === "unmarked").length,
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Employee Attendance</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Attendance List and Summary */}
        <div className="w-full lg:w-2/3 space-y-6">
          {/* Attendance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">{attendanceSummary.present}</p>
                  <p className="text-sm text-gray-600">Present</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{attendanceSummary.absent}</p>
                  <p className="text-sm text-gray-600">Absent</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{attendanceSummary.late}</p>
                  <p className="text-sm text-gray-600">Late</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-600">{attendanceSummary.unmarked}</p>
                  <p className="text-sm text-gray-600">Unmarked</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance List */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records for {formatDateToISO(selectedDate)}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : employees.length > 0 ? (
                <ul className="space-y-4">
                  {employees.map((employee) => (
                    <li
                      key={employee.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors duration-150 ease-in-out"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={`/placeholder.svg?u=${employee.id}`} alt={`${employee.firstName} ${employee.lastName}`} />
                          <AvatarFallback>
                            {employee.firstName[0]}
                            {employee.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{employee.position}</p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(employee.status)} text-white`}>
                        {employee.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4 text-gray-500">No employee records found.</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <Card className="w-full lg:w-1/3">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomCalendar
              selectedDate={selectedDate}
              onSelectDate={(date) => setSelectedDate(date)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
