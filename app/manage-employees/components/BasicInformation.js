import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export const BasicInformation = ({ newEmployee, handleInputChange, handleSelectChange }) => (
    <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    Employee ID <span className="text-red-500">*</span>
                </label>
                <Input
                    placeholder="Will be auto-generated (e.g., EMP001)"
                    disabled
                    className="bg-gray-50"
                />
                <span className="text-xs text-gray-500 italic">
                    This will be your login username
                </span>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                </label>
                <Input
                    type="password"
                    placeholder="Enter password"
                    name="password"
                    value={newEmployee.password}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                    placeholder="Enter full name"
                    name="name"
                    value={newEmployee.name}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    Work Email <span className="text-red-500">*</span>
                </label>
                <Input
                    type="email"
                    placeholder="Enter work email"
                    name="email"
                    value={newEmployee.email}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                </label>
                <Input
                    placeholder="Enter phone number"
                    name="phone"
                    value={newEmployee.phone}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    Date of Joining <span className="text-red-500">*</span>
                </label>
                <Input
                    type="date"
                    name="joinedAt"
                    value={newEmployee.joinedAt}
                    onChange={handleInputChange}
                    required
                />
            </div>
        </div>
    </div>
);