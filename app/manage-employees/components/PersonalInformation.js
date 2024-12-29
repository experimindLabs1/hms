import { Input } from "@/components/ui/input"

export const PersonalInformation = ({ newEmployee, handleInputChange }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
            <Input
                type="date"
                placeholder="Date of Birth"
                name="dateOfBirth"
                value={newEmployee.dateOfBirth}
                onChange={handleInputChange}
            />
            <Input
                placeholder="Father's Name"
                name="fatherName"
                value={newEmployee.fatherName}
                onChange={handleInputChange}
            />
            <Input
                placeholder="PAN Number"
                name="pan"
                value={newEmployee.pan}
                onChange={handleInputChange}
            />
            <Input
                placeholder="Personal Email Address"
                name="personalEmail"
                value={newEmployee.personalEmail}
                onChange={handleInputChange}
            />
            <Input
                placeholder="Residential Address"
                className="col-span-2"
                name="residentialAddress"
                value={newEmployee.residentialAddress}
                onChange={handleInputChange}
            />
        </div>
    </div>
)

