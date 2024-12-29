const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    // Default admin credentials
    const defaultAdmin = {
        username: 'admin',
        password: 'exp' // This will be hashed before saving
    };

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(defaultAdmin.password, 10);

        // Create admin user
        const admin = await prisma.admin.upsert({
            where: { username: defaultAdmin.username },
            update: {},
            create: {
                username: defaultAdmin.username,
                password: hashedPassword,
            },
        });

        console.log('Admin seeded:', admin);
    } catch (error) {
        console.error('Error seeding admin:', error);
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
