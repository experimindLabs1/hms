'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
import axios from 'axios';

export const PayrollActions = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [month, setMonth] = useState('');
    const [year, setYear] = useState(new Date().getFullYear().toString());

    const months = [
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' }
    ];

    const years = Array.from({ length: 5 }, (_, i) => 
        (new Date().getFullYear() - 2 + i).toString()
    );

    const generatePayroll = async () => {
        if (!month || !year) {
            toast.error('Please select both month and year');
            return;
        }

        setLoading(true);
        try {
            await axios.post('/api/payroll/generate', {
                month: parseInt(month),
                year: parseInt(year)
            });
            toast.success('Payroll generated successfully');
            setIsOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to generate payroll');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>
                Generate Payroll
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate Payroll</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label>Month</label>
                            <Select value={month} onValueChange={setMonth}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((month) => (
                                        <SelectItem key={month.value} value={month.value}>
                                            {month.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label>Year</label>
                            <Select value={year} onValueChange={setYear}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((year) => (
                                        <SelectItem key={year} value={year}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button 
                            onClick={generatePayroll} 
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? 'Generating...' : 'Generate'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}; 