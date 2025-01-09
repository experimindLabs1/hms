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
            // Fetch all employees
            const employeesResponse = await axios.get(`/api/employees`);
            const allEmployees = employeesResponse.data;

            // Fetch attendance for the selected date - add error handling
            const attendanceResponse = await axios.get(`/api/attendance/${formattedDate}`);
            let todaysAttendance = attendanceResponse.data;

            // Add console log to debug attendance data
            console.log('Fetched attendance for date:', formattedDate, todaysAttendance);

            // Ensure todaysAttendance is an array
            if (!Array.isArray(todaysAttendance)) {
                console.error('Attendance data is not an array:', todaysAttendance);
                todaysAttendance = [];
            }

            // Fetch payroll data for each employee
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

            // Merge employee data with payroll and attendance data
            const mergedData = allEmployees.map((employee, index) => {
                // Find attendance record for this employee
                const attendanceRecord = todaysAttendance.find(
                    (record) => record.employeeId === employee.id
                );
                
                console.log(
                    `Employee ${employee.id} attendance:`, 
                    attendanceRecord
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

            // Add a small delay before refreshing to ensure the database has updated
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
            setSelectedEmployees([]); // Clear selection after bulk update
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
                responseType: 'blob' // Important for handling PDF
            });

            // Create a blob from the PDF Stream
            const file = new Blob([response.data], { type: 'application/pdf' });
            
            // Create a link element to trigger download
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
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Employee Attendance</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Attendance List and Summary */}
                <div className="w-full  lg:w-2/3 space-y-6">
                    {/* Attendance Summary */}
                    <Card className='rounded-3xl'>
                        <CardHeader></CardHeader>
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
                                    <p className="text-2xl font-bold text-yellow-600">{attendanceSummary.onLeave}</p>
                                    <p className="text-sm text-gray-600">On Leave</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-600">{attendanceSummary.unmarked}</p>
                                    <p className="text-sm text-gray-600">Unmarked</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Attendance List */}
                    <div className="flex-1 bg-[#F6F6F4] rounded-3xl pt-5 shadow-xl">
                        <div className="flex items-center gap-4 bg-[#f7f6f2b4] rounded-lg p-2">
                            <div className="flex-1 flex items-center gap-2">
                                <Select>
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Columns" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Columns</SelectItem>
                                        <SelectItem value="basic">Basic Info</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select>
                                    <SelectTrigger className="w-[120px]">
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
                                <div className="flex-1 relative rounded-full">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search" className="pl-8" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button className="rounded-full" variant="secondary" size="icon">
                                    <SlidersHorizontal className="h-4 w-4" />
                                </Button>
                                <Button className="rounded-full" variant="secondary" size="icon">
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>   

                        {error && <div className="text-red-500 mb-4">{error}</div>}
                        <div className="bg-white rounded-3xl p-4 mt-5">
                            {/* Table Header */}
                            <div className="flex items-center">
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
                                        <div
                                            key={employee.id}
                                            className="flex items-center hover:bg-[#f3f3f3] rounded-3xl transition-colors duration-400 ease-in-out"
                                        >
                                           
                                            <div className="p-4 w-1/5 flex items-center gap-3">
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
                                            <div className="p-4 w-1/5">{employee.position}</div>
                                            <div className="p-4 w-1/5">{employee.department}</div>
                                            <div className="p-4 w-1/5">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            className={`rounded-full hover:bg-opacity-80 text-white w-28 ${getStatusColor(employee.status)}`}
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
                                            <div className="p-4 w-1/5">
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
                                                        {/* <div className="flex items-center justify-between mt-2">
                                                            <span className="text-sm">Allow Payslip Access:</span>
                                                            <Checkbox 
                                                                checked={employee.canAccessPayslip}
                                                                onCheckedChange={async (checked) => {
                                                                    try {
                                                                        console.log('Before Update - Employee:', employee);
                                                                        console.log('Before Update - canAccessPayslip:', employee.canAccessPayslip);
                                                                        console.log('Attempting to set access to:', checked);

                                                                        const response = await axios.patch(`/api/employees/${employee.id}/payslip-access`, {
                                                                            canAccess: checked
                                                                        });

                                                                        console.log('API Response:', response.data);

                                                                        // Update local state
                                                                        const updatedEmployees = employees.map(emp => 
                                                                            emp.id === employee.id 
                                                                                ? {...emp, canAccessPayslip: checked}
                                                                                : emp
                                                                        );

                                                                        console.log('Updated Employee:', updatedEmployees.find(e => e.id === employee.id));
                                                                        setEmployees(updatedEmployees);
                                                                        
                                                                        toast.success('Payslip access updated');
                                                                    } catch (error) {
                                                                        console.error('Error updating payslip access:', error);
                                                                        console.error('Error details:', error.response?.data);
                                                                        toast.error('Failed to update payslip access');
                                                                    }
                                                                }}
                                                            />
                                                        </div> */}
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-gray-500">No employees found.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calendar and Actions */}
                <Card className="w-full lg:w-1/3 rounded-3xl shadow-xl">
                    <CardHeader>
                        <CardTitle className='font-thin'>
                            {formatDateToISO(selectedDate)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="w-full">
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle></CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CustomCalendar
                                    selectedDates={selectedDates}
                                    onSelectDate={handleDateSelect}
                                />
                            </CardContent>
                        </Card>
                        {selectedEmployees.length > 0 && (
                            <>
                                <Button
                                    className="w-full mt-4"
                                    onClick={() => markBulkAttendance('present')}
                                >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Mark Present
                                </Button>
                                <Button
                                    className="w-full mt-2"
                                    onClick={() => markBulkAttendance('absent')}
                                >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Mark Absent
                                </Button>
                                <Button
                                    className="w-full mt-2"
                                    onClick={() => markBulkAttendance('On Leave')}
                                >
                                    <UserX className="h-4 w-4 mr-2" />
                                    On Leave
                                </Button>
                            </>
                        )}
                        <Button className="w-full mt-4" onClick={() => setIsModalOpen(true)}>
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

