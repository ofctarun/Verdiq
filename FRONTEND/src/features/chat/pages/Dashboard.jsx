import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../auth/hook/useAuth'
import { useChat } from '../hooks/useChat'
import { useGithub } from '../../github/hooks/useGithub'

const TOOL_OPTIONS = [
  { key: 'web_search', label: 'Web Search', emoji: '🔍' },
  { key: 'github', label: 'GitHub', emoji: '🐙' },
  { key: 'calculator', label: 'Calculator', emoji: '🧮' },
]

const TOOL_META = TOOL_OPTIONS.reduce((acc, t) => {
  acc[t.key] = t
  return acc
}, {})

const Dashboard = () => {
  const { user, loading, handleGetMe, handleLogout } = useAuth()
  const [checking, setChecking] = useState(true)
  const navigate = useNavigate()
  const chat = useChat();
  const github = useGithub();
  const [input, setInput] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [personaDraft, setPersonaDraft] = useState('')
  const [githubNotice, setGithubNotice] = useState('')
  const [uploading, setUploading] = useState(false)
  const bottomRef = useRef(null)
  const fileInputRef = useRef(null)

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
      github.handleRefreshStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checking])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const githubParam = params.get('github')
    if (!githubParam) return

    if (githubParam === 'connected') {
      github.handleRefreshStatus()
      setGithubNotice('GitHub connected successfully.')
    } else if (githubParam === 'error') {
      setGithubNotice('Failed to connect GitHub. Please try again.')
    }

    navigate('/', { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const currentChat = chat.chats.find((c) => c._id === chat.currentChatId)
  const messages = chat.currentChatId ? chat.messagesByChat[chat.currentChatId] || [] : chat.draftMessages

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, chat.sending])

  useEffect(() => {
    setPersonaDraft(currentChat?.systemPrompt || '')
    setShowSettings(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.currentChatId])

  const handleSubmit = (e) => {
    e.preventDefault()
    const message = input.trim()
    if (!message || chat.sending) return

    setInput('')
    chat.handleSendMessage(message)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleToggleTool = (toolKey) => {
    if (!currentChat) return

    if (toolKey === 'github' && !github.github.connected) {
      github.connect()
      return
    }

    const active = currentChat.activeTools || []
    const next = active.includes(toolKey)
      ? active.filter((t) => t !== toolKey)
      : [...active, toolKey]

    chat.handleUpdateChatConfig(currentChat._id, { activeTools: next })
  }

  const handleSavePersona = () => {
    if (!currentChat) return
    chat.handleUpdateChatConfig(currentChat._id, { systemPrompt: personaDraft })
    setShowSettings(false)
  }

  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !currentChat) return

    setUploading(true)
    await chat.handleUploadAttachment(currentChat._id, file)
    setUploading(false)
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
            Verdiq
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

        <div className="border-t border-neutral-200 p-4 text-sm">
          {github.github.connected ? (
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">🐙 @{github.github.username}</span>
              <button
                type="button"
                onClick={github.handleDisconnect}
                className="text-xs font-medium text-neutral-400 transition hover:text-red-600"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={github.connect}
              className="w-full rounded-lg border border-neutral-200 py-1.5 text-xs font-medium transition hover:border-black"
            >
              🐙 Connect GitHub
            </button>
          )}

          <div className="mt-3 flex items-center justify-between">
            <span className="text-neutral-500">{user?.username}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-medium text-neutral-500 transition hover:text-black"
            >
              Log out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h1 className="text-sm font-medium text-neutral-600">{currentChat?.title || 'New chat'}</h1>

          {currentChat && (
            <button
              type="button"
              onClick={() => setShowSettings((v) => !v)}
              className="text-xs font-medium text-neutral-500 transition hover:text-black"
            >
              ⚙ Settings
            </button>
          )}
        </header>

        {githubNotice && (
          <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-6 py-2 text-xs text-neutral-600">
            <span>{githubNotice}</span>
            <button type="button" onClick={() => setGithubNotice('')} className="text-neutral-400 hover:text-black">
              ✕
            </button>
          </div>
        )}

        {currentChat && (
          <div className="flex items-center gap-2 border-b border-neutral-200 px-6 py-3">
            {TOOL_OPTIONS.map((toolOption) => {
              const active = (currentChat.activeTools || []).includes(toolOption.key)
              const isGithubLocked = toolOption.key === 'github' && !github.github.connected

              return (
                <button
                  key={toolOption.key}
                  type="button"
                  onClick={() => handleToggleTool(toolOption.key)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    isGithubLocked
                      ? 'border-dashed border-neutral-300 text-neutral-400 hover:border-black'
                      : active
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-200 text-neutral-500 hover:border-black'
                  }`}
                >
                  {toolOption.emoji} {isGithubLocked ? 'Connect GitHub' : toolOption.label}
                </button>
              )
            })}
          </div>
        )}

        {currentChat?.attachments?.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 px-6 py-3">
            {currentChat.attachments.map((a) => (
              <span
                key={a._id}
                className="flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600"
              >
                📄 {a.filename}
                <button
                  type="button"
                  onClick={() => chat.handleDeleteAttachment(currentChat._id, a._id)}
                  className="text-neutral-400 transition hover:text-red-600"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        {showSettings && currentChat && (
          <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-4">
            <label className="text-xs font-medium text-neutral-600">Persona / system prompt</label>
            <textarea
              value={personaDraft}
              onChange={(e) => setPersonaDraft(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="e.g. Answer like a senior backend engineer, be terse."
              className="mt-2 w-full rounded-lg border border-neutral-200 p-2 text-sm outline-none focus:border-black"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-neutral-400">{personaDraft.length}/500</span>
              <button
                type="button"
                onClick={handleSavePersona}
                className="rounded-lg bg-black px-4 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-800"
              >
                Save
              </button>
            </div>
          </div>
        )}

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
                <div key={message._id || i} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {message.role === 'ai' && message.toolsUsed?.length > 0 && (
                    <div className="mb-1 flex gap-1.5">
                      {message.toolsUsed.map((t, idx) => (
                        <span
                          key={idx}
                          title={t.summary}
                          className="rounded-full border border-neutral-200 px-2 py-0.5 text-[10px] text-neutral-500"
                        >
                          {TOOL_META[t.tool]?.emoji} {TOOL_META[t.tool]?.label || t.tool}
                        </span>
                      ))}
                    </div>
                  )}
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
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleAttachClick}
              disabled={!currentChat || uploading || (currentChat?.attachments?.length || 0) >= 3}
              title={!currentChat ? 'Send a message first to start this chat' : 'Attach a PDF'}
              className="shrink-0 rounded-xl px-3 py-2.5 text-sm text-neutral-500 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {uploading ? '…' : '📎'}
            </button>
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
