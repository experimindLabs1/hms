import { prisma } from '@/lib/db';
import { comparePasswords, generateToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Login attempt:', { ...body, password: '***' });

    const { employeeId, password } = body;

    if (!employeeId || !password) {
      return NextResponse.json(
        { error: 'Employee ID and password are required' },
        { status: 400 }
      );
    }

    // Find user by employeeId
    const user = await prisma.user.findUnique({
      where: {
        employeeId: employeeId
      },
      select: {
        id: true,
        email: true,
        employeeId: true,
        password: true,
        role: true,
        name: true
      }
    });

    console.log('Found user:', user ? { ...user, password: '***' } : null);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValid = await comparePasswords(password, user.password);
    console.log('Password valid:', isValid);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate token with user data
    const token = await generateToken({
      id: user.id,
      email: user.email,
      employeeId: user.employeeId,
      role: user.role,
      name: user.name
    });

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        employeeId: user.employeeId,
        role: user.role,
        name: user.name
      }
    });

    // Set the token cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 