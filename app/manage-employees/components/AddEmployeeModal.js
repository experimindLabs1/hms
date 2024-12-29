'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { User } from 'lucide-react'
import { BasicInformation } from "./BasicInformation"
import { PersonalInformation } from "./PersonalInformation"
import { PaymentInformation } from "./PaymentInformation"

export const AddEmployeeModal = ({ isOpen, onClose, onAddEmployee }) => {
    const [currentSlide, setCurrentSlide] = useState(1);
    const [newEmployee, setNewEmployee] = useState({
        employeeId: "",
        password: "", // Add password field
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
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold mb-4">Add New Employee</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
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

                            <BasicInformation 
                                newEmployee={newEmployee} 
                                handleInputChange={handleInputChange}
                                handleSelectChange={handleSelectChange}
                            />

                            <PersonalInformation 
                                newEmployee={newEmployee} 
                                handleInputChange={handleInputChange}
                            />

                            <div className="flex justify-end gap-4 pt-6 border-t">
                                <Button variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button type="button" onClick={handleNext}>
                                    Next
                                </Button>
                            </div>
                        </>
                    )}

                    {currentSlide === 2 && (
                        <>
                            <PaymentInformation 
                                newEmployee={newEmployee} 
                                handleInputChange={handleInputChange}
                                handleSelectChange={handleSelectChange}
                            />

                            <div className="flex justify-end gap-4 pt-6 border-t">
                                <Button variant="outline" onClick={handleBack}>
                                    Back
                                </Button>
                                <Button type="submit">
                                    Add Employee
                                </Button>
                            </div>
                        </>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    );
};

