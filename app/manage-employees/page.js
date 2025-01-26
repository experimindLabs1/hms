'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
} from "@/components/ui/select";
import { Search, Plus, SlidersHorizontal, Download, UserCheck, UserX, FileText, ChevronDown, ClipboardList } from 'lucide-react';
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
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "lucide-react";

const formatDateToISO = (date) => {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0];
};

const ATTENDANCE_STATUSES = {
    PRESENT: { 
        label: 'Present', 
        color: 'from-emerald-400 to-green-500', 
        hoverColor: 'hover:from-emerald-500 hover:to-green-600',
        bgLight: 'from-emerald-50/50 to-green-50/30'
    },
    ABSENT: { 
        label: 'Absent', 
        color: 'from-rose-400 to-red-500', 
        hoverColor: 'hover:from-rose-500 hover:to-red-600',
        bgLight: 'from-rose-50/50 to-red-50/30'
    },
    ON_LEAVE: { 
        label: 'On Leave', 
        color: 'from-amber-400 to-yellow-500', 
        hoverColor: 'hover:from-amber-500 hover:to-yellow-600',
        bgLight: 'from-amber-50/50 to-yellow-50/30'
    },
    UNMARKED: { 
        label: 'Unmarked', 
        color: 'from-slate-400 to-gray-500', 
        hoverColor: 'hover:from-slate-500 hover:to-gray-600',
        bgLight: 'from-slate-50/50 to-gray-50/30'
    }
};

const getStatusColor = (status) => {
    const statusKey = status?.toUpperCase();
    return ATTENDANCE_STATUSES[statusKey]?.color || 'from-gray-500/90 to-gray-600/80';
};

