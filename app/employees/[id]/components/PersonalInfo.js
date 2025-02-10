import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function PersonalInfo({ employee, isEditing, onInputChange }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    {isEditing ? (
                        <Input
                            id="dateOfBirth"
                            name="dateOfBirth"
                            type="date"
                            value={employee.employeeDetails?.dateOfBirth || ''}
                            onChange={onInputChange}
                        />
                    ) : (
                        <p className="text-sm text-gray-700">
                            {employee.employeeDetails?.dateOfBirth 
                                ? new Date(employee.employeeDetails.dateOfBirth).toLocaleDateString() 
                                : 'Not specified'}
                        </p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="fatherName">Father&apos;s Name</Label>
                    {isEditing ? (
                        <Input
                            id="fatherName"
                            name="fatherName"
                            value={employee.employeeDetails?.fatherName || ''}
                            onChange={onInputChange}
                        />
                    ) : (
                        <p className="text-sm text-gray-700">
                            {employee.employeeDetails?.fatherName || 'Not specified'}
                        </p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="pan">PAN</Label>
                    {isEditing ? (
                        <Input
                            id="pan"
                            name="pan"
                            value={employee.employeeDetails?.pan || ''}
                            onChange={onInputChange}
                        />
                    ) : (
                        <p className="text-sm text-gray-700">
                            {employee.employeeDetails?.pan || 'Not specified'}
                        </p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="personalEmail">Personal Email</Label>
                    {isEditing ? (
                        <Input
                            id="personalEmail"
                            name="personalEmail"
                            type="email"
                            value={employee.employeeDetails?.personalEmail || ''}
                            onChange={onInputChange}
                        />
                    ) : (
                        <p className="text-sm text-gray-700">
                            {employee.employeeDetails?.personalEmail || 'Not specified'}
                        </p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    {isEditing ? (
                        <Input
                            id="address"
                            name="address"
                            value={employee.employeeDetails?.address || ''}
                            onChange={onInputChange}
                        />
                    ) : (
                        <p className="text-sm text-gray-700">
                            {employee.employeeDetails?.address || 'Not specified'}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

