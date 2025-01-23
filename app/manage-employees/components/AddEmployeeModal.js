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
import { User, ChevronLeft, ChevronRight } from 'lucide-react';
import { BasicInformation } from "./BasicInformation";
import { PersonalInformation } from "./PersonalInformation";
import { PaymentInformation } from "./PaymentInformation";

export const AddEmployeeModal = ({ isOpen, onClose, onAddEmployee }) => {
    const [currentSlide, setCurrentSlide] = useState(1);
    const [newEmployee, setNewEmployee] = useState({
        employeeId: "",
        password: "",
        firstName: "",
        lastName: "",
        position: "",
        department: "",
        email: "",
        phone: "",
        gender: "",
        dateOfJoining: "",
        dateOfBirth: "",
        fatherName: "",
        pan: "",
        personalEmail: "",
        residentialAddress: "",
        paymentMode: "",
        accountNumber: "",
        accountHolderName: "",
        bankName: "",
        ifsc: "",
        accountType: "",
        baseSalary: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEmployee(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setNewEmployee(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentSlide === 2) {
            onAddEmployee(newEmployee);
            onClose();
        }
    };

    const handleNext = () => {
        setCurrentSlide(2);
    };

    const handleBack = () => {
        setCurrentSlide(1);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(isOpen) => {
            // Only close the modal when explicitly triggered by a button or other action
            if (!isOpen) {
                onClose();
            }
        }}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto p-6" onInteractOutside={(e) => {
                // Prevent closing when clicking outside the modal
                e.preventDefault();
            }}>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold mb-4">Add New Employee</DialogTitle>
                </DialogHeader>

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
                                                placeholder="First Name"
                                                className="flex-1"
                                                name="firstName"
                                                value={newEmployee.firstName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            <Input
                                                placeholder="Last Name"
                                                className="flex-1"
                                                name="lastName"
                                                value={newEmployee.lastName}
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
                                    <Button variant="outline" onClick={onClose}>
                                        Cancel
                                    </Button>
                                    <Button type="button" onClick={handleNext}>
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
                                    <Button variant="outline" onClick={handleBack}>
                                        <ChevronLeft className="mr-2 h-4 w-4" /> Back
                                    </Button>
                                    <Button type="submit">
                                        Add Employee
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