import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
// eslint-disable-next-line no-unused-vars -- used via JSX (motion.header, motion.p, ...), not traced by this lint config
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'motion/react'
import Lenis from 'lenis'
import { useAuth } from '../../auth/hook/useAuth'
import { useChat } from '../../chat/hooks/useChat'

const CAPABILITIES = [
  {
    icon: 'search',
    title: 'Web search',
    description: 'Pulls live results from the web when a question needs current information — not just what the model already knows.',
  },
  {
    icon: 'github',
    title: 'GitHub repo health',
    description: 'Connect your GitHub account and ask about any repository: stars, issue close ratio, contributor count, last commit — computed in real time.',
  },
  {
    icon: 'calculator',
    title: 'Calculator',
    description: 'Numeric questions get real computed answers, not LLM guesses — cost comparisons, ratios, sums, all evaluated precisely.',
  },
  {
    icon: 'document',
    title: 'PDF context',
    description: 'Attach a PDF to any conversation and ask about it directly. The agent reads the document, not just your prompt.',
  },
  {
    icon: 'persona',
    title: 'Custom persona',
    description: 'Set a system prompt per conversation to shape how the agent responds — terse, formal, expert-level, whatever fits.',
  },
]

const CAPABILITY_ICON_PATHS = {
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M16 16 L21 21" />
    </>
  ),
  github: (
    <>
      <circle cx="6" cy="6" r="2.1" />
      <circle cx="6" cy="18" r="2.1" />
      <circle cx="18" cy="13" r="2.1" />
      <path d="M6 8.1 V15.9" />
      <path d="M8.1 6 H13 a3 3 0 0 1 3 3 v1.9" />
    </>
  ),
  calculator: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 7 H16" />
      <path d="M8 12 H8.01 M12 12 H12.01 M16 12 H16.01 M8 16 H8.01 M12 16 H12.01 M16 16 H16.01" strokeLinecap="round" />
    </>
  ),
  document: (
    <>
      <path d="M7 3 H14 L18 7 V21 H7 Z" />
      <path d="M14 3 V7 H18" />
      <path d="M9.5 12 H14.5" />
      <path d="M9.5 15.5 H14.5" />
    </>
  ),
  persona: (
    <>
      <circle cx="12" cy="9" r="3.2" />
      <path d="M6 19 c0 -3.5 2.8 -5.5 6 -5.5 s6 2 6 5.5" />
    </>
  ),
}

const CapabilityIcon = ({ icon, className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {CAPABILITY_ICON_PATHS[icon]}
  </svg>
)

const WORKSPACE_THREADS = [
  {
    icon: 'github',
    label: 'GitHub',
    title: 'verdiq — repo health check',
    question: 'How healthy is facebook/react right now?',
    answer: 'Active and healthy: last commit 2 days ago, 94% of issues closed, 1,800+ contributors.',
    live: true,
  },
  {
    icon: 'search',
    label: 'Web search',
    title: 'verdiq — live research',
    question: "What's the latest on the EU AI Act enforcement?",
    answer: 'Prohibited-use rules took effect Feb 2025; general-purpose model obligations phase in August 2026.',
  },
  {
    icon: 'calculator',
    label: 'Calculator',
    title: 'verdiq — computed, not guessed',
    question: '$42,500 at 6% compounded annually for 3 years?',
    answer: '$50,613.27 — computed directly, not estimated from training data.',
  },
  {
    icon: 'document',
    label: 'PDF context',
    title: 'verdiq — reads your files',
    question: 'Summarize the termination clause on page 4.',
    answer: 'Either party may terminate with 30 days written notice; early termination fee waived after month 12.',
  },
]

const WorkspaceCard = ({ thread, cardRef }) => (
  <div
    ref={cardRef}
    className="flex w-75 shrink-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl sm:w-95"
  >
    <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-3">
      <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
      <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
      <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
      <span className="ml-2 truncate text-xs text-neutral-400">{thread.title}</span>
    </div>
    <div className="space-y-3 p-5 text-sm">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.7 }}
        variants={bubbleReveal}
        className="flex justify-end"
      >
        <p className="max-w-[85%] rounded-2xl bg-black px-4 py-2.5 text-white">{thread.question}</p>
      </motion.div>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.7 }}
        variants={bubbleReveal}
        transition={{ delay: 0.25 }}
        className="flex justify-start"
      >
        <div className="max-w-[90%]">
          <span className="mb-1 inline-flex items-center gap-1 rounded-full border border-neutral-200 px-2 py-0.5 text-[10px] text-neutral-500">
            <CapabilityIcon icon={thread.icon} className="h-3 w-3" />
            {thread.label}
          </span>
          <p className="rounded-2xl border border-neutral-200 px-4 py-2.5 text-black">
            {thread.answer}
            {thread.live && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 1.1 }}
                className="ml-1 inline-block"
              >
                ▍
              </motion.span>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  </div>
)

