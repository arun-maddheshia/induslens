import bcrypt from "bcryptjs"
import { db } from "../lib/db"

async function createAdminUser() {
  try {
    const email = process.argv[2]
    const password = process.argv[3]
    const name = process.argv[4] || "Admin User"

    if (!email || !password) {
      console.error("Usage: npx tsx scripts/create-admin.ts <email> <password> [name]")
      console.error("Example: npx tsx scripts/create-admin.ts admin@example.com password123 'Admin User'")
      process.exit(1)
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.error(`User with email ${email} already exists`)
      process.exit(1)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      }
    })
  } catch (error) {
    console.error("Error creating admin user:", error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

createAdminUser()