import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export const PaymentInformation = ({ newEmployee, handleInputChange, handleSelectChange }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold">Payment Information</h3>
        <div className="grid grid-cols-2 gap-4">
            <Select
                value={newEmployee.paymentMode}
                onValueChange={(value) => handleSelectChange("paymentMode", value)}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Payment Mode" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="bank">Manual Bank Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                </SelectContent>
            </Select>
            <Input
                placeholder="Account Number"
                name="accountNumber"
                value={newEmployee.accountNumber}
                onChange={handleInputChange}
            />
            <Input
                placeholder="Account Holder Name"
                name="accountHolderName"
                value={newEmployee.accountHolderName}
                onChange={handleInputChange}
            />
            <Input
                placeholder="Bank Name"
                name="bankName"
                value={newEmployee.bankName}
                onChange={handleInputChange}
            />
            <Input
                placeholder="IFSC Code"
                name="ifsc"
                value={newEmployee.ifsc}
                onChange={handleInputChange}
            />
            <Select
                value={newEmployee.accountType}
                onValueChange={(value) => handleSelectChange("accountType", value)}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Account Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                </SelectContent>
            </Select>
            <Input
                placeholder="Base Salary"
                name="baseSalary"
                value={newEmployee.baseSalary}
                onChange={handleInputChange}
            />
        </div>
    </div>
)

