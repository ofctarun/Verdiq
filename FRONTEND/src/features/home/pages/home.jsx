import { Link } from 'react-router'

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
  return (
    <div className="min-h-screen bg-white text-black">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 sm:px-10">
        <span className="text-lg font-semibold tracking-tight">Perplexity</span>
        <nav className="flex items-center gap-3">
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

        <form className="mx-auto mt-10 flex max-w-2xl items-center gap-2 rounded-2xl border border-neutral-200 p-2 shadow-sm transition focus-within:border-black">
          <input
            type="text"
            placeholder="Ask anything…"
            className="w-full bg-transparent px-3 py-2.5 text-sm text-black placeholder:text-neutral-400 outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Ask
          </button>
        </form>

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
        © {new Date().getFullYear()} Perplexity
      </footer>
    </div>
  )
}

export default Home
