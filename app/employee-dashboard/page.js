'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, DollarSign, UserCircle, FileText, Settings } from 'lucide-react'
import LeaveRequest from './leave-request'

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState(null)
  const [attendanceData, setAttendanceData] = useState({
    attendancePercentage: 0,
    presentDays: 0,
    absentDays: 0,
    leaveDays: 0,
    workingDays: 0
  })
  const [payrollData, setPayrollData] = useState({
    amount: 0,
    perDaySalary: 0,
    payableAmount: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()
  const [payslips, setPayslips] = useState([])

  useEffect(() => {
    async function fetchEmployeeData() {
      try {
        // Fetch profile
        const response = await fetch('/api/employee/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch employee data');
        }
        const data = await response.json();
        setEmployee(data);

        // Fetch attendance data - Fixed the fetch call
        const currentDate = new Date();
        const attendanceResponse = await fetch(`/api/employee/attendance?month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`);
        if (attendanceResponse.ok) {
          const attendanceData = await attendanceResponse.json();
          setAttendanceData(attendanceData);
        }

        // Fetch payroll data - Fixed the fetch call
        const payrollResponse = await fetch(`/api/employee/payroll?month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`);
        if (payrollResponse.ok) {
          const payrollData = await payrollResponse.json();
          setPayrollData(payrollData);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchEmployeeData();
  }, []);

  useEffect(() => {
    const fetchPayslips = async () => {
        try {
            const currentDate = new Date();
            const payslipsData = [];
            
            // Get last 6 months of payslips
            for(let i = 0; i < 6; i++) {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                const month = date.getMonth() + 1;
                const year = date.getFullYear();
                
                const response = await axios.get(`/api/employee/payslips`, {
                    params: { month, year }
                });
                
                // Check if response.data is an array and has items
                if (response.data && response.data.length > 0) {
                    response.data.forEach(payslip => {
                        payslipsData.push({
                            id: payslip.id,
                            month: new Date(payslip.payDate).toLocaleString('default', { month: 'long' }),
                            amount: `Rs. ${payslip.netPayable.toFixed(2)}`,
                            date: payslip.payDate,
                            year: payslip.year,
                            monthNum: payslip.month
                        });
                    });
                }
            }
            setPayslips(payslipsData);
        } catch (error) {
            console.error('Error fetching payslips:', error);
            setError('Failed to fetch payslips');
        }
    };

    fetchPayslips();
  }, []);

  const generatePayslip = async (payslip) => {
    try {
        console.log('Opening payslip for:', payslip);
        const response = await axios.post('/api/employee/generate-payslip', {
            month: new Date(payslip.date).getMonth() + 1,
            year: new Date(payslip.date).getFullYear()
        }, {
            responseType: 'blob',
        });

        // Create a blob from the PDF Stream
        const file = new Blob([response.data], { type: 'application/pdf' });
        
        // Create object URL and open in new tab
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, '_blank');
        
        // Clean up the object URL after the window opens
        setTimeout(() => {
            URL.revokeObjectURL(fileURL);
        }, 100);
    } catch (error) {
        console.error('Error generating payslip:', error);
        setError('Failed to generate payslip');
    }
  };

  // Split name into first and last name for display
  const getNameParts = (fullName) => {
    const parts = fullName ? fullName.split(' ') : ['', ''];
    return {
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || ''
    };
  };

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>
  }

  if (!employee) return <div className="text-center p-4 bg-yellow-100 rounded-lg m-4">Employee not found</div>

  const { firstName, lastName } = getNameParts(employee.name);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {firstName}!</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Here&apos;s what&apos;s happening with your account today.</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/settings')}>
            <Settings className="mr-2 h-4 w-4" /> Settings
          </Button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 lg:w-1/2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="payroll">Payroll</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Personal Information</CardTitle>
                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={employee.avatarUrl || "/placeholder.svg"} />
                        <AvatarFallback>{firstName[0]}{lastName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{firstName} {lastName}</h3>
                        <p className="text-sm text-muted-foreground">{employee.employeeDetails?.position}</p>
                        <p className="text-sm text-muted-foreground">{employee.employeeDetails?.department}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <p className="text-sm"><span className="font-medium">Email:</span> {employee.email}</p>
                      <p className="text-sm"><span className="font-medium">Phone:</span> {employee.phone}</p>
                      <p className="text-sm"><span className="font-medium">Employee ID:</span> {employee.employeeId}</p>
                      <p className="text-sm"><span className="font-medium">Join Date:</span> {new Date(employee.dateOfJoining).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Attendance Summary</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Attendance Rate</span>
                        <span className="text-sm font-medium">{attendanceData.attendancePercentage}%</span>
                      </div>
                      <Progress value={attendanceData.attendancePercentage} className="w-full" />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Present Days</p>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{attendanceData.presentDays}</p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Absent Days</p>
                          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{attendanceData.absentDays}</p>
                        </div>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Leave Days</p>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{attendanceData.leaveDays}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Salary Information</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Salary</p>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          Rs. {payrollData?.amount?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Per Day</p>
                          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            Rs. {payrollData?.perDaySalary?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}
                          </p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Payable Amount</p>
                          <p className="text-xl font-bold text-green-600 dark:text-green-400">
                            Rs. {payrollData?.payableAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="md:col-span-2">
                  <LeaveRequest />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="attendance">
              <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle>Detailed Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Current Month Attendance</span>
                      <span className="text-sm font-medium">{attendanceData.attendancePercentage}%</span>
                    </div>
                    <Progress value={attendanceData.attendancePercentage} className="w-full" />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Present Days</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{attendanceData.presentDays}</p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Absent Days</p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{attendanceData.absentDays}</p>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Leave Days</p>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{attendanceData.leaveDays}</p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Working Days</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{attendanceData.workingDays}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payroll">
              <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle>Payroll History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Current Month Salary</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">Rs. {payrollData?.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Per Day Salary</p>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">Rs. {payrollData?.perDaySalary?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}
                        </p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Payable Amount</p>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">Rs. {payrollData?.payableAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4">Recent Payslips</h3>
                      <div className="backdrop-blur-sm bg-white/30">
                        <ul className="space-y-4">
                          {payslips.map((payslip) => (
                            <li 
                              key={payslip.id} 
                              className="flex items-center justify-between p-4 bg-gray-100/95 dark:bg-gray-800/95 rounded-lg backdrop-blur-sm shadow-sm"
                            >
                              <div>
                                <p className="font-medium">{payslip.month}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(payslip.date).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center">
                                <span className="font-bold text-green-600 dark:text-green-400 mr-4">
                                  {payslip.amount}
                                </span>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => generatePayslip(payslip)}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

