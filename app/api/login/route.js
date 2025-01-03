import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { signToken } from "@/utils/auth";

// Create a single instance of PrismaClient
const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { username, password, employeeId } = await request.json();
    console.log("Login attempt for:", { username, employeeId });

    let user;
    if (username) {
      user = await prisma.admin.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          password: true,
        },
      });
    } else if (employeeId) {
      user = await prisma.employee.findUnique({
        where: { employeeId },
        select: {
          id: true,
          employeeId: true,
          password: true,
        },
      });
    }

    if (!user) {
      console.log("User not found");
      return NextResponse.json(
        { error: "Invalid credentials" }, 
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Invalid password");
      return NextResponse.json(
        { error: "Invalid credentials" }, 
        { status: 401 }
      );
    }

    const token = await signToken({
      id: user.id,
      employeeId: user.employeeId || null,
      role: username ? "admin" : "employee",
    });

    // Create the response object
    const responseData = {
      success: true,
      message: "Login successful",
      token,
      role: username ? "admin" : "employee",
      employeeId: user.employeeId || null,
      id: user.id,
    };

    const response = NextResponse.json(responseData);

    // Set the cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 3600 // 1 hour
    });

    console.log("Login successful for:", username || employeeId);
    return response;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}
