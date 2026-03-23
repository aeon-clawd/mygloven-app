import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { LogIn, Mail, Lock } from 'lucide-react'

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>
  error?: string | null
}

export default function LoginForm({ onSubmit, error }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit(email, password)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full bg-surface-alt border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder:text-gray-600 focus:outline-none focus:border-coral/50 focus:ring-1 focus:ring-coral/25 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="w-full bg-surface-alt border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder:text-gray-600 focus:outline-none focus:border-coral/50 focus:ring-1 focus:ring-coral/25 transition-colors"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-coral hover:bg-coral-hover text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
      >
        <LogIn className="w-4 h-4" />
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <p className="text-sm text-gray-400 text-center">
        Don't have an account?{' '}
        <Link to="/register" className="text-coral hover:text-coral-hover transition-colors">
          Sign up
        </Link>
      </p>
    </form>
  )
}
