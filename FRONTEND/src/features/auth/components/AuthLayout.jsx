import { Link } from 'react-router'
// eslint-disable-next-line no-unused-vars -- used via JSX (motion.h2, motion.p, motion.path), not traced by this lint config
import { motion } from 'motion/react'

const EASE = [0.16, 1, 0.3, 1]

const AuthLayout = ({ heading, subheading, children, footer }) => (
  <div className="flex min-h-screen bg-white text-black">
    <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-black p-12 text-white lg:flex">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.08),transparent_55%)]" />

      <svg width="40" height="40" viewBox="0 0 44 44" fill="none" className="pointer-events-none absolute top-12 right-12 opacity-40">
        <motion.path
          d="M22 3 L26 18 L41 22 L26 26 L22 41 L18 26 L3 22 L18 18 Z"
          stroke="white"
          strokeWidth="1.4"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.6, duration: 0.8, ease: EASE }}
        />
      </svg>

      <Link to="/home" className="text-lg font-semibold tracking-tight">
        Verdiq
      </Link>

      <div>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-4xl font-semibold tracking-tight"
        >
          Ask anything.
          <br />
          Get answers, not links.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
          className="mt-4 max-w-sm text-neutral-400"
        >
          Web search, GitHub repo health, a real calculator, and PDF context — one agent, one
          conversation.
        </motion.p>
      </div>

      <p className="text-sm text-neutral-500">© {new Date().getFullYear()} Verdiq</p>
    </div>

    <div className="flex w-full flex-col items-center justify-center px-6 py-16 lg:w-1/2">
      <Link to="/home" className="mb-10 text-lg font-semibold tracking-tight lg:hidden">
        Verdiq
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="w-full max-w-sm"
      >
        <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
        <p className="mt-1 text-sm text-neutral-500">{subheading}</p>

        {children}

        {footer}
      </motion.div>
    </div>
  </div>
)

export default AuthLayout