const WorkspaceDot = ({ progress, index, total }) => {
  const start = index / total
  const mid = (index + 0.5) / total
  const end = (index + 1) / total
  const scale = useTransform(progress, [start, mid, end], [1, 1.7, 1])
  const opacity = useTransform(progress, [start, mid, end], [0.3, 1, 0.3])
  return <motion.span style={{ scale, opacity }} className="h-1.5 w-1.5 rounded-full bg-black" />
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)

  useEffect(() => {
    const media = window.matchMedia(query)
    const handleChange = (e) => setMatches(e.matches)
    setMatches(media.matches)
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [query])

  return matches
}

const FOOTER_COLUMNS = [
  {
    heading: 'PRODUCT',
    links: [
      { label: 'Capabilities', to: '#capabilities' },
      { label: 'Workspace', to: '#workspace' },
      { label: 'Get started', to: '/register' },
    ],
  },
  {
    heading: 'ACCOUNT',
    links: [
      { label: 'Sign in', to: '/login' },
      { label: 'Create account', to: '/register' },
    ],
  },
  {
    heading: 'PROJECT',
    links: [
      { label: 'GitHub repo', to: 'https://github.com/ofctarun/Verdiq', external: true },
      { label: 'Report an issue', to: 'https://github.com/ofctarun/Verdiq/issues', external: true },
    ],
  },
]

const HERO_WORDS = ['Ask', 'anything.', 'Get', 'answers,', 'not']
const SCRAMBLE_WORD = 'links.'
const SCRAMBLE_CHARS = 'abcdefghijklmnopqrstuvwxyz'

const NAV_LINKS = [
  { label: 'Capabilities', to: '#capabilities' },
  { label: 'Workspace', to: '#workspace' },
  { label: 'GitHub', to: 'https://github.com/ofctarun/Verdiq', external: true },
]

const EYEBROW_TEXT = 'An AI agent that actually does things'

// Module-level (not persisted) — resets on a real page load/refresh since the JS
// bundle re-executes, but survives client-side route navigation back to this page.
let introHasPlayed = false

function useTypewriter(text, { speed = 32, startDelay = 0, start = true } = {}) {
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!start) return
    let i = 0
    let intervalId
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        i += 1
        setOutput(text.slice(0, i))
        if (i >= text.length) clearInterval(intervalId)
      }, speed)
    }, startDelay)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [text, speed, startDelay, start])

  return output
}

function useScrambleText(finalText, { duration = 700, startDelay = 0, scrambleInterval = 55, start = true } = {}) {
  const scramble = () =>
    finalText.replace(/[a-z]/gi, () => SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)])

  const [display, setDisplay] = useState(scramble)

  useEffect(() => {
    if (!start) return
    let frameId
    let startTime
    let lastScrambleTime = 0

    const timeoutId = setTimeout(() => {
      const tick = (now) => {
        if (!startTime) startTime = now
        const progress = Math.min(1, (now - startTime) / duration)
        const revealCount = Math.floor(progress * finalText.length)
        const shouldReRandomize = now - lastScrambleTime > scrambleInterval
        if (shouldReRandomize) lastScrambleTime = now

        setDisplay((prev) =>
          finalText
            .split('')
            .map((ch, idx) => {
              if (idx < revealCount || !/[a-z]/i.test(ch)) return ch
              if (!shouldReRandomize && prev[idx]) return prev[idx]
              return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
            })
            .join('')
        )

        if (progress < 1) {
          frameId = requestAnimationFrame(tick)
        } else {
          setDisplay(finalText)
        }
      }
      frameId = requestAnimationFrame(tick)
    }, startDelay)

    return () => {
      clearTimeout(timeoutId)
      cancelAnimationFrame(frameId)
    }
  }, [finalText, duration, startDelay, scrambleInterval, start])

  return display
}

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0 },
}

