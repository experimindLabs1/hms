'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmployeeHeader } from './components/EmployeeHeader'
import { BasicInfo } from './components/BasicInfo'
import { PersonalInfo } from './components/PersonalInfo'
import { PaymentInfo } from './components/PaymentInfo'
import { LeaveHistory } from './components/LeaveHistory'

export default function EmployeePage() {
    const [employee, setEmployee] = useState(null)
    const [editedEmployee, setEditedEmployee] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const params = useParams()
    const router = useRouter()

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const response = await axios.get(`/api/employees/${params.id}`)
                setEmployee(response.data)
                setEditedEmployee(response.data)
                setLoading(false)
            } catch (err) {
                setError('Failed to fetch employee data')
                setLoading(false)
                console.error(err)
            }
        }

        fetchEmployee()
    }, [params.id])

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this employee?')) {
            try {
                await axios.delete(`/api/employees/${params.id}`);
                router.push('/manage-employees');
            } catch (err) {
                console.error('Error deleting employee:', err);
                alert('Failed to delete employee. Please try again.');
            }
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const getChangedFields = () => {
        const changedFields = {};
        Object.keys(editedEmployee).forEach(key => {
            if (editedEmployee[key] !== employee[key]) {
                changedFields[key] = editedEmployee[key];
            }
        });
        return changedFields;
    };

    const handleSave = async () => {
        try {
            const changedFields = getChangedFields();
            if (Object.keys(changedFields).length === 0) {
                setIsEditing(false);
                return;
            }

            await axios.patch(`/api/employees/${params.id}`, changedFields);
            setEmployee(editedEmployee);
            setIsEditing(false);
            alert('Employee information has been updated successfully.');
        } catch (err) {
            console.error('Error updating employee:', err);
            alert('Failed to update employee information. Please try again.');
        }
    };

    const handleCancel = () => {
        setEditedEmployee(employee);
        setIsEditing(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedEmployee(prev => ({ ...prev, [name]: value }));
    };

    if (loading) return <div className="text-center mt-8">Loading...</div>
    if (error) return <div className="text-center mt-8 text-red-500">{error}</div>
    if (!employee) return <div className="text-center mt-8">Employee not found</div>

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center mb-6">
                <Link href="/manage-employees" className="inline-flex items-center text-gray-600 hover:text-gray-800">
                    <ArrowLeft className="mr-2" size={20} />
                    Back to Employees
                </Link>
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <Button onClick={handleSave}>Save</Button>
                            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={handleEdit}>Edit</Button>
                            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                        </>
                    )}
                </div>
            </div>

            <EmployeeHeader 
                employee={isEditing ? editedEmployee : employee} 
                isEditing={isEditing}
                onInputChange={handleInputChange}
            />

            <Tabs defaultValue="basic" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:w-1/2">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="personal">Personal Info</TabsTrigger>
                    <TabsTrigger value="payment">Payment Info</TabsTrigger>
                    <TabsTrigger value="leave">Leave History</TabsTrigger>
                </TabsList>

                <TabsContent value="basic">
                    <BasicInfo 
                        employee={isEditing ? editedEmployee : employee} 
                        isEditing={isEditing}
                        onInputChange={handleInputChange}
                    />
                </TabsContent>

                <TabsContent value="personal">
                    <PersonalInfo 
                        employee={isEditing ? editedEmployee : employee} 
                        isEditing={isEditing}
                        onInputChange={handleInputChange}
                    />
                </TabsContent>

                <TabsContent value="payment">
                    <PaymentInfo 
                        employee={isEditing ? editedEmployee : employee} 
                        isEditing={isEditing}
                        onInputChange={handleInputChange}
                    />
                </TabsContent>

                <TabsContent value="leave">
                    <LeaveHistory employeeId={params.id} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

