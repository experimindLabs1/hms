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
                    value={newEmployee.paymentMode || ''}
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
                    Bank Account Number <span className="text-red-500">*</span>
                </label>
                <Input
                    placeholder="Enter bank account number"
                    name="bankAccountNumber"
                    value={newEmployee.bankAccountNumber || ''}
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
                    value={newEmployee.bankName || ''}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    Tax ID <span className="text-red-500">*</span>
                </label>
                <Input
                    placeholder="Enter tax ID"
                    name="taxId"
                    value={newEmployee.taxId || ''}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    Salary <span className="text-red-500">*</span>
                </label>
                <Input
                    type="number"
                    placeholder="Enter salary"
                    name="salary"
                    value={newEmployee.salary || ''}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    Employment Type <span className="text-red-500">*</span>
                </label>
                <Select
                    value={newEmployee.employmentType || ''}
                    onValueChange={(value) => handleSelectChange("employmentType", value)}
                    required
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="FULL_TIME">Full Time</SelectItem>
                        <SelectItem value="PART_TIME">Part Time</SelectItem>
                        <SelectItem value="CONTRACT">Contract</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    </div>
);