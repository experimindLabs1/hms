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
                            value={employee.paymentMode}
                            onValueChange={handleSelectChange}
                        >
                            <SelectTrigger id="paymentMode">
                                <SelectValue placeholder="Select payment mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bank">Bank Transfer</SelectItem>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="cheque">Cheque</SelectItem>
                            </SelectContent>
                        </Select>
                    ) : (
                        <p className="text-sm text-gray-700">{employee.paymentMode}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    {isEditing ? (
                        <Input
                            id="accountNumber"
                            name="accountNumber"
                            value={employee.accountNumber}
                            onChange={onInputChange}
                        />
                    ) : (
                        <p className="text-sm text-gray-700">XXXX{employee.accountNumber?.slice(-4)}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    {isEditing ? (
                        <Input
                            id="bankName"
                            name="bankName"
                            value={employee.bankName}
                            onChange={onInputChange}
                        />
                    ) : (
                        <p className="text-sm text-gray-700">{employee.bankName}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ifsc">IFSC</Label>
                    {isEditing ? (
                        <Input
                            id="ifsc"
                            name="ifsc"
                            value={employee.ifsc}
                            onChange={onInputChange}
                        />
                    ) : (
                        <p className="text-sm text-gray-700">{employee.ifsc}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="baseSalary">Base Salary</Label>
                    {isEditing ? (
                        <Input
                            id="baseSalary"
                            name="baseSalary"
                            type="number"
                            value={employee.baseSalary}
                            onChange={onInputChange}
                        />
                    ) : (
                        <p className="text-sm text-gray-700">
                            {employee?.baseSalary != null ? Number(employee.baseSalary).toFixed(2) : "0.00"}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

