const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSampleEmployee() {
    try {
        // Check if employee already exists
        const existingEmployee = await prisma.user.findUnique({
            where: {
                email: 'john.doe@company.com'
            }
        });

        if (existingEmployee) {
            console.log('Sample employee already exists');
            return;
        }

        // Create employee user
        const hashedPassword = await bcrypt.hash('employee123', 10);
        
        const employee = await prisma.user.create({
            data: {
                email: 'john.doe@company.com',
                username: 'johndoe',
                password: hashedPassword,
                name: 'John Doe',
                role: 'EMPLOYEE',
                employeeDetails: {
                    create: {
                        position: 'Software Engineer',
                        department: 'Engineering',
                        salary: 75000,
                        bankAccountNumber: 'ACC123456789',
                        bankName: 'Sample Bank',
                        taxId: 'TAX123456',
                        employeeCode: 'EMP001',
                        employmentType: 'FULL_TIME',
                        joinedAt: new Date(),
                        dateOfBirth: new Date('1995-05-15'),
                        phone: '1234567890',
                        address: '123 Main Street, City, Country',
                        emergencyContact: 'Jane Doe',
                        emergencyPhone: '9876543210',
                        gender: 'MALE'
                    }
                },
                leaveBalance: {
                    create: {
                        annual: 18,
                        sick: 12,
                        maternity: 180,
                        paternity: 30,
                        unpaid: 0
                    }
                }
            }
        });

        console.log('Sample employee created successfully:', employee.email);
    } catch (error) {
        console.error('Error creating sample employee:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createSampleEmployee(); 