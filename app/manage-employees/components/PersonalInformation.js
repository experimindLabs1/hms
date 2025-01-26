import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export const PersonalInformation = ({ newEmployee, handleInputChange, handleSelectChange }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    Date of Birth <span className="text-red-500">*</span>
                </label>
                <Input
                    type="date"
                    name="dateOfBirth"
                    value={newEmployee.dateOfBirth}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    Personal Email
                </label>
                <Input
                    type="email"
                    placeholder="Enter personal email"
                    name="personalEmail"
                    value={newEmployee.personalEmail}
                    onChange={handleInputChange}
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    Gender <span className="text-red-500">*</span>
                </label>
                <Select
                    value={newEmployee.gender}
                    onValueChange={(value) => handleSelectChange("gender", value)}
                    required
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium text-gray-700">
                    Address <span className="text-red-500">*</span>
                </label>
                <Input
                    placeholder="Enter residential address"
                    name="address"
                    value={newEmployee.address}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    Emergency Contact Name <span className="text-red-500">*</span>
                </label>
                <Input
                    placeholder="Emergency contact person"
                    name="emergencyContact"
                    value={newEmployee.emergencyContact}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    Emergency Contact Phone <span className="text-red-500">*</span>
                </label>
                <Input
                    placeholder="Emergency contact number"
                    name="emergencyPhone"
                    value={newEmployee.emergencyPhone}
                    onChange={handleInputChange}
                    required
                />
            </div>
        </div>
    </div>
);