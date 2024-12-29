"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function EmployeeDashboard() {
    const { id } = useParams(); // Get employee ID from URL
    const [employeeData, setEmployeeData] = useState(null);
    const [attendanceData, setAttendanceData] = useState([]);
    const [paymentData, setPaymentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) {
                setError("Employee ID not found. Please log in.");
                setLoading(false);
                return;
            }

            try {
                // Fetch employee info
                const employeeResponse = await axios.get(`/api/employees/${id}`);
                setEmployeeData(employeeResponse.data);

                // Fetch attendance data
                const attendanceResponse = await axios.get(`/api/attendance?employeeId=${id}`);
                setAttendanceData(attendanceResponse.data);

                // Fetch payment data
                const paymentResponse = await axios.get(`/api/payroll?employeeId=${id}`);
                setPaymentData(paymentResponse.data);

                setLoading(false);
            } catch (err) {
                setError("Failed to fetch data");
                setLoading(false);
                console.error(err);
            }
        };

        fetchData();
    }, [id]);

    if (loading) return <div className="text-center mt-8">Loading...</div>;
    if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Employee Dashboard</h1>

            {/* Employee Information */}
            {employeeData && (
                <div className="mb-4">
                    <h2 className="text-xl">Employee Information</h2>
                    <p><strong>Name:</strong> {employeeData.firstName} {employeeData.lastName}</p>
                    <p><strong>Email:</strong> {employeeData.email}</p>
                    <p><strong>Position:</strong> {employeeData.position}</p>
                    <p><strong>Department:</strong> {employeeData.department}</p>
                </div>
            )}

            {/* Attendance Summary */}
            <div className="mb-4">
                <h2 className="text-xl">Attendance Summary</h2>
                <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 p-2">Date</th>
                            <th className="border border-gray-300 p-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendanceData.map((day) => (
                            <tr key={day.date}>
                                <td className="border border-gray-300 p-2">{new Date(day.date).toLocaleDateString()}</td>
                                <td className="border border-gray-300 p-2">{day.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Payment Information */}
            <div className="mb-4">
                <h2 className="text-xl">Payment Information</h2>
                <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 p-2">Month</th>
                            <th className="border border-gray-300 p-2">Total Payable Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paymentData.map((item) => (
                            <tr key={item.month}>
                                <td className="border border-gray-300 p-2">{item.month}</td>
                                <td className="border border-gray-300 p-2">{item.amount.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 