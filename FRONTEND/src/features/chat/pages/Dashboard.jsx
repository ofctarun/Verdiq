import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../auth/hook/useAuth'
import { useChat } from '../hooks/useChat'

const Dashboard = () => {
  const { user, loading, handleGetMe } = useAuth()
  const [checking, setChecking] = useState(true)
  const navigate = useNavigate()
  const chat = useChat();

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

  if (checking || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-neutral-500">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 sm:px-10">
        <span className="text-lg font-semibold tracking-tight">Perplexity</span>
        <span className="text-sm text-neutral-500">{user?.username}</span>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16 sm:px-10">
        <div className="rounded-2xl border border-neutral-200 p-6">
          <h1 className="text-xl font-semibold tracking-tight">
            Welcome back, <span className="text-neutral-400">{user?.username}</span>
          </h1>
          <p className="mt-2 text-sm text-neutral-500">{user?.email}</p>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
