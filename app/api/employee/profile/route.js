import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                employeeDetails: true,
                leaveBalance: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        // Remove sensitive information
        const { password, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error('Error fetching employee profile:', error);
        return NextResponse.json(
            { error: 'Failed to fetch employee profile' },
            { status: 500 }
        );
    }
}