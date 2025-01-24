'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, addDays, differenceInDays, isBefore } from "date-fns";
import axios from 'axios';
import { Badge } from "@/components/ui/badge";
import CustomCalendar from '@/app/calendar/components/CustomCalendar';
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function LeaveRequest() {
    const [selectedDates, setSelectedDates] = useState([]);
    const [leaveType, setLeaveType] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        
        // Validate form
        if (!leaveType) {
            toast.error('Please select a leave type');
            return;
        }
        if (selectedDates.length === 0) {
            toast.error('Please select at least one date');
            return;
        }
        if (!reason.trim()) {
            toast.error('Please enter a reason for leave');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/employee/leave-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    leaveType,
                    reason,
                    dates: selectedDates
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit leave request');
            }

            toast.success('Leave request submitted successfully');
            
            // Reset form
            setSelectedDates([]);
            setLeaveType('');
            setReason('');
            
            // Refresh leave requests
            fetchLeaveRequests();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to submit leave request');
        } finally {
            setIsSubmitting(false);
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
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Leave Type</label>
                            <Select value={leaveType} onValueChange={setLeaveType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select leave type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ANNUAL">Annual Leave</SelectItem>
                                    <SelectItem value="SICK">Sick Leave</SelectItem>
                                    <SelectItem value="UNPAID">Unpaid Leave</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Dates</label>
                            <CustomCalendar
                                selectedDates={selectedDates}
                                onSelectDate={handleDateSelect}
                            />
                            {selectedDates.length > 0 && (
                                <div className="mt-2 text-sm text-gray-600">
                                    Selected dates: {selectedDates.map(date => 
                                        format(date, 'MMM dd, yyyy')
                                    ).join(', ')}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Reason</label>
                            <Textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Enter your reason for leave"
                                className="min-h-[100px]"
                            />
                        </div>

                        <Button 
                            onClick={handleSubmit}
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </div>
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