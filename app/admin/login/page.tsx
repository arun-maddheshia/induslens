"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn, getSession } from "next-auth/react"
import Image from "next/image"
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        const session = await getSession()
        if (session) {
          router.push("/admin")
        } else {
          setError("Login failed. Please try again.")
        }
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logo.svg"
            alt="IndusLens"
            width={160}
            height={51}
            priority
          />
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-white/10 rounded-2xl px-8 py-10 shadow-2xl">
          <div className="mb-7">
            <h1 className="text-xl font-semibold text-white">Sign in</h1>
            <p className="text-sm text-zinc-400 mt-1">Admin dashboard access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="you@example.com"
                className="w-full rounded-lg bg-zinc-800 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent disabled:opacity-50 transition"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-zinc-800 border border-white/10 px-3.5 py-2.5 pr-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent disabled:opacity-50 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3.5 py-3 text-sm text-red-400">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
