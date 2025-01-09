'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, addDays, differenceInDays, isBefore } from "date-fns";
import axios from 'axios';
import { Badge } from "@/components/ui/badge";
import CustomCalendar from '@/app/calendar/components/CustomCalendar';

export default function LeaveRequest() {
    const [selectedDates, setSelectedDates] = useState([]);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [leaveRequests, setLeaveRequests] = useState([]);

    useEffect(() => {
        console.log('Fetching leave requests...');
        fetchLeaveRequests();
    }, []);

    // Get the minimum allowed date (3 days from now)
    const getMinimumDate = () => {
        const today = new Date();
        return addDays(today, 3);
    };

    const isConsecutiveDaysValid = (dates) => {
        if (dates.length === 0) return true;
        
        // Sort the dates
        const sortedDates = [...dates].sort((a, b) => a - b);
        
        // Group consecutive dates
        const groups = [];
        let currentGroup = [sortedDates[0]];

        for (let i = 1; i < sortedDates.length; i++) {
            const currentDate = sortedDates[i];
            const prevDate = sortedDates[i - 1];
            
            // Check if dates are consecutive
            if (differenceInDays(currentDate, prevDate) === 1) {
                currentGroup.push(currentDate);
            } else {
                groups.push(currentGroup);
                currentGroup = [currentDate];
            }
        }
        groups.push(currentGroup);

        // Check if any group has more than 3 consecutive days
        return !groups.some(group => group.length > 3);
    };

    const handleDateSelect = (date) => {
        // Check if date is less than 3 days from now
        const minDate = getMinimumDate();
        if (isBefore(date, minDate)) {
            setError('Leave must be requested at least 3 days in advance');
            return;
        }

        // Create new array with selected dates
        let newDates;
        if (selectedDates.some(existingDate => 
            existingDate.getTime() === date.getTime()
        )) {
            // If date is already selected, remove it
            newDates = selectedDates.filter(d => d.getTime() !== date.getTime());
        } else {
            // Add the new date
            newDates = [...selectedDates, date];
        }

        // Check consecutive days rule
        if (!isConsecutiveDaysValid(newDates)) {
            setError('Cannot select more than 3 consecutive days');
            return;
        }

        setSelectedDates(newDates);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Starting leave request submission...');
        console.log('Selected dates:', selectedDates);
        console.log('Reason:', reason);

        if (selectedDates.length === 0) {
            console.error('No dates selected');
            setError('Please select leave dates');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            console.log('Token retrieved:', token ? 'Present' : 'Missing');

            // Format dates to YYYY-MM-DD to avoid timezone issues
            const formattedDates = selectedDates.map(date => {
                const formatted = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                    .toISOString()
                    .split('T')[0];
                console.log('Formatted date:', formatted);
                return formatted;
            });

            console.log('Sending request with data:', {
                selectedDates: formattedDates,
                reason
            });

            const response = await axios.post('/api/employee/leave-request', {
                selectedDates: formattedDates,
                reason
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Leave request response:', response.data);
            setSuccess('Leave request submitted successfully');
            setSelectedDates([]);
            setReason('');
            fetchLeaveRequests();
        } catch (error) {
            console.error('Leave request error:', error);
            console.error('Error response:', error.response?.data);
            setError(error.response?.data?.error || 'Failed to submit leave request');
        } finally {
            setLoading(false);
        }
    };

    const fetchLeaveRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Fetching leave requests with token:', token ? 'Present' : 'Missing');

            const response = await axios.get('/api/employee/leave-request', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Fetched leave requests:', response.data);
            setLeaveRequests(response.data);
        } catch (error) {
            console.error('Error fetching leave requests:', error);
            console.error('Error response:', error.response?.data);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Request Leave</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Select Leave Dates 
                                <span className="text-gray-500 ml-1">
                                    (3 days notice required, max 3 consecutive days)
                                </span>
                            </label>
                            <div className="border rounded-md p-4">
                                <CustomCalendar
                                    selectedDate={selectedDates[selectedDates.length - 1] || new Date()}
                                    onSelectDate={handleDateSelect}
                                />
                            </div>
                            {selectedDates.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    <p className="text-sm font-medium text-gray-700">
                                        Selected dates ({selectedDates.length} days):
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {selectedDates
                                            .sort((a, b) => a - b)
                                            .map(date => format(date, 'MMM dd, yyyy'))
                                            .join(', ')}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Reason for Leave</label>
                            <Textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Please explain your reason for leave..."
                                className="min-h-[100px]"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        {success && <p className="text-green-500 text-sm">{success}</p>}
                        <Button 
                            type="submit" 
                            disabled={loading || selectedDates.length === 0 || !reason}
                            className="w-full"
                        >
                            {loading ? 'Submitting...' : 'Submit Leave Request'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Leave Request History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {leaveRequests.map((request) => (
                            <div key={request.id} className="bg-white p-4 rounded-lg shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">
                                            {request.leaveDates?.map((leaveDate, index) => (
                                                <span key={leaveDate.date}>
                                                    {format(new Date(leaveDate.date), 'PPP')}
                                                    {index < request.leaveDates.length - 1 ? ', ' : ''}
                                                </span>
                                            ))}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">{request.reason}</p>
                                    </div>
                                    <Badge
                                        className={`${
                                            request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                            request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {request.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 