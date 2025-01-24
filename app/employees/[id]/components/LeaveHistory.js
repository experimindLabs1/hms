import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export function LeaveHistory({ employeeId }) {
    const [leaveHistory, setLeaveHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLeaveHistory();
    }, [employeeId]);

    const fetchLeaveHistory = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/employee-leaves/${employeeId}`);
            if (!response.ok) throw new Error('Failed to fetch leave history');
            const data = await response.json();
            setLeaveHistory(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching leave history:', err);
            setError('Failed to fetch leave history');
            setLeaveHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Leave History</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-center py-4">Loading leave history...</div>
                ) : error ? (
                    <div className="text-red-500 text-center py-4">{error}</div>
                ) : leaveHistory.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                        No leave history found
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date(s)</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leaveHistory.map((leave) => (
                                <TableRow key={leave.id}>
                                    <TableCell>
                                        {leave.leaveDates
                                            .map(d => format(new Date(d.date), 'MMM dd, yyyy'))
                                            .join(', ')}
                                    </TableCell>
                                    <TableCell>{leave.leaveType}</TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {leave.reason}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(leave.status)}`}>
                                            {leave.status}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
} 