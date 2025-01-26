export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

export async function GET(request) {
    try {
        const user = await authenticateUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userProfile = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
                employeeDetails: true,
                leaveBalance: true
            }
        });

        if (!userProfile) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        // Remove sensitive information
        const { password, ...userWithoutPassword } = userProfile;
        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error('Error fetching employee profile:', error);
        return NextResponse.json(
            { error: 'Failed to fetch employee profile' },
            { status: 500 }
        );
    }
}