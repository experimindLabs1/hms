export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request) {
  try {
    const session = await auth(request);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        employeeDetails: {
          select: {
            employeeId: true,
            position: true,
            department: true,
          },
        },
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Error fetching profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await auth(request);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, ...profileData } = body;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        employeeDetails: {
          update: profileData,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        employeeDetails: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Error updating profile" },
      { status: 500 }
    );
  }
} 