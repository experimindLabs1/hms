import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export const BasicInformation = ({ newEmployee, handleInputChange, handleSelectChange }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 grid grid-cols-2 gap-4">
                <Input
                    placeholder="Employee ID"
                    name="employeeId"
                    value={newEmployee.employeeId}
                    onChange={handleInputChange}
                    required
                />
                <Input
                    type="password"
                    placeholder="Password"
                    name="password"
                    value={newEmployee.password}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <Input
                type="email"
                placeholder="Email Address"
                name="email"
                value={newEmployee.email}
                onChange={handleInputChange}
                required
            />
            <Input
                placeholder="Phone Number"
                name="phone"
                value={newEmployee.phone}
                onChange={handleInputChange}
            />
            <Select
                value={newEmployee.gender}
                onValueChange={(value) => handleSelectChange("gender", value)}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                </SelectContent>
            </Select>
            <Input 
                type="date" 
                placeholder="Date of Joining"
                name="dateOfJoining"
                value={newEmployee.dateOfJoining}
                onChange={handleInputChange}
            />
        </div>
    </div>
)

