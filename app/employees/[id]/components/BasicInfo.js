import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function BasicInfo({ employee, isEditing, onInputChange }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                        <Input
                            id="email"
                            name="email"
                            value={employee.email}
                            onChange={onInputChange}
                        />
                    ) : (
                        <p className="text-sm text-gray-700">{employee.email}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                        <Input
                            id="phone"
                            name="phone"
                            value={employee.phone}
                            onChange={onInputChange}
                        />
                    ) : (
                        <p className="text-sm text-gray-700">{employee.phone}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    {isEditing ? (
                        <Input
                            id="department"
                            name="department"
                            value={employee.department}
                            onChange={onInputChange}
                        />
                    ) : (
                        <p className="text-sm text-gray-700">{employee.department}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
