import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export const PaymentInformation = ({ newEmployee, handleInputChange, handleSelectChange }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold">Payment Information</h3>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    Payment Mode <span className="text-red-500">*</span>
                </label>
                <Select
                    value={newEmployee.paymentMode}
                    onValueChange={(value) => handleSelectChange("paymentMode", value)}
                    required
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="bank">Manual Bank Transfer</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    Account Number <span className="text-red-500">*</span>
                </label>
                <Input
                    placeholder="Enter account number"
                    name="accountNumber"
                    value={newEmployee.accountNumber}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    Account Holder Name <span className="text-red-500">*</span>
                </label>
                <Input
                    placeholder="Enter account holder name"
                    name="accountHolderName"
                    value={newEmployee.accountHolderName}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    Bank Name <span className="text-red-500">*</span>
                </label>
                <Input
                    placeholder="Enter bank name"
                    name="bankName"
                    value={newEmployee.bankName}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    IFSC Code <span className="text-red-500">*</span>
                </label>
                <Input
                    placeholder="Enter IFSC code"
                    name="ifsc"
                    value={newEmployee.ifsc}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    Account Type <span className="text-red-500">*</span>
                </label>
                <Select
                    value={newEmployee.accountType}
                    onValueChange={(value) => handleSelectChange("accountType", value)}
                    required
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="savings">Savings</SelectItem>
                        <SelectItem value="current">Current</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    Base Salary <span className="text-red-500">*</span>
                </label>
                <Input
                    placeholder="Enter base salary"
                    name="baseSalary"
                    value={newEmployee.baseSalary}
                    onChange={handleInputChange}
                    required
                />
            </div>
        </div>
    </div>
);