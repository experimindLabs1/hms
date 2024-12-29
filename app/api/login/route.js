import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { signToken } from "@/utils/auth";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { username, password, employeeId } = await request.json();

    let user;
    if (username) {
      user = await prisma.admin.findUnique({
        where: { username },
      });
    } else if (employeeId) {
      user = await prisma.employee.findUnique({
        where: { employeeId },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signToken({
      id: user.id,
      employeeId: user.employeeId || null,
      role: username ? "admin" : "employee",
    });

    const response = NextResponse.json({
      message: "Login successful",
      token: token,
      role: username ? "admin" : "employee",
      employeeId: user.employeeId || null,
      id: user.id
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 3600
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);
    await prisma.$disconnect();
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