const getStatusHoverColor = (status) => {
    const statusKey = status?.toUpperCase();
    return ATTENDANCE_STATUSES[statusKey]?.hoverColor || 'hover:from-gray-500 hover:to-gray-600';
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

    // Memoize the filtered employees to prevent unnecessary recalculations
    const filteredEmployees = useMemo(() => {
        return employees.filter(employee => {
            const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                employee.position?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDepartment = selectedDepartment === 'all' || 
                                    employee.department === selectedDepartment;
            return matchesSearch && matchesDepartment;
        });
    }, [employees, searchTerm, selectedDepartment]);

    // Memoize the summary calculations
    const summary = useMemo(() => {
        return {
            present: employees.filter(emp => emp.status === 'PRESENT').length,
            absent: employees.filter(emp => emp.status === 'ABSENT').length,
            onLeave: employees.filter(emp => emp.status === 'ON_LEAVE').length,
            unmarked: employees.filter(emp => emp.status === 'UNMARKED').length,
        };
    }, [employees]);

    // Memoize handlers to prevent unnecessary re-renders
    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    const handleDepartmentChange = useCallback((value) => {
        setSelectedDepartment(value);
    }, []);

    const updateAttendanceStatus = useCallback(async (employeeId, newStatus) => {
        try {
            // Optimistic update for status
            setEmployees(prev => prev.map(emp => {
                if (emp.id === employeeId) {
                    return { ...emp, status: newStatus };
                }
                return emp;
            }));

            // Make API call and get updated data
            const response = await axios.post('/api/attendance', {
                employeeId,
                status: newStatus,
                date: formatDateToISO(selectedDate)
            });

            // Update employee with new payroll info
            if (response.data.success) {
                setEmployees(prev => prev.map(emp => {
                    if (emp.id === employeeId) {
                        return {
                            ...emp,
                            totalDaysPresent: response.data.presentDays,
                            payableAmount: emp.perDaySalary * response.data.presentDays
                        };
                    }
                    return emp;
                }));
            }

            toast.success('Attendance updated');
        } catch (error) {
            console.error('Error updating attendance:', error);
            toast.error('Failed to update attendance');
            // Revert on error
            fetchDashboardData();
        }
    }, [selectedDate]);

    const handleDateSelect = useCallback((date) => {
        setSelectedDate(date);
    }, []);

    // Memoize modal handlers
    const handleModalOpen = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    const handleModalClose = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    // Fetch data only when date changes
    useEffect(() => {
        fetchDashboardData();
    }, [selectedDate]);

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

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;

    return (
        <div className="container mx-auto px-3 py-4 sm:p-6 bg-gradient-to-br from-background to-muted/30 min-h-screen">
            {/* Header with Date Selection */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground/90 to-foreground/60 
                    bg-clip-text text-transparent">
                    Employee Attendance
                </h1>
                
                {/* Mobile Calendar Dialog */}
                <div className="lg:hidden">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm">{format(selectedDate, 'MMM dd')}</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="p-0 bg-background/95 backdrop-blur-md">
                            <div className="p-3">
                                <AdminCalendar
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                        handleDateSelect(date);
                                        // Close dialog after selection
                                    }}
                                    className="text-sm"
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
                {/* Present Card */}
                <div className="bg-gradient-to-br from-emerald-50/50 to-green-50/30 dark:from-emerald-950/50 dark:to-green-900/30 
                    backdrop-blur-md p-3 sm:p-4 md:p-6 rounded-xl md:rounded-2xl
                    shadow-sm hover:shadow-md transition-all duration-300
                    border border-emerald-100/20">
                    <div className="text-xl sm:text-2xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                        {summary.present}
                    </div>
                    <div className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 mt-0.5 sm:mt-1">Present</div>
                </div>

                {/* Absent Card */}
                <div className="bg-gradient-to-br from-rose-50/50 to-red-50/30 dark:from-rose-950/50 dark:to-red-900/30 
                    backdrop-blur-md p-3 sm:p-4 md:p-6 rounded-xl md:rounded-2xl
                    shadow-sm hover:shadow-md transition-all duration-300
                    border border-rose-100/20">
                    <div className="text-xl sm:text-2xl md:text-4xl font-bold text-rose-600 dark:text-rose-400">
                        {summary.absent}
                    </div>
                    <div className="text-xs sm:text-sm text-rose-700 dark:text-rose-300 mt-0.5 sm:mt-1">Absent</div>
                </div>

                {/* On Leave Card */}
                <div className="bg-gradient-to-br from-amber-50/50 to-yellow-50/30 dark:from-amber-950/50 dark:to-yellow-900/30 
                    backdrop-blur-md p-3 sm:p-4 md:p-6 rounded-xl md:rounded-2xl
                    shadow-sm hover:shadow-md transition-all duration-300
                    border border-amber-100/20">
                    <div className="text-xl sm:text-2xl md:text-4xl font-bold text-amber-600 dark:text-amber-400">
                        {summary.onLeave}
                    </div>
                    <div className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 mt-0.5 sm:mt-1">On Leave</div>
                </div>

                {/* Unmarked Card */}
                <div className="bg-gradient-to-br from-slate-50/50 to-gray-50/30 dark:from-slate-950/50 dark:to-gray-900/30 
                    backdrop-blur-md p-3 sm:p-4 md:p-6 rounded-xl md:rounded-2xl
                    shadow-sm hover:shadow-md transition-all duration-300
                    border border-slate-100/20">
                    <div className="text-xl sm:text-2xl md:text-4xl font-bold text-slate-600 dark:text-slate-400">
                        {summary.unmarked}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-0.5 sm:mt-1">Unmarked</div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                {/* Employee List Section */}
                <div className="w-full lg:flex-1">
                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
                        <div className="flex gap-2 sm:gap-4 w-full sm:w-auto order-2 sm:order-1">
                            <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
                                <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-0 shadow-sm h-9 text-sm">
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
                                onChange={handleSearchChange}
                                className="flex-1 bg-background/50 border-0 shadow-sm h-9 text-sm"
                            />
                        </div>
                        
                        <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
                            <Button 
                                className="h-9 bg-gradient-to-r from-primary/80 to-primary/60
                                    hover:from-primary hover:to-primary/80
                                    transition-all duration-300
                                    rounded-xl border-0 text-sm"
                                onClick={handleModalOpen}
                            >
                                <Plus className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Add Employee</span>
                                <span className="sr-only sm:hidden">Add</span>
                            </Button>

                            {/* Mobile Leave History Sheet */}
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9">
                                        <ClipboardList className="h-4 w-4" />
                                        <span className="sr-only">Leave Requests</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-full sm:w-[400px] p-0">
                                    <div className="p-6">
                                        <LeaveRequests />
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>

                    {/* Mobile Employee List */}
                    <div className="lg:hidden space-y-3">
                        {filteredEmployees.map((employee) => (
                            <div key={employee.id} 
                                className="bg-white/5 rounded-xl p-4 space-y-3 backdrop-blur-xl 
                                border border-white/10">
                                {/* Employee Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 
                                            flex items-center justify-center">
                                            <span className="text-sm font-medium text-primary">
                                                {employee.name.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <Link href={`/employees/${employee.id}`}
                                                className="font-medium text-sm text-foreground/90 hover:text-primary">
                                                {employee.name}
                                            </Link>
                                            <div className="text-xs text-foreground/60 mt-0.5">
                                                {employee.position} • {employee.department}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => generatePayslip(employee)}
                                        className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                                    >
                                        <FileText className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Status and Payroll */}
                                <div className="flex items-center justify-between gap-3">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                className={`
                                                    h-8 px-3 text-xs justify-between bg-gradient-to-r ${getStatusColor(employee.status)}
                                                    transition-all duration-300 shadow-sm
                                                    rounded-lg border-0 text-white
                                                `}
                                            >
                                                <span className="font-medium">
                                                    {ATTENDANCE_STATUSES[employee.status?.toUpperCase()]?.label || 'Unmarked'}
                                                </span>
                                                <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent 
                                            align="end"
                                            className="w-32 p-1 bg-white/10 backdrop-blur-xl border-0 shadow-xl rounded-lg">
                                            {Object.entries(ATTENDANCE_STATUSES).map(([status, { label, color, hoverColor }]) => (
                                                <DropdownMenuItem
                                                    key={status}
                                                    onClick={() => updateAttendanceStatus(employee.id, status)}
                                                    className={`
                                                        bg-gradient-to-r ${color}
                                                        text-white rounded-lg mb-1.5 last:mb-0
                                                        transition-all duration-300
                                                        hover:scale-[1.02] hover:shadow-md
                                                        ${hoverColor}
                                                        data-[highlighted]:scale-[1.02]
                                                        data-[highlighted]:shadow-md
                                                        data-[highlighted]:${hoverColor}
                                                    `}
                                                >
                                                    {label}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <div className="text-right">
                                        <div className="text-xs text-foreground/60">
                                            ₹{employee.perDaySalary}/day • {employee.totalDaysPresent} days
                                        </div>
                                        <div className="text-sm font-medium text-foreground/90">
                                            ₹{employee.payableAmount}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden lg:block">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="w-[25%] px-6 py-4 text-left text-sm font-medium text-foreground/70">Name</th>
                                    <th className="w-[15%] px-6 py-4 text-left text-sm font-medium text-foreground/70">Position</th>
                                    <th className="w-[15%] px-6 py-4 text-left text-sm font-medium text-foreground/70">Department</th>
                                    <th className="w-[20%] px-6 py-4 text-left text-sm font-medium text-foreground/70">Status</th>
                                    <th className="w-[20%] px-6 py-4 text-left text-sm font-medium text-foreground/70">Payroll Info</th>
                                    <th className="w-[5%] px-6 py-4 text-left text-sm font-medium text-foreground/70">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {filteredEmployees.map((employee) => (
                                    <tr key={employee.id} className="group hover:bg-muted/30 transition-colors">
                                        <td className="w-[25%] px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mr-3">
                                                    <span className="text-sm font-medium text-primary">
                                                        {employee.name.charAt(0)}
                                                    </span>
                                                </div>
                                                <Link
                                                    href={`/employees/${employee.id}`}
                                                    className="font-medium text-foreground/90 hover:text-primary transition-colors"
                                                >
                                                    {employee.name}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="w-[15%] px-6 py-4 text-foreground/70">{employee.position}</td>
                                        <td className="w-[15%] px-6 py-4 text-foreground/70">{employee.department}</td>
                                        <td className="w-[20%] px-6 py-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        className={`
                                                            w-32 justify-between bg-gradient-to-r ${getStatusColor(employee.status)}
                                                            transition-all duration-300 shadow-sm hover:shadow-md
                                                            rounded-xl hover:scale-[1.02]
                                                            border-0 text-white
                                                        `}
                                                    >
                                                        <span className="font-medium">
                                                            {ATTENDANCE_STATUSES[employee.status?.toUpperCase()]?.label || 'Unmarked'}
                                                        </span>
                                                        <ChevronDown className="h-4 w-4 opacity-70" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent 
                                                    align="end"
                                                    sideOffset={5}
                                                    className="w-32 p-1.5 bg-white/10 backdrop-blur-xl border-0 shadow-xl
                                                        animate-in fade-in-0 zoom-in-95
                                                        data-[side=bottom]:slide-in-from-top-2
                                                        rounded-xl"
                                                >
                                                    {Object.entries(ATTENDANCE_STATUSES).map(([status, { label, color, hoverColor }]) => (
                                                        <DropdownMenuItem
                                                            key={status}
                                                            onClick={() => updateAttendanceStatus(employee.id, status)}
                                                            className={`
                                                                bg-gradient-to-r ${color}
                                                                text-white rounded-lg mb-1.5 last:mb-0
                                                                transition-all duration-300
                                                                hover:scale-[1.02] hover:shadow-md
                                                                ${hoverColor}
                                                                data-[highlighted]:scale-[1.02]
                                                                data-[highlighted]:shadow-md
                                                                data-[highlighted]:${hoverColor}
                                                            `}
                                                        >
                                                            {label}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                        <td className="w-[20%] px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="text-sm text-foreground/60">Per day: ₹{employee.perDaySalary}</div>
                                                <div className="text-sm text-foreground/60">Days: {employee.totalDaysPresent}</div>
                                                <div className="text-sm font-medium text-foreground/90">
                                                    Payable: ₹{employee.payableAmount}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="w-[5%] px-6 py-4">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => generatePayslip(employee)}
                                                className="hover:bg-primary/10 hover:text-primary"
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

                {/* Desktop Sidebar - Hidden on Mobile */}
                <div className="hidden lg:block w-80">
                    <div className="sticky top-4">
                        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-xl 
                            shadow-sm border border-white/20 dark:border-white/10 p-2 mb-4">
                            <AdminCalendar
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                className="text-sm"
                            />
                        </div>
                        <LeaveRequests />
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AddEmployeeModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
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