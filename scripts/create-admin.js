const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: {
                email: 'admin@company.com'
            }
        });

        if (existingAdmin) {
            console.log('Admin already exists');
            return;
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        const admin = await prisma.user.create({
            data: {
                email: 'admin@company.com',
                username: 'admin',
                password: hashedPassword,
                name: 'System Admin',
                role: 'ADMIN',
                employeeDetails: {
                    create: {
                        position: 'System Administrator',
                        department: 'IT',
                        salary: 0,
                        bankAccountNumber: 'N/A',
                        bankName: 'N/A',
                        taxId: 'N/A',
                        employeeCode: 'ADMIN001',
                        joinedAt: new Date(),
                    }
                }
            }
        });

        console.log('Admin created successfully:', admin.email);
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin(); 