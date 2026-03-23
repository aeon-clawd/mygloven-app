import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import LoginForm from '../../components/auth/LoginForm'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (email: string, password: string) => {
    setError(null)
    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-1">
            <span className="text-gray-400">my</span>
            <span className="text-coral">|</span>
            <span className="text-white">G</span>
          </h1>
          <p className="text-gray-400 text-sm">Sign in to your dashboard</p>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-8">
          <LoginForm onSubmit={handleLogin} error={error} />
        </div>
      </div>
    </div>
  )
}
