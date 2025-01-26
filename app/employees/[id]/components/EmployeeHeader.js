import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function EmployeeHeader({ employee, isEditing, onInputChange }) {
    return (
        <Card className="col-span-full">
            <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={`/placeholder.svg?height=96&width=96`} alt={employee.name} />
                    <AvatarFallback className="text-2xl">
                        {employee.name?.[0]}
                    </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl font-bold mb-4">
                    {isEditing ? (
                        <div className="flex gap-2 justify-center">
                            <Input
                                name="name"
                                value={employee.name || ''}
                                onChange={onInputChange}
                                className="w-2/3 text-center"
                            />
                        </div>
                    ) : (
                        employee.name
                    )}
                </CardTitle>
                <div className="space-y-2">
                    <Label htmlFor="employeeCode">Employee Code</Label>
                    <p className="text-gray-700">({employee.employeeId})</p>
                </div>
                <div className="space-y-2 mt-4">
                    <Label htmlFor="position">Position</Label>
                    {isEditing ? (
                        <Input
                            id="position"
                            name="position"
                            value={employee.employeeDetails?.position || ''}
                            onChange={onInputChange}
                            className="w-1/2 mx-auto text-center"
                        />
                    ) : (
                        <p className="text-gray-500">{employee.employeeDetails?.position}</p>
                    )}
                </div>
            </CardHeader>
        </Card>
    )
}

