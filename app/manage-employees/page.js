'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, Plus, SlidersHorizontal, Download, UserCheck, UserX, FileText, ChevronDown } from 'lucide-react';
import { AddEmployeeModal } from './components/AddEmployeeModal';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminCalendar from './components/AdminCalendar';
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

const ATTENDANCE_STATUSES = {
    PRESENT: { label: 'Present', color: 'bg-green-500 hover:bg-green-600' },
    ABSENT: { label: 'Absent', color: 'bg-red-500 hover:bg-red-600' },
    ON_LEAVE: { label: 'On Leave', color: 'bg-yellow-500 hover:bg-yellow-600' },
    UNMARKED: { label: 'Unmarked', color: 'bg-gray-400 hover:bg-gray-500' }
};

const getStatusColor = (status) => {
    const statusKey = status?.toUpperCase();
    return ATTENDANCE_STATUSES[statusKey]?.color || 'bg-gray-500';
};

const ManageEmployee = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [employees, setEmployees] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [newEmployee, setNewEmployee] = useState({
        employeeCode: '',  // This will be auto-generated
        password: '',
        name: '',
        email: '',
        phone: '',
        gender: '',
        dateOfJoining: '',
        // ... other fields
    });

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`/api/admin/dashboard?date=${formatDateToISO(selectedDate)}`);
            setEmployees(response.data.employees);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [selectedDate]);

    const updateAttendanceStatus = async (employeeId, newStatus) => {
        try {
            // Optimistic update
            setEmployees(prev => prev.map(emp => {
                if (emp.id === employeeId) {
                    return { ...emp, status: newStatus };
                }
                return emp;
            }));

            await axios.post('/api/attendance', {
                employeeId,
                status: newStatus,
                date: formatDateToISO(selectedDate)
            });

            toast.success('Attendance updated');
            fetchDashboardData(); // Refresh data in background
        } catch (error) {
            console.error('Error updating attendance:', error);
            toast.error('Failed to update attendance');
            fetchDashboardData(); // Revert on error
        }
    };

    const markBulkAttendance = async (status) => {
        try {
            const promises = selectedEmployees.map(employeeId =>
                axios.post('/api/attendance', {
                    employeeId,
                    status,
                    date: formatDateToISO(selectedDate)
                })
            );
            await Promise.all(promises);
            toast.success('Bulk attendance marked successfully');
            setSelectedEmployees([]);
            fetchDashboardData();
        } catch (error) {
            console.error('Error marking bulk attendance:', error);
            toast.error('Failed to mark bulk attendance');
        }
    };

    const generatePayslip = async (employee) => {
        try {
            // Get the month name and year for the payslip
            const monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
            const month = monthNames[selectedDate.getMonth()];
            const year = selectedDate.getFullYear();

            const response = await axios.post('/api/payroll/generate-payslip', {
                employeeId: employee.id,
                month: selectedDate.getMonth() + 1,
                year: selectedDate.getFullYear(),
                payslipData: {
                    employeeName: employee.name,
                    employeeId: employee.id,
                    department: employee.department,
                    position: employee.position,
                    month: month,
                    year: year,
                    perDaySalary: employee.perDaySalary,
                    totalDaysPresent: employee.totalDaysPresent,
                    totalDaysAbsent: employee.totalDaysAbsent || 0,
                    totalLeaves: employee.totalLeaves || 0,
                    basicSalary: employee.perDaySalary * employee.totalDaysPresent,
                    deductions: employee.deductions || 0,
                    netPayable: employee.payableAmount
                }
            }, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `payslip_${employee.name.replace(/\s+/g, '_')}_${month}_${year}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Payslip generated successfully');
        } catch (error) {
            console.error('Error generating payslip:', error);
            toast.error('Failed to generate payslip');
        }
    };

    const filteredEmployees = employees.filter(employee => {
        const matchesSearch = 
            employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.department.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;
        return matchesSearch && matchesDepartment;
    });

    const summary = {
        present: employees.filter(e => e.status.toLowerCase() === 'present').length,
        absent: employees.filter(e => e.status.toLowerCase() === 'absent').length,
        onLeave: employees.filter(e => e.status.toLowerCase() === 'on leave').length,
        unmarked: employees.filter(e => e.status.toLowerCase() === 'unmarked').length,
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold text-blue-900 mb-6">Employee Attendance</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{summary.present}</div>
                    <div className="text-sm text-gray-600">Present</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-red-600">{summary.absent}</div>
                    <div className="text-sm text-gray-600">Absent</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600">{summary.onLeave}</div>
                    <div className="text-sm text-gray-600">On Leave</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-gray-600">{summary.unmarked}</div>
                    <div className="text-sm text-gray-600">Unmarked</div>
                </div>
            </div>

            <div className="flex gap-6">
                {/* Main Content */}
                <div className="flex-1">
                    {/* Filters */}
                    <div className="flex gap-4 mb-6">
                        <Select
                            value={selectedDepartment}
                            onValueChange={setSelectedDepartment}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                <SelectItem value="IT">IT</SelectItem>
                                <SelectItem value="HR">HR</SelectItem>
                                <SelectItem value="Finance">Finance</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1"
                        />
                    </div>

                    {/* Employee Table */}
                    <div className="bg-white rounded-lg shadow">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payroll Info</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredEmployees.map((employee) => (
                                    <tr key={employee.id}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                                    <span className="text-sm font-medium">{employee.name.charAt(0)}</span>
                                                </div>
                                                <Link
                                                    href={`/employees/${employee.id}`}
                                                    className="font-medium hover:underline"
                                                >
                                                    {employee.name}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{employee.position}</td>
                                        <td className="px-6 py-4">{employee.department}</td>
                                        <td className="px-6 py-4">
                                            <div className="p-4 w-full sm:w-1/5">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            className={`w-full justify-between ${getStatusColor(employee.status)}`}
                                                            variant="ghost"
                                                        >
                                                            <span className="text-white">
                                                                {ATTENDANCE_STATUSES[employee.status?.toUpperCase()]?.label || 'Unmarked'}
                                                            </span>
                                                            <ChevronDown className="h-4 w-4 text-white opacity-50" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[160px]">
                                                        {Object.entries(ATTENDANCE_STATUSES).map(([status, { label, color }]) => (
                                                            <DropdownMenuItem
                                                                key={status}
                                                                onClick={() => updateAttendanceStatus(employee.id, status)}
                                                                className={`${color} text-white focus:text-white focus:bg-opacity-80`}
                                                            >
                                                                {label}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm text-gray-500">Per day: Rs.{employee.perDaySalary}</div>
                                                <div className="text-sm text-gray-500">Total days: {employee.totalDaysPresent}</div>
                                                <div className="text-sm font-medium">Payable: Rs.{employee.payableAmount}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => generatePayslip(employee)}
                                            >
                                                <FileText className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-80">
                    <div className="bg-white p-4 rounded-lg shadow mb-6">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md border"
                        />
                    </div>
                    <Button 
                        className="w-full mb-6"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Employee
                    </Button>

                    {/* Leave Requests Component */}
                    <LeaveRequests />
                </div>
            </div>

            <AddEmployeeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddEmployee={async (newEmployee) => {
                    try {
                        await axios.post('/api/employees', newEmployee);
                        await fetchDashboardData();
                        setIsModalOpen(false);
                        toast.success('Employee added successfully');
                    } catch (error) {
                        toast.error('Failed to add employee');
                    }
                }}
            />
        </div>
    );
};

export default ManageEmployee;