import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../auth/hook/useAuth'
import { useChat } from '../hooks/useChat'

const Dashboard = () => {
  const { user, loading, handleGetMe, handleLogout } = useAuth()
  const [checking, setChecking] = useState(true)
  const navigate = useNavigate()
  const chat = useChat();
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    if (user) {
      setChecking(false)
      return
    }

    handleGetMe().then((success) => {
      setChecking(false)
      if (!success) {
        navigate('/login')
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    chat.initializeSocketConnection()
  }, [])

  useEffect(() => {
    if (!checking) {
      chat.handleGetChats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checking])

  const messages = chat.currentChatId ? chat.messagesByChat[chat.currentChatId] || [] : []

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, chat.sending])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const message = input.trim()
    if (!message || chat.sending) return

    setInput('')
    await chat.handleSendMessage(message)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  if (checking || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-neutral-500">Loading…</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white text-black">
      <aside className="flex w-64 flex-col border-r border-neutral-200">
        <div className="border-b border-neutral-200 p-4">
          <Link to="/home" className="text-lg font-semibold tracking-tight">
            Perplexity
          </Link>
          <button
            type="button"
            onClick={chat.handleStartNewChat}
            className="mt-4 w-full rounded-lg border border-neutral-200 py-2 text-sm font-medium transition hover:border-black"
          >
            + New chat
          </button>
        </div>

        <div className="scrollbar-hide flex-1 overflow-y-auto p-2">
          {chat.chats.length === 0 && (
            <p className="px-2 py-4 text-center text-sm text-neutral-400">No conversations yet</p>
          )}
          {chat.chats.map((c) => (
            <div
              key={c._id}
              className={`group flex items-center justify-between gap-1 rounded-lg px-3 py-2 text-sm transition ${
                c._id === chat.currentChatId ? 'bg-neutral-100 font-medium' : 'hover:bg-neutral-50'
              }`}
            >
              <button
                type="button"
                onClick={() => chat.handleSelectChat(c._id)}
                className="flex-1 truncate text-left text-black"
              >
                {c.title}
              </button>
              <button
                type="button"
                onClick={() => chat.handleDeleteChat(c._id)}
                className="shrink-0 text-xs text-neutral-400 opacity-0 transition hover:text-red-600 group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-neutral-200 p-4 text-sm text-neutral-500">
          <span>{user?.username}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs font-medium text-neutral-500 transition hover:text-black"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        <header className="flex items-center border-b border-neutral-200 px-6 py-4">
          <h1 className="text-sm font-medium text-neutral-600">
            {chat.chats.find((c) => c._id === chat.currentChatId)?.title || 'New chat'}
          </h1>
        </header>

        <div className="scrollbar-hide flex-1 overflow-y-auto px-6 py-6">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <h2 className="text-2xl font-semibold tracking-tight">Ask anything</h2>
              <p className="mt-2 max-w-sm text-sm text-neutral-500">
                Start a new conversation — your question becomes the title of this chat.
              </p>
            </div>
          ) : (
            <div className="mx-auto max-w-2xl space-y-4">
              {messages.map((message, i) => (
                <div key={message._id || i} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <p
                    className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                      message.role === 'user'
                        ? 'bg-black text-white'
                        : 'border border-neutral-200 text-black'
                    }`}
                  >
                    {message.content}
                  </p>
                </div>
              ))}

              {chat.sending && (
                <div className="flex justify-start">
                  <p className="rounded-2xl border border-neutral-200 px-4 py-2.5 text-sm text-neutral-400">
                    Thinking…
                  </p>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {chat.error && (
          <p className="px-6 pb-2 text-center text-sm text-red-600">{chat.error}</p>
        )}

        <form onSubmit={handleSubmit} className="border-t border-neutral-200 p-4">
          <div className="mx-auto flex max-w-2xl items-end gap-2 rounded-2xl border border-neutral-200 p-2 transition focus-within:border-black">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything…"
              rows={1}
              className="w-full resize-none bg-transparent px-3 py-2 text-sm text-black placeholder:text-neutral-400 outline-none"
            />
            <button
              type="submit"
              disabled={chat.sending || !input.trim()}
              className="shrink-0 rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default Dashboard
