'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { User, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { BasicInformation } from "./BasicInformation";
import { PersonalInformation } from "./PersonalInformation";
import { PaymentInformation } from "./PaymentInformation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "react-hot-toast";

export const AddEmployeeModal = ({ isOpen, onClose, onAddEmployee }) => {
    const [currentSlide, setCurrentSlide] = useState(1);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        password: '',
        name: '',
        email: '',
        department: '',
        position: '',
        salary: '',
        bankAccountNumber: '',
        bankName: '',
        taxId: '',
        employmentType: 'FULL_TIME',
        dateOfJoining: '',
        phone: '',
        gender: ''
    });

    const validateFirstSlide = () => {
        // Basic validations for first slide
        if (!newEmployee.name || !newEmployee.department) {
            setError("Name and department are required");
            return false;
        }
        if (!newEmployee.position || !newEmployee.department) {
            setError("Position and department are required");
            return false;
        }
        if (!newEmployee.email || !/\S+@\S+\.\S+/.test(newEmployee.email)) {
            setError("Valid email address is required");
            return false;
        }
        if (!newEmployee.phone || !/^\d{10}$/.test(newEmployee.phone)) {
            setError("Valid 10-digit phone number is required");
            return false;
        }
        return true;
    };

   

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEmployee(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null); // Clear error when user makes changes
    };

    const handleSelectChange = (name, value) => {
        setNewEmployee(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null); // Clear error when user makes changes
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
       
        try {
            setLoading(true);
            await onAddEmployee(newEmployee);
            setNewEmployee({
                password: '',
                name: '',
                email: '',
                department: '',
                position: '',
                salary: '',
                bankAccountNumber: '',
                bankName: '',
                taxId: '',
                employmentType: 'FULL_TIME',
                dateOfJoining: '',
                phone: '',
                gender: ''
            });
            handleClose();
            toast.success('Employee created successfully');
        } catch (err) {
            const errorMessage = err.response?.data?.error;
            setError(
                errorMessage || 
                'Failed to create employee. Please try again.'
            );

            // Highlight the problematic field based on the error
            if (errorMessage?.includes('email')) {
                document.querySelector('[name="email"]')?.focus();
            } else if (errorMessage?.includes('Employee ID')) {
                document.querySelector('[name="employeeId"]')?.focus();
            } else if (errorMessage?.includes('phone')) {
                document.querySelector('[name="phone"]')?.focus();
            } else if (errorMessage?.includes('bank account')) {
                document.querySelector('[name="bankAccountNumber"]')?.focus();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        setError(null);
        if (validateFirstSlide()) {
            setCurrentSlide(2);
        }
    };

    const handleBack = () => {
        setError(null);
        setCurrentSlide(1);
    };

    const handleClose = () => {
        setError(null);
        setCurrentSlide(1);
        setNewEmployee({
            password: '',
            name: '',
            email: '',
            department: '',
            position: '',
            salary: '',
            bankAccountNumber: '',
            bankName: '',
            taxId: '',
            employmentType: 'FULL_TIME',
            dateOfJoining: '',
            phone: '',
            gender: ''
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold mb-4">Add New Employee</DialogTitle>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <div className="font-medium">Error:</div>
                            <div>{error}</div>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Progress Indicator */}
                <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: currentSlide === 1 ? "50%" : "100%" }}
                    ></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="min-h-[400px] transition-all duration-300">
                        {currentSlide === 1 && (
                            <>
                                {/* Header Section */}
                                <div className="flex items-start space-x-6 pb-6 border-b">
                                    <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                        <User className="w-16 h-16 text-gray-400" />
                                    </div>
                                    <div className="space-y-4 flex-grow">
                                        <div className="flex gap-4">
                                            <Input
                                                placeholder="Name"
                                                className="flex-1"
                                                name="name"
                                                value={newEmployee.name}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <Input
                                            placeholder="Position"
                                            name="position"
                                            value={newEmployee.position}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <Input
                                            placeholder="Department"
                                            name="department"
                                            value={newEmployee.department}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Basic Information */}
                                <BasicInformation
                                    newEmployee={newEmployee}
                                    handleInputChange={handleInputChange}
                                    handleSelectChange={handleSelectChange}
                                />

                                {/* Personal Information */}
                                <PersonalInformation
                                    newEmployee={newEmployee}
                                    handleInputChange={handleInputChange}
                                />

                                {/* Navigation Buttons */}
                                <div className="flex justify-end gap-4 pt-6 border-t">
                                    <Button type="button" variant="outline" onClick={handleClose}>
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="button" 
                                        onClick={handleNext}
                                        disabled={loading}
                                    >
                                        Next <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </>
                        )}

                        {currentSlide === 2 && (
                            <>
                                {/* Payment Information */}
                                <PaymentInformation
                                    newEmployee={newEmployee}
                                    handleInputChange={handleInputChange}
                                    handleSelectChange={handleSelectChange}
                                />

                                {/* Navigation Buttons */}
                                <div className="flex justify-end gap-4 pt-6 border-t">
                                    <Button type="button" variant="outline" onClick={handleBack}>
                                        <ChevronLeft className="mr-2 h-4 w-4" /> Back
                                    </Button>
                                    <Button 
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? 'Creating...' : 'Add Employee'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};