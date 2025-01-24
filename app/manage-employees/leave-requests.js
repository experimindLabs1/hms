'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { toast } from "sonner";

export default function LeaveRequests() {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        fetchLeaveRequests();
    }, [refreshKey]);

    const fetchLeaveRequests = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/leave-requests');
            if (!response.ok) throw new Error('Failed to fetch leave requests');
            const data = await response.json();
            setLeaveRequests(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching leave requests:', err);
            setError('Failed to fetch leave requests');
            setLeaveRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (leaveRequestId, status) => {
        try {
            const response = await fetch('/api/admin/leave-requests', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ leaveRequestId, status }),
            });

            if (!response.ok) throw new Error('Failed to update status');

            toast.success(`Leave request ${status.toLowerCase()} successfully`);
            setRefreshKey(old => old + 1); // Refresh the list
        } catch (err) {
            console.error('Error updating status:', err);
            toast.error('Failed to update status');
        }
    };

    if (loading) return <div className="text-center p-4">Loading leave requests...</div>;
    if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

    return (
        <Card className="mt-4 sm:mt-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-xl font-bold">
                    Leave Requests ({leaveRequests.length})
                </CardTitle>
                <Button 
                    variant="outline" 
                    onClick={() => setRefreshKey(old => old + 1)}
                >
                    Refresh
                </Button>
            </CardHeader>
            <CardContent>
                {leaveRequests.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                        No leave requests found
                    </div>
                ) : (
                    <div className="space-y-4">
                        {leaveRequests.map((request) => (
                            <Card key={request.id} className="p-4">
                                <div className="flex flex-col sm:flex-row justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold">
                                                {request.employee.name}
                                            </h3>
                                            <span className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                                {request.leaveType}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">
                                            {request.employee.employeeDetails.department} - {request.employee.employeeDetails.position}
                                        </p>
                                        <p className="text-sm mb-2">
                                            Dates: {request.leaveDates.map(date => 
                                                format(new Date(date.date), 'MMM dd, yyyy')
                                            ).join(', ')}
                                        </p>
                                        <p className="text-sm text-gray-700">{request.reason}</p>
                                    </div>
                                    <div className="flex sm:flex-col gap-2 sm:min-w-[120px]">
                                        {request.status === 'PENDING' ? (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 bg-green-50 text-green-600 hover:bg-green-100"
                                                    onClick={() => handleStatusUpdate(request.id, 'APPROVED')}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 bg-red-50 text-red-600 hover:bg-red-100"
                                                    onClick={() => handleStatusUpdate(request.id, 'REJECTED')}
                                                >
                                                    Reject
                                                </Button>
                                            </>
                                        ) : (
                                            <span className={`px-3 py-1 rounded-full text-center ${
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
