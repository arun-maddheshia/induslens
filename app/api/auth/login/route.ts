import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getUserByEmail } from "@/lib/db"
import { signIn } from "@/lib/auth"
import { AuthError } from "next-auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Sign in with NextAuth
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      return NextResponse.json(
        {
          message: "Login successful",
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        },
        { status: 200 }
      )
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json(
          { error: "Authentication failed" },
          { status: 401 }
        )
      }
      throw error
    }

  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}