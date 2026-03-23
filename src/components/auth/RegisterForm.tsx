import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { UserPlus, Mail, Lock, User } from 'lucide-react'

interface RegisterFormProps {
  onSubmit: (email: string, password: string, nombre: string) => Promise<void>
  error?: string | null
}

export default function RegisterForm({ onSubmit, error }: RegisterFormProps) {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit(email, password, nombre)
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
        <label className="block text-sm text-gray-400 mb-1.5">Nombre</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            required
            className="w-full bg-surface-alt border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder:text-gray-600 focus:outline-none focus:border-coral/50 focus:ring-1 focus:ring-coral/25 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            className="w-full bg-surface-alt border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder:text-gray-600 focus:outline-none focus:border-coral/50 focus:ring-1 focus:ring-coral/25 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Contraseña</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
            className="w-full bg-surface-alt border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder:text-gray-600 focus:outline-none focus:border-coral/50 focus:ring-1 focus:ring-coral/25 transition-colors"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-coral hover:bg-coral-hover text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
      >
        <UserPlus className="w-4 h-4" />
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>

      <p className="text-sm text-gray-400 text-center">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-coral hover:text-coral-hover transition-colors">
          Inicia sesión
        </Link>
      </p>
    </form>
  )
}
