'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';

export default function LeaveRequests() {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        console.log('Admin: Component mounted or refreshed, fetching leave requests');
        fetchLeaveRequests();
    }, [refreshKey]);

    const fetchLeaveRequests = async () => {
        try {
            setLoading(true);
            console.log('Admin: Starting to fetch leave requests');
            const token = localStorage.getItem('token');
            
            if (!token) {
                console.error('Admin: No token found');
                setError('Authentication required');
                return;
            }

            const response = await axios.get(`/api/admin/leave-requests?t=${new Date().getTime()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            console.log('Admin: Leave requests fetched:', response.data);
            setLeaveRequests(response.data);
            setError(null);
        } catch (err) {
            console.error('Admin: Error fetching leave requests:', err);
            setError(err.response?.data?.error || 'Failed to fetch leave requests');
            setLeaveRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (requestId, newStatus) => {
        try {
            console.log('Admin: Updating status:', { requestId, newStatus });
            const token = localStorage.getItem('token');
            
            const response = await axios.patch(`/api/admin/leave-requests/${requestId}`, {
                status: newStatus
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Admin: Status update response:', response.data);
            setRefreshKey(oldKey => oldKey + 1);
        } catch (err) {
            console.error('Admin: Error updating status:', err);
            setError(err.response?.data?.error || 'Failed to update status');
        }
    };

    const refreshData = () => {
        console.log('Admin: Manually refreshing data');
        setRefreshKey(oldKey => oldKey + 1);
    };

    if (loading) return <div>Loading leave requests...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <Card className="mt-4 sm:mt-6">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4">
                <CardTitle className="text-lg sm:text-xl mb-2 sm:mb-0">
                    Leave Requests ({leaveRequests.length})
                </CardTitle>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshData}
                    className="w-full sm:w-auto"
                >
                    Refresh
                </Button>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
                {leaveRequests.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">No leave requests found</div>
                ) : (
                    <div className="space-y-2 sm:space-y-4">
                        {leaveRequests.map((request) => (
                            <Card key={request.id} className="p-3 sm:p-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                    <div className="w-full sm:w-auto">
                                        <h3 className="font-semibold text-sm sm:text-base">
                                            {request.employee.firstName} {request.employee.lastName}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                            Dates: {request.leaveDates.map(date => 
                                                format(new Date(date.date), 'MMM dd, yyyy')
                                            ).join(', ')}
                                        </p>
                                        <p className="text-xs sm:text-sm mt-2">{request.reason}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                        {request.status === 'PENDING' ? (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1 sm:flex-none bg-green-50 text-green-600 hover:bg-green-100"
                                                    onClick={() => handleStatusUpdate(request.id, 'APPROVED')}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1 sm:flex-none bg-red-50 text-red-600 hover:bg-red-100"
                                                    onClick={() => handleStatusUpdate(request.id, 'REJECTED')}
                                                >
                                                    Reject
                                                </Button>
                                            </>
                                        ) : (
                                            <span className={`px-2 py-1 rounded-full text-xs sm:text-sm ${
                                                request.status === 'APPROVED' 
                                                    ? 'bg-green-100 text-green-600' 
                                                    : 'bg-red-100 text-red-600'
                                            }`}>
                                                {request.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
