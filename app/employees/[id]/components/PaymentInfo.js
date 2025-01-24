import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function PaymentInfo({ employee, isEditing, onInputChange }) {
    const handleSelectChange = (value) => {
        onInputChange({ target: { name: 'paymentMode', value } });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="space-y-2">
                    <Label htmlFor="paymentMode">Payment Mode</Label>
                    {isEditing ? (
                        <Select
                            name="paymentMode"
                            value={employee.employeeDetails?.paymentMode}
                            onValueChange={handleSelectChange}
                        >
                            <SelectTrigger id="paymentMode">
                                <SelectValue placeholder="Select payment mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bank">Bank Transfer</SelectItem>
                                <SelectItem value="upi">UPI</SelectItem>
                            </SelectContent>
                        </Select>
                    ) : (
                        <p className="text-sm text-gray-700">{employee.employeeDetails?.paymentMode}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
                    {isEditing ? (
                        <Input
                            id="bankAccountNumber"
                            name="bankAccountNumber"
                            value={employee.employeeDetails?.bankAccountNumber}
                            onChange={onInputChange}
                        />
                    ) : (
                        <p className="text-sm text-gray-700">
                            XXXX{employee.employeeDetails?.bankAccountNumber?.slice(-4)}
                        </p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    {isEditing ? (
                        <Input
                            id="bankName"
                            name="bankName"
                            value={employee.employeeDetails?.bankName}
                            onChange={onInputChange}
                        />
                    ) : (
                        <p className="text-sm text-gray-700">{employee.employeeDetails?.bankName}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="salary">Salary</Label>
                    {isEditing ? (
                        <Input
                            id="salary"
                            name="salary"
                            type="number"
                            value={employee.employeeDetails?.salary}
                            onChange={onInputChange}
                        />
                    ) : (
                        <p className="text-sm text-gray-700">
                            {employee.employeeDetails?.salary != null 
                                ? Number(employee.employeeDetails.salary).toFixed(2) 
                                : "0.00"}
                        </p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID</Label>
                    {isEditing ? (
                        <Input
                            id="taxId"
                            name="taxId"
                            value={employee.employeeDetails?.taxId}
                            onChange={onInputChange}
                        />
                    ) : (
                        <p className="text-sm text-gray-700">{employee.employeeDetails?.taxId}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

