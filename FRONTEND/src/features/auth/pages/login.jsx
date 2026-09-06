import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
// eslint-disable-next-line no-unused-vars -- used via JSX (motion.form, motion.div, motion.p, motion.button), not traced by this lint config
import { motion } from 'motion/react'
import { useAuth } from '../hook/useAuth'
import AuthLayout from '../components/AuthLayout'

const EASE = [0.16, 1, 0.3, 1]

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

const Login = () => {
  const [form, setForm] = useState({ email: 'user@gmail.com', password: 'user@123' })
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
    <AuthLayout
      heading="Welcome back"
      subheading="Sign in to continue to Verdiq"
      footer={
        <p className="mt-8 text-center text-sm text-neutral-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-black hover:underline">
            Create one
          </Link>
        </p>
      }
    >
      <motion.form
        onSubmit={handleSubmit}
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.08, delayChildren: 0.15 }}
        className="mt-8 space-y-5"
      >
        <motion.div variants={fieldVariants} transition={{ duration: 0.4, ease: EASE }}>
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
            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-black placeholder:text-neutral-400 outline-none transition focus:border-black"
          />
        </motion.div>

        <motion.div variants={fieldVariants} transition={{ duration: 0.4, ease: EASE }}>
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
            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-black placeholder:text-neutral-400 outline-none transition focus:border-black"
          />
        </motion.div>

        {error && (
          <motion.p
            variants={fieldVariants}
            transition={{ duration: 0.4, ease: EASE }}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          variants={fieldVariants}
          transition={{ duration: 0.4, ease: EASE }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </motion.button>
      </motion.form>
    </AuthLayout>
  )
}

export default Login
