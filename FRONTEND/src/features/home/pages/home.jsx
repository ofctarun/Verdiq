import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../auth/hook/useAuth'
import { useChat } from '../../chat/hooks/useChat'

const FEATURES = [
  {
    title: 'Real-time answers',
    description: 'Ask anything and get clear, up-to-date answers synthesized from the web in seconds.',
  },
  {
    title: 'Cited sources',
    description: 'Every answer links back to the sources it was drawn from, so you can verify it yourself.',
  },
  {
    title: 'Natural conversations',
    description: 'Follow up, refine, and dig deeper — context carries through the whole thread.',
  },
]

const Home = () => {
  const { user, loading } = useAuth()
  const chat = useChat()
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')

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
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 sm:px-10">
        <Link to="/home" className="text-lg font-semibold tracking-tight">
          Verdiq
        </Link>
        <nav className="flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-28 animate-pulse rounded-lg bg-neutral-100" />
          ) : user ? (
            <Link
              to="/"
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
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-20 sm:px-10">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Search less. <span className="text-neutral-400">Know more.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-neutral-500">
            Ask a question and get a direct, well-sourced answer — not a list of links to dig through.
          </p>
        </div>

        <form
          onSubmit={handleAsk}
          className="mx-auto mt-10 flex max-w-2xl items-center gap-2 rounded-2xl border border-neutral-200 p-2 shadow-sm transition focus-within:border-black"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything…"
            className="w-full bg-transparent px-3 py-2.5 text-sm text-black placeholder:text-neutral-400 outline-none"
          />
          <button
            type="submit"
            disabled={chat.sending || !question.trim()}
            className="shrink-0 rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {chat.sending ? 'Asking…' : 'Ask'}
          </button>
        </form>
        {chat.error && <p className="mt-3 text-center text-sm text-red-600">{chat.error}</p>}

        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-neutral-200 p-6 transition hover:border-black"
            >
              <h2 className="text-base font-semibold tracking-tight">{feature.title}</h2>
              <p className="mt-2 text-sm text-neutral-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-neutral-200 px-6 py-6 text-center text-sm text-neutral-400 sm:px-10">
        © {new Date().getFullYear()} Verdiq
      </footer>
    </div>
  )
}

export default Home
