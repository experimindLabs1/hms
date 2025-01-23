'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, Plus, SlidersHorizontal, Download, UserCheck, UserX, FileText } from 'lucide-react';
import { AddEmployeeModal } from './components/AddEmployeeModal';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CustomCalendar from '../calendar/components/CustomCalendar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import LeaveRequests from './leave-requests';
import { toast } from 'react-hot-toast';
import AdminCalendar from './components/AdminCalendar';

const formatDateToISO = (date) => {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0];
};

const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
        case "present":
            return "bg-green-500";
        case "absent":
            return "bg-red-500";
        case "on leave":
            return "bg-yellow-500";
        case "unmarked":
            return "bg-gray-400";
        default:
            return "bg-gray-500";
    }
};

const ManageEmployee = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [employees, setEmployees] = useState([]);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [selectedDates, setSelectedDates] = useState([selectedDate]);

    const fetchEmployeesAndPayroll = async () => {
        setError(null);
        const formattedDate = formatDateToISO(selectedDate);

        try {
            const employeesResponse = await axios.get(`/api/employees`);
            const allEmployees = employeesResponse.data;

            const attendanceResponse = await axios.get(`/api/attendance/${formattedDate}`);
            let todaysAttendance = attendanceResponse.data;

            if (!Array.isArray(todaysAttendance)) {
                console.error('Attendance data is not an array:', todaysAttendance);
                todaysAttendance = [];
            }

            const payrollData = await Promise.all(
                allEmployees.map(async (employee) => {
                    const payrollResponse = await axios.get(
                        `/api/payroll?employeeId=${employee.id}&month=${
                            selectedDate.getMonth() + 1
                        }&year=${selectedDate.getFullYear()}`
                    );
                    return payrollResponse.data;
                })
            );

            const mergedData = allEmployees.map((employee, index) => {
                const attendanceRecord = todaysAttendance.find(
                    (record) => record.employeeId === employee.id
                );

                const payroll = payrollData[index];

                return {
                    ...employee,
                    status: attendanceRecord ? attendanceRecord.status : "Unmarked",
                    perDaySalary: payroll.perDaySalary.toFixed(2),
                    payableAmount: payroll.payableAmount.toFixed(2),
                    totalDaysPresent: payroll.uniquePresentDays,
                };
            });

            setEmployees(mergedData);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to load data. Please try again.");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchEmployeesAndPayroll();
        };

        fetchData();
    }, [selectedDate]);

    const handleAddEmployee = async (newEmployee) => {
        try {
            await axios.post('/api/employees', newEmployee);
            await fetchEmployeesAndPayroll();
        } catch (error) {
            console.error('Error adding employee:', error);
            setError('Failed to add employee');
        }
    };

    const updateAttendanceStatus = async (employeeId, newStatus) => {
        try {
            const date = formatDateToISO(selectedDate);
            await axios.post('/api/attendance', {
                employeeId,
                status: newStatus,
                date,
            });

            setTimeout(() => {
                fetchEmployeesAndPayroll();
            }, 100);

        } catch (error) {
            console.error('Error updating attendance status:', error);
            setError('Failed to update attendance status');
        }
    };

    const markBulkAttendance = async (status) => {
        try {
            const date = formatDateToISO(selectedDate);
            const promises = selectedEmployees.map((employeeId) =>
                axios.post('/api/attendance', { employeeId, status, date })
            );
            await Promise.all(promises);

            await fetchEmployeesAndPayroll();
            setSelectedEmployees([]);
        } catch (error) {
            console.error('Error marking bulk attendance:', error);
            setError('Failed to mark bulk attendance');
        }
    };

    const attendanceSummary = {
        present: employees.filter((e) => e.status.toLowerCase() === "present").length,
        absent: employees.filter((e) => e.status.toLowerCase() === "absent").length,
        onLeave: employees.filter((e) => e.status.toLowerCase() === "on leave").length,
        unmarked: employees.filter((e) => e.status.toLowerCase() === "unmarked").length,
    };

    const generatePayslip = async (employee) => {
        try {
            const response = await axios.post(`/api/payroll/generate-payslip`, {
                employeeId: employee.id,
                month: selectedDate.getMonth() + 1,
                year: selectedDate.getFullYear()
            }, {
                responseType: 'blob'
            });

            const file = new Blob([response.data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const link = document.createElement('a');
            link.href = fileURL;
            link.download = `payslip-${employee.firstName}-${employee.lastName}-${selectedDate.getMonth() + 1}-${selectedDate.getFullYear()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(fileURL);
        } catch (error) {
            console.error('Error generating payslip:', error);
            toast.error('Failed to generate payslip');
        }
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setSelectedDates([date]);
    };

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-blue-900">Employee Attendance</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                {/* Attendance List and Summary */}
                <div className="w-full lg:w-2/3 space-y-4 sm:space-y-6">
                    {/* Attendance Summary */}
                    <Card className='rounded-xl shadow-sm border border-gray-100'>
                        <CardHeader></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-center">
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <p className="text-xl sm:text-2xl font-bold text-green-600">{attendanceSummary.present}</p>
                                    <p className="text-sm text-gray-600">Present</p>
                                </div>
                                <div className="p-4 bg-red-50 rounded-lg">
                                    <p className="text-xl sm:text-2xl font-bold text-red-600">{attendanceSummary.absent}</p>
                                    <p className="text-sm text-gray-600">Absent</p>
                                </div>
                                <div className="p-4 bg-yellow-50 rounded-lg">
                                    <p className="text-xl sm:text-2xl font-bold text-yellow-600">{attendanceSummary.onLeave}</p>
                                    <p className="text-sm text-gray-600">On Leave</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-xl sm:text-2xl font-bold text-gray-600">{attendanceSummary.unmarked}</p>
                                    <p className="text-sm text-gray-600">Unmarked</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Attendance List */}
                    <Card className="rounded-xl shadow-sm border border-gray-100">
                        <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 bg-gray-50 rounded-lg p-2">
                                <div className="flex-1 flex flex-col sm:flex-row items-center gap-2 w-full">
                                    <Select>
                                        <SelectTrigger className="w-full sm:w-[120px] bg-white">
                                            <SelectValue placeholder="Columns" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Columns</SelectItem>
                                            <SelectItem value="basic">Basic Info</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select>
                                        <SelectTrigger className="w-full sm:w-[120px] bg-white">
                                            <SelectValue placeholder="Department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Departments</SelectItem>
                                            <SelectItem value="product">Product</SelectItem>
                                            <SelectItem value="engineering">Engineering</SelectItem>
                                            <SelectItem value="hr">HR</SelectItem>
                                            <SelectItem value="marketing">Marketing</SelectItem>
                                            <SelectItem value="finance">Finance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <div className="flex-1 relative rounded-full w-full">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Search" className="pl-8 w-full bg-white" />
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button className="rounded-full w-full sm:w-auto bg-white hover:bg-gray-100" variant="secondary" size="icon">
                                        <SlidersHorizontal className="h-4 w-4" />
                                    </Button>
                                    <Button className="rounded-full w-full sm:w-auto bg-white hover:bg-gray-100" variant="secondary" size="icon">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>   

                            {error && <div className="text-red-500 mb-4">{error}</div>}
                            <div className="mt-5">
                                {/* Table Header */}
                                <div className="hidden sm:flex items-center bg-gray-50 rounded-lg p-4">
                                    <div className="p-4 w-1/12 text-left"></div>
                                    <div className="p-4 font-medium w-1/5 text-left">Name</div>
                                    <div className="p-4 font-medium w-1/5 text-left">Position</div>
                                    <div className="p-4 font-medium w-1/5 text-left">Department</div>
                                    <div className="p-4 font-medium w-1/5 text-left">Status</div>
                                    <div className="p-4 font-medium w-1/5 text-left">Payroll Info</div>
                                </div>

                                {/* Table Body */}
                                <div
                                    className="space-y-2 overflow-y-auto"
                                    style={{ maxHeight: '300px' }}
                                >
                                    {employees.length > 0 ? (
                                        employees.map((employee) => (
                                            <Card
                                                key={employee.id}
                                                className="hover:shadow-md transition-shadow duration-300"
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                                        <div className="p-4 w-full sm:w-1/5 flex items-center gap-3">
                                                            <Avatar>
                                                                <AvatarImage
                                                                    src="/placeholder.svg?height=40&width=40"
                                                                    alt={`${employee.firstName} ${employee.lastName}`}
                                                                />
                                                                <AvatarFallback>
                                                                    {employee.firstName[0]}{employee.lastName[0]}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div>
                                                                    <Link
                                                                        href={`/employees/${employee.id}`}
                                                                        className="font-medium hover:underline"
                                                                    >
                                                                        {employee.firstName} {employee.lastName}
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="p-4 w-full sm:w-1/5">{employee.position}</div>
                                                        <div className="p-4 w-full sm:w-1/5">{employee.department}</div>
                                                        <div className="p-4 w-full sm:w-1/5">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        className={`rounded-full hover:bg-opacity-80 text-white w-full sm:w-28 ${getStatusColor(employee.status)}`}
                                                                    >
                                                                        {employee.status}
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent 
                                                                    align="center" 
                                                                    className="w-28 p-0 bg-transparent border-none shadow-none"
                                                                    sideOffset={5}
                                                                >
                                                                    <div className={`rounded-2xl overflow-hidden shadow-lg ${getStatusColor(employee.status)}`}>
                                                                        <DropdownMenuItem
                                                                            onClick={() => updateAttendanceStatus(employee.id, 'present')}
                                                                            className="justify-center text-white hover:bg-green-600 focus:bg-green-600 focus:text-white"
                                                                        >
                                                                            Present
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() => updateAttendanceStatus(employee.id, 'absent')}
                                                                            className="justify-center text-white hover:bg-red-600 focus:bg-red-600 focus:text-white"
                                                                        >
                                                                            Absent
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() => updateAttendanceStatus(employee.id, 'On Leave')}
                                                                            className="justify-center text-white hover:bg-yellow-600 focus:bg-yellow-600 focus:text-white"
                                                                        >
                                                                            On Leave
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() => updateAttendanceStatus(employee.id, 'unmarked')}
                                                                            className="justify-center text-white hover:bg-gray-600 focus:bg-gray-600 focus:text-white"
                                                                        >
                                                                            Unmarked
                                                                        </DropdownMenuItem>
                                                                    </div>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                        <div className="p-4 w-full sm:w-1/5">
                                                            <Card className="bg-gray-50">
                                                                <CardContent className="p-3">
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <span className="text-sm text-gray-600">Per day:</span>
                                                                        <span className="font-medium">Rs.{employee.perDaySalary}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <span className="text-sm text-gray-600">Total days:</span>
                                                                        <span className="font-medium">{employee.totalDaysPresent}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <span className="text-sm text-gray-600">Payable:</span>
                                                                        <span className="font-medium text-green-600">Rs.{employee.payableAmount}</span>
                                                                    </div>
                                                                    <Button 
                                                                        variant="outline" 
                                                                        size="sm" 
                                                                        className="w-full mt-2"
                                                                        onClick={() => generatePayslip(employee)}
                                                                    >
                                                                        <FileText className="h-4 w-4 mr-2" />
                                                                        Generate Payslip
                                                                    </Button>
                                                                </CardContent>
                                                            </Card>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-gray-500">No employees found.</div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Calendar and Actions */}
                <Card className="w-full lg:w-1/3 rounded-xl shadow-sm border border-gray-100">
                    <CardHeader>
                        <CardTitle className='font-thin text-blue-900'>
                            {formatDateToISO(selectedDate)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="w-full">
                        <AdminCalendar 
                            selected={selectedDate}
                            onSelect={(date) => {
                                if (date) {
                                    setSelectedDate(date);
                                    setSelectedDates([date]);
                                }
                            }}
                        />
                        {selectedEmployees.length > 0 && (
                            <>
                                <Button
                                    className="w-full mt-4 bg-green-600 hover:bg-green-700"
                                    onClick={() => markBulkAttendance('present')}
                                >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Mark Present
                                </Button>
                                <Button
                                    className="w-full mt-2 bg-red-600 hover:bg-red-700"
                                    onClick={() => markBulkAttendance('absent')}
                                >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Mark Absent
                                </Button>
                                <Button
                                    className="w-full mt-2 bg-yellow-600 hover:bg-yellow-700"
                                    onClick={() => markBulkAttendance('On Leave')}
                                >
                                    <UserX className="h-4 w-4 mr-2" />
                                    On Leave
                                </Button>
                            </>
                        )}
                        <Button 
                            className="w-full mt-4 bg-blue-600 hover:bg-blue-700" 
                            onClick={() => setIsModalOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Employee
                        </Button>
                    </CardContent>
                </Card>
            </div>
            <AddEmployeeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddEmployee={handleAddEmployee}
            />
            <LeaveRequests />
        </div>
    );
};

export default ManageEmployee;