const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.9 } },
}

const EASE = [0.16, 1, 0.3, 1]

const capabilityItem = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const capabilityIconReveal = {
  hidden: { opacity: 0, scale: 0.6, rotate: -8 },
  show: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.5, ease: EASE } },
}

const capabilityTextReveal = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
}

const workspaceFadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const bubbleReveal = {
  hidden: { opacity: 0, y: 14, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: EASE } },
}

const FooterLink = ({ link }) =>
  link.external ? (
    <a
      href={link.to}
      target="_blank"
      rel="noreferrer"
      className="block text-sm text-neutral-400 transition hover:text-white"
    >
      {link.label}
    </a>
  ) : (
    <Link to={link.to} className="block text-sm text-neutral-400 transition hover:text-white">
      {link.label}
    </Link>
  )

const MagneticButton = ({ children, to }) => {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.3 })
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.3 })

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left - rect.width / 2) * 0.4)
    y.set((e.clientY - rect.top - rect.height / 2) * 0.4)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.94 }}
      className="inline-block"
    >
      <Link
        to={to}
        className="inline-block rounded-full bg-black px-8 py-4 text-base font-medium text-white transition hover:bg-neutral-800"
      >
        {children}
      </Link>
    </motion.div>
  )
}

const Home = () => {
  const { user, loading } = useAuth()
  const chat = useChat()
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')
  const [navHidden, setNavHidden] = useState(false)
  const [introLoading, setIntroLoading] = useState(() => !introHasPlayed)
  const [loadProgress, setLoadProgress] = useState(0)
  const typedEyebrow = useTypewriter(EYEBROW_TEXT, { speed: 26, startDelay: 0, start: !introLoading })
  const scrambledLastWord = useScrambleText(SCRAMBLE_WORD, { duration: 650, startDelay: 1350, start: !introLoading })

  const footerRef = useRef(null)
  const workspaceRef = useRef(null)
  const workspaceTrackRef = useRef(null)
  const firstThreadCardRef = useRef(null)
  const lastThreadCardRef = useRef(null)
  const heroRef = useRef(null)
  const capabilitiesRef = useRef(null)

  const { scrollYProgress: pageProgress } = useScroll()
  const blobY = useTransform(pageProgress, [0, 0.2], [0, 140])

  const spotX = useMotionValue(0)
  const spotY = useMotionValue(0)
  const spotlightX = useSpring(spotX, { stiffness: 50, damping: 20, mass: 0.5 })
  const spotlightY = useSpring(spotY, { stiffness: 50, damping: 20, mass: 0.5 })

  const handleHeroMouseMove = (e) => {
    const rect = heroRef.current.getBoundingClientRect()
    spotX.set(e.clientX - rect.left)
    spotY.set(e.clientY - rect.top)
  }

  const { scrollYProgress: capabilitiesProgress } = useScroll({ target: capabilitiesRef })
  const capabilitiesLine = useTransform(capabilitiesProgress, [0.1, 0.9], [0, 1])
  const capabilitiesDotTop = useTransform(capabilitiesLine, (v) => `${v * 100}%`)

  const isDesktop = useMediaQuery('(min-width: 768px)')
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const enablePin = isDesktop && !prefersReducedMotion

  const { scrollYProgress: workspaceTrackProgress } = useScroll({
    target: workspaceRef,
    offset: ['start start', 'end end'],
  })

  // Measured in px so the first card starts centered in the viewport and the
  // last card ends centered too — no left-aligned start, no overshoot past
  // the last card that would leave dead space before the next section.
  const [trackOffsets, setTrackOffsets] = useState({ start: 0, end: 0 })

  useEffect(() => {
    if (!enablePin) return

    function measure() {
      const first = firstThreadCardRef.current
      const last = lastThreadCardRef.current
      if (!first || !last) return

      const viewportWidth = window.innerWidth
      const firstCenter = first.offsetLeft + first.offsetWidth / 2
      const lastCenter = last.offsetLeft + last.offsetWidth / 2

      setTrackOffsets({
        start: viewportWidth / 2 - firstCenter,
        end: viewportWidth / 2 - lastCenter,
      })
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [enablePin])

  const trackX = useTransform(
    workspaceTrackProgress,
    (p) => trackOffsets.start + (trackOffsets.end - trackOffsets.start) * p
  )
  const workspaceHintOpacity = useTransform(workspaceTrackProgress, [0, 0.12], [1, 0])
  const workspaceGlowY = useTransform(workspaceTrackProgress, [0, 1], [-40, 40])

  useEffect(() => {
    if (!introLoading) return

    const LOADER_DURATION = 1500
    let frameId
    let startTime

    function tick(now) {
      if (!startTime) startTime = now
      const pct = Math.min(100, Math.round(((now - startTime) / LOADER_DURATION) * 100))
      setLoadProgress(pct)
      if (pct < 100) {
        frameId = requestAnimationFrame(tick)
      } else {
        setTimeout(() => {
          introHasPlayed = true
          setIntroLoading(false)
        }, 300)
      }
    }
    frameId = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frameId)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally runs once per mount based on initial introLoading value
  }, [])

  useEffect(() => {
    document.body.style.overflow = introLoading ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [introLoading])

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    let rafId
    function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    const el = footerRef.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => setNavHidden(entry.intersectionRatio > 0.1), {
      threshold: [0, 0.1, 1],
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleAsk = (e) => {
    e.preventDefault()
    const message = question.trim()
    if (!message || chat.sending) return

    if (!user) {
      navigate('/login')
      return
    }

    chat.handleStartNewChat()
    setQuestion('')
    chat.handleSendMessage(message)
    navigate('/dashboard')
  }

  return (
    <div className="bg-white text-black">
      <AnimatePresence>
        {introLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: EASE } }}
            className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-black text-white"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-xl font-black text-black"
            >
              V
            </motion.div>
            <p className="mt-7 font-mono text-sm tracking-widest text-neutral-400">{loadProgress}%</p>
            <div className="mt-4 h-px w-40 overflow-hidden bg-white/15">
              <motion.div
                className="h-full bg-white"
                style={{ width: `${loadProgress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: navHidden ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        className={`fixed inset-x-0 top-0 z-50 grid grid-cols-[1fr_auto_1fr] items-center border-b border-neutral-200 bg-white/80 px-6 py-4 backdrop-blur-md sm:px-10 ${
          navHidden ? 'pointer-events-none' : ''
        }`}
      >
        <Link to="/home" className="justify-self-start text-lg font-bold tracking-tight">
          Verdiq
        </Link>

        <nav className="col-start-2 hidden items-center gap-8 text-sm font-medium text-neutral-600 md:flex">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.to}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-black"
              >
                {link.label}
              </a>
            ) : (
              <Link key={link.label} to={link.to} className="transition hover:text-black">
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="col-start-3 flex items-center justify-self-end gap-3">
          {loading ? (
            <div className="h-9 w-28 animate-pulse rounded-lg bg-neutral-100" />
          ) : user ? (
            <Link
              to="/dashboard"
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Go to chats
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-black transition hover:bg-neutral-100"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </motion.header>

      <section
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-20 sm:px-10"
      >
        <motion.div
          style={{ y: blobY }}
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-140 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.07),transparent_60%)]"
        />
        <motion.div
          style={{ left: spotlightX, top: spotlightY, translateX: '-50%', translateY: '-50%' }}
          className="pointer-events-none absolute -z-10 hidden h-[500px] w-[500px] rounded-full bg-black/[0.035] blur-3xl sm:block"
        />

        <div className="relative z-10 mx-auto max-w-7xl text-center">
          {!introLoading && (
          <motion.svg
            width="44"
            height="44"
            viewBox="0 0 44 44"
            fill="none"
            initial={{ opacity: 0, rotate: -20 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ delay: 2.1, duration: 0.5, ease: EASE }}
            className="pointer-events-none absolute -top-3 right-[6%] hidden sm:block lg:right-[12%]"
          >
            <motion.path
              d="M22 3 L26 18 L41 22 L26 26 L22 41 L18 26 L3 22 L18 18 Z"
              stroke="black"
              strokeWidth="1.6"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 2.1, duration: 0.6, ease: EASE }}
            />
          </motion.svg>
          )}

          <p className="font-mono text-sm font-medium tracking-widest text-neutral-400">
            {typedEyebrow}
            <span className="animate-caret-blink">▍</span>
          </p>

          {!introLoading && (
          <motion.h1
            initial="hidden"
            animate="show"
            variants={heroContainer}
            className="mt-6 flex flex-col items-center gap-y-1 text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl"
          >
            <div className="flex flex-wrap justify-center gap-x-4">
              {HERO_WORDS.slice(0, 3).map((word) => (
                <motion.span key={word} variants={fadeUp} transition={{ duration: 0.6, ease: EASE }}>
                  {word}
                </motion.span>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-x-4">
              {HERO_WORDS.slice(3).map((word) => (
                <motion.span
                  key={word}
                  variants={fadeUp}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="text-neutral-400"
                >
                  {word}
                </motion.span>
              ))}
              <motion.span
                variants={fadeUp}
                transition={{ duration: 0.6, ease: EASE }}
                className="relative inline-block text-left font-mono text-neutral-400"
              >
                <span aria-hidden="true" className="invisible">
                  {SCRAMBLE_WORD}
                </span>
                <span className="absolute inset-0">{scrambledLastWord}</span>
              </motion.span>
            </div>
          </motion.h1>
          )}

          {!introLoading && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.1, duration: 0.5 }}
            className="mx-auto mt-8 max-w-2xl text-lg text-neutral-500 sm:text-xl"
          >
            Verdiq searches the web, reads your GitHub repos, computes real numbers, and remembers
            the documents you give it — all in one conversation.
          </motion.p>
          )}

          {!introLoading && (
          <motion.form
            onSubmit={handleAsk}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.35, duration: 0.5 }}
            className="mx-auto mt-10 flex max-w-2xl items-center gap-2 rounded-2xl border border-neutral-200 p-2 shadow-sm transition focus-within:border-black"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything…"
              className="w-full bg-transparent px-4 py-3 text-base text-black placeholder:text-neutral-400 outline-none"
            />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={chat.sending || !question.trim()}
              className="shrink-0 rounded-xl bg-black px-6 py-3 text-base font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {chat.sending ? 'Asking…' : 'Ask'}
            </motion.button>
          </motion.form>
          )}
          {chat.error && <p className="mt-3 text-center text-sm text-red-600">{chat.error}</p>}
        </div>
      </section>

      <section
        id="capabilities"
        ref={capabilitiesRef}
        className="flex min-h-screen flex-col items-center justify-center border-t border-neutral-200 px-6 py-24 sm:px-10"
      >
        <div className="mx-auto w-full max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-sm font-medium tracking-[0.25em] text-neutral-400 uppercase">Capabilities</p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              One agent, five real tools
            </h2>
          </motion.div>

          <div className="relative mt-24">
            <svg
              className="pointer-events-none absolute top-2 left-7 hidden h-[calc(100%-1rem)] w-px sm:block"
              viewBox="0 0 2 1000"
              preserveAspectRatio="none"
            >
              <motion.line x1="1" y1="0" x2="1" y2="1000" stroke="#d4d4d4" strokeWidth="2" />
              <motion.line
                x1="1"
                y1="0"
                x2="1"
                y2="1000"
                stroke="black"
                strokeWidth="2"
                strokeDasharray="2 9"
                strokeLinecap="round"
                style={{ pathLength: capabilitiesLine }}
              />
            </svg>
            <motion.span
              style={{ top: capabilitiesDotTop }}
              className="pointer-events-none absolute left-7 hidden h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black shadow-[0_0_0_4px_white] sm:block"
            />

            <div className="space-y-12 sm:pl-20">
              {CAPABILITIES.map((capability, i) => (
                <motion.div
                  key={capability.title}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.5 }}
                  variants={capabilityItem}
                  className="group flex flex-col gap-4 rounded-2xl p-3 transition-colors sm:flex-row sm:items-start sm:gap-7 sm:p-4 sm:hover:bg-neutral-50"
                >
                  <motion.div
                    variants={capabilityIconReveal}
                    initial={{ borderColor: '#e5e5e5', color: '#a3a3a3' }}
                    whileInView={{ borderColor: '#000000', color: '#000000' }}
                    viewport={{ amount: 0.6, once: false }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border bg-white"
                  >
                    <CapabilityIcon icon={capability.icon} className="h-6 w-6" />
                  </motion.div>

                  <div>
                    <motion.span
                      variants={capabilityTextReveal}
                      className="font-mono text-xs tracking-widest text-neutral-400"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </motion.span>
                    <motion.h3
                      variants={capabilityTextReveal}
                      className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl"
                    >
                      {capability.title}
                    </motion.h3>
                    <motion.p
                      variants={capabilityTextReveal}
                      className="mt-2 max-w-xl text-base text-neutral-500 sm:text-lg"
                    >
                      {capability.description}
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="workspace"
        ref={workspaceRef}
        className={`relative border-t border-neutral-200 bg-neutral-50 ${enablePin ? 'h-[280vh]' : 'py-20'}`}
      >
        <div
          className={
            enablePin
              ? 'sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6 sm:px-10'
              : 'relative flex flex-col items-center overflow-hidden px-6 sm:px-10'
          }
        >
          <motion.div
            style={{ y: workspaceGlowY }}
            className="pointer-events-none absolute top-1/2 left-1/2 -z-0 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.05),transparent_70%)] blur-2xl"
          />

          {/* Artistic marks — decorative, monochrome, never interactive */}
          <span className="pointer-events-none absolute top-[12%] left-[6%] hidden text-3xl text-neutral-200 md:block">
            +
          </span>
          <span className="pointer-events-none absolute right-[9%] bottom-[16%] hidden text-3xl text-neutral-200 md:block">
            +
          </span>
          {enablePin && (
            <div className="pointer-events-none absolute top-[16%] right-[7%] hidden -rotate-3 flex-col items-end gap-1 md:flex">
              <span className="rounded-full border border-neutral-300 bg-white px-3 py-1 font-mono text-[11px] tracking-wide text-neutral-500">
                {WORKSPACE_THREADS.length} live tool calls
              </span>
              <svg width="70" height="46" viewBox="0 0 70 46" className="text-neutral-300">
                <defs>
                  <marker id="workspaceArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" />
                  </marker>
                </defs>
                <path
                  d="M64 4 C 40 4, 18 16, 6 42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeDasharray="3 4"
                  markerEnd="url(#workspaceArrow)"
                />
              </svg>
            </div>
          )}

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.6 }}
            variants={capabilityItem}
            className="relative z-10 mx-auto max-w-3xl text-center"
          >
            <motion.p
              variants={workspaceFadeUp}
              className="relative inline-block text-sm font-medium tracking-[0.25em] text-neutral-400 uppercase"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="pointer-events-none absolute top-1/2 -left-7 hidden h-4 w-4 -translate-y-1/2 rotate-12 text-neutral-300 sm:block"
              >
                <path d="M12 2 V22 M4 7 L20 17 M20 7 L4 17" />
              </svg>
              The workspace
            </motion.p>
            <motion.h2
              variants={workspaceFadeUp}
              className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Every thread keeps its context
            </motion.h2>
            <motion.p variants={workspaceFadeUp} className="mx-auto mt-6 max-w-xl text-lg text-neutral-600">
              Follow up, branch off, come back tomorrow. Verdiq tracks the conversation, the tools
              it used, and the documents you&apos;ve shared — so you never repeat yourself.
            </motion.p>
          </motion.div>

          {enablePin ? (
            <>
              <motion.div ref={workspaceTrackRef} style={{ x: trackX }} className="relative z-10 mt-14 flex gap-8">
                {WORKSPACE_THREADS.map((thread, i) => (
                  <WorkspaceCard
                    key={thread.title}
                    thread={thread}
                    cardRef={
                      i === 0
                        ? firstThreadCardRef
                        : i === WORKSPACE_THREADS.length - 1
                          ? lastThreadCardRef
                          : undefined
                    }
                  />
                ))}
              </motion.div>

              <div className="relative z-10 mt-8 flex items-center gap-2">
                {WORKSPACE_THREADS.map((thread, i) => (
                  <WorkspaceDot
                    key={thread.title}
                    progress={workspaceTrackProgress}
                    index={i}
                    total={WORKSPACE_THREADS.length}
                  />
                ))}
              </div>

              <motion.div
                style={{ opacity: workspaceHintOpacity }}
                className="pointer-events-none absolute bottom-10 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 font-mono text-xs tracking-wide text-neutral-500 md:flex"
              >
                <motion.span
                  animate={{ x: [0, 6, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  →
                </motion.span>
                scroll to explore threads
              </motion.div>
            </>
          ) : (
            <div className="relative z-10 mt-12 flex w-full snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {WORKSPACE_THREADS.map((thread) => (
                <div key={thread.title} className="snap-center">
                  <WorkspaceCard thread={thread} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6 }}
        className="flex min-h-screen flex-col items-center justify-center border-t border-neutral-200 px-6 sm:px-10"
      >
        <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-neutral-200 px-8 py-16 text-center sm:px-16 sm:py-20">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(0,0,0,0.05),transparent_70%)]" />

          <h2 className="text-4xl font-extrabold tracking-tight sm:text-6xl">Ready when you are</h2>
          <p className="mx-auto mt-4 max-w-md text-lg text-neutral-500">
            No setup, no credit card. Ask your first question in under a minute.
          </p>
          <div className="relative mt-10 inline-block">
            <svg viewBox="0 0 300 110" preserveAspectRatio="none" className="pointer-events-none absolute -inset-x-6 -inset-y-5">
              <motion.path
                d="M 18 55 C 14 18, 90 4, 150 6 C 225 8, 288 22, 282 56 C 278 92, 205 104, 150 102 C 70 100, 16 88, 18 55 Z"
                fill="none"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
              />
            </svg>
            <MagneticButton to={user ? '/dashboard' : '/register'}>
              {user ? 'Go to chats' : 'Get started for free'}
            </MagneticButton>
          </div>

          <div className="mx-auto mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-neutral-100 pt-8 text-sm text-neutral-500">
            <span className="flex items-center gap-2">
              <span className="text-black">✓</span> 50 free messages a day
            </span>
            <span className="flex items-center gap-2">
              <span className="text-black">✓</span> Web search, GitHub & calculator tools
            </span>
            <span className="flex items-center gap-2">
              <span className="text-black">✓</span> No credit card required
            </span>
          </div>
        </div>
      </motion.section>

      <footer ref={footerRef} className="flex min-h-screen flex-col justify-between bg-black px-6 py-12 text-white sm:px-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="flex flex-1 items-center justify-center select-none"
        >
          <h2 className="w-full text-center text-[24vw] leading-none font-black tracking-tighter sm:text-[19vw]">
            <span className="text-white">Ver</span>
            <span className="text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.25)]">diq</span>
          </h2>
        </motion.div>

        <div className="flex flex-col gap-10 border-t border-white/10 pt-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white font-black text-black">
              V
            </div>
            <a
              href="https://github.com/ofctarun/Verdiq"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-neutral-400 transition hover:text-white"
            >
              <svg viewBox="0 0 16 16" className="h-5 w-5 fill-current">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
              </svg>
              github.com/ofctarun/Verdiq
            </a>
            <p className="mt-6 max-w-xs text-base text-neutral-500">
              An AI research agent that searches the web, reads GitHub repos, computes real
              numbers, and reads the documents you give it.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-16">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.heading}>
                <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500">{column.heading}</p>
                <div className="mt-4 flex flex-col gap-3">
                  {column.links.map((link) => (
                    <FooterLink key={link.label} link={link} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-neutral-500">© {new Date().getFullYear()} Verdiq</p>
      </footer>
    </div>
  )
}

export default Home
