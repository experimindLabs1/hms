import { Input } from "@/components/ui/input";

export const PersonalInformation = ({ newEmployee, handleInputChange }) => (
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
                    Father's Name <span className="text-red-500">*</span>
                </label>
                <Input
                    placeholder="Enter father's name"
                    name="fatherName"
                    value={newEmployee.fatherName}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    PAN Number <span className="text-red-500">*</span>
                </label>
                <Input
                    placeholder="Enter PAN number"
                    name="pan"
                    value={newEmployee.pan}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    Personal Email <span className="text-red-500">*</span>
                </label>
                <Input
                    placeholder="Enter personal email"
                    name="personalEmail"
                    value={newEmployee.personalEmail}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium text-gray-700">
                    Residential Address <span className="text-red-500">*</span>
                </label>
                <Input
                    placeholder="Enter residential address"
                    name="residentialAddress"
                    value={newEmployee.residentialAddress}
                    onChange={handleInputChange}
                    required
                />
            </div>
        </div>
    </div>
);