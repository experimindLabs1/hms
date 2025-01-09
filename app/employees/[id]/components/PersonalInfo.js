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
                            value={employee.dateOfBirth}
                            onChange={onInputChange}
                        />
                    ) : (
                        <p className="text-sm text-gray-700">{new Date(employee.dateOfBirth).toLocaleDateString()}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="fatherName">Fatherv&apos;s Name</Label>
                    {isEditing ? (
                        <Input
                            id="fatherName"
                            name="fatherName"
                            value={employee.fatherName}
                            onChange={onInputChange}
                        />
                    ) : (
                        <p className="text-sm text-gray-700">{employee.fatherName}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="pan">PAN</Label>
                    {isEditing ? (
                        <Input
                            id="pan"
                            name="pan"
                            value={employee.pan}
                            onChange={onInputChange}
                        />
                    ) : (
                        <p className="text-sm text-gray-700">{employee.pan}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="personalEmail">Personal Email</Label>
                    {isEditing ? (
                        <Input
                            id="personalEmail"
                            name="personalEmail"
                            type="email"
                            value={employee.personalEmail}
                            onChange={onInputChange}
                        />
                    ) : (
                        <p className="text-sm text-gray-700">{employee.personalEmail}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

