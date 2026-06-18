import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hook/useAuth'

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const { loading, error, handleLogin } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await handleLogin(form)
    if (success) {
      navigate('/dashboard')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-black">Welcome back</h1>
        <p className="mt-1 text-sm text-neutral-500">Sign in to continue to Perplexity</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-black">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm text-black placeholder:text-neutral-400 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-black">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm text-black placeholder:text-neutral-400 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-black hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
