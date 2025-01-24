'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Download } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from 'axios';

export const EmployeeActions = ({ employee }) => {
    const [loading, setLoading] = useState(false);

    const downloadPayslip = async (month, year) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/payroll/download`, {
                params: {
                    employeeId: employee.id,
                    month,
                    year
                },
                responseType: 'blob'
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `payslip-${employee.name}-${month}-${year}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Failed to download payslip');
        } finally {
            setLoading(false);
        }
    };

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => downloadPayslip(currentMonth, currentYear)}
                    disabled={loading}
                >
                    <Download className="mr-2 h-4 w-4" />
                    Download Latest Payslip
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}; 