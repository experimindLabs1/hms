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
        <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Leave Requests ({leaveRequests.length})</CardTitle>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshData}
                    className="ml-2"
                >
                    Refresh
                </Button>
            </CardHeader>
            <CardContent>
                {leaveRequests.length === 0 ? (
                    <div className="text-center text-gray-500">No leave requests found</div>
                ) : (
                    <div className="space-y-4">
                        {leaveRequests.map((request) => (
                            <Card key={request.id} className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold">
                                            {request.employee.firstName} {request.employee.lastName}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Dates: {request.leaveDates.map(date => 
                                                format(new Date(date.date), 'MMM dd, yyyy')
                                            ).join(', ')}
                                        </p>
                                        <p className="text-sm mt-2">{request.reason}</p>
                                    </div>
                                    <div className="space-x-2">
                                        {request.status === 'PENDING' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="bg-green-50 text-green-600 hover:bg-green-100"
                                                    onClick={() => handleStatusUpdate(request.id, 'APPROVED')}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="bg-red-50 text-red-600 hover:bg-red-100"
                                                    onClick={() => handleStatusUpdate(request.id, 'REJECTED')}
                                                >
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                        {request.status !== 'PENDING' && (
                                            <span className={`px-2 py-1 rounded-full text-sm ${
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
