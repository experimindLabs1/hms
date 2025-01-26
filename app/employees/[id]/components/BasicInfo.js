import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function BasicInfo({ employee, isEditing, onInputChange }) {
    const departments = ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales']

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Email</label>
                        <p className="mt-1">{employee.email || 'Not specified'}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Department</label>
                        {isEditing ? (
                            <Select
                                name="department"
                                value={employee.employeeDetails?.department || ''}
                                onValueChange={(value) => 
                                    onInputChange({ target: { name: 'department', value } })
                                }
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map(dept => (
                                        <SelectItem key={dept} value={dept}>
                                            {dept}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <p className="mt-1">{employee.employeeDetails?.department || 'Not specified'}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-medium">Phone</label>
                        {isEditing ? (
                            <Input
                                name="phone"
                                value={employee.employeeDetails?.phone || ''}
                                onChange={onInputChange}
                                className="mt-1"
                            />
                        ) : (
                            <p className="mt-1">{employee.employeeDetails?.phone || 'Not specified'}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
