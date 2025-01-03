'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, DollarSign, Clock, UserCircle, BarChart2, FileText, Settings, ChevronRight } from 'lucide-react'
import LeaveRequest from './leave-request'

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState(null)
  const [attendanceData, setAttendanceData] = useState(null)
  const [payrollData, setPayrollData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()
  const [payslips, setPayslips] = useState([])

  useEffect(() => {
    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No token found in localStorage');
                router.push('/login');
                return;
            }

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            // Get employee profile directly first
            const employeeResponse = await axios.get('/api/employee/profile', config);
            console.log('Raw Employee Response:', employeeResponse.data);
            console.log('canAccessPayslip value:', employeeResponse.data.canAccessPayslip);
            setEmployee(employeeResponse.data);

            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            const currentYear = currentDate.getFullYear();

            // Then get attendance and payroll data
            const [attendanceResponse, payrollResponse] = await Promise.all([
                axios.get('/api/employee/attendance', {
                    ...config,
                    params: {
                        month: currentMonth,
                        year: currentYear
                    }
                }),
                axios.get('/api/employee/payroll', {
                    ...config,
                    params: {
                        month: currentMonth,
                        year: currentYear
                    }
                })
            ]);

            setAttendanceData(attendanceResponse.data);
            setPayrollData(payrollResponse.data);

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            if (err.response?.status === 401 || err.response?.status === 404) {
                router.push('/login');
            } else {
                setError('Failed to fetch dashboard data');
            }
        } finally {
            setLoading(false);
        }
    };

    fetchDashboardData();
  }, [router]);

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
                    params: { month, year },
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (response.data) {
                    payslipsData.push({
                        id: response.data.id,
                        month: response.data.month,
                        amount: `Rs. ${response.data.amount.toFixed(2)}`,
                        date: date.toISOString(),
                        year: year,
                        monthNum: month,
                        isApproved: response.data.isApproved
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
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
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

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  )
  if (error) return <div className="text-red-500 text-center p-4 bg-red-100 rounded-lg m-4">{error}</div>
  if (!employee) return <div className="text-center p-4 bg-yellow-100 rounded-lg m-4">Employee not found</div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {employee.firstName}!</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Here's what's happening with your account today.</p>
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
                        <AvatarFallback>{employee.firstName[0]}{employee.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{employee.firstName} {employee.lastName}</h3>
                        <p className="text-sm text-muted-foreground">{employee.position}</p>
                        <p className="text-sm text-muted-foreground">{employee.department}</p>
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

