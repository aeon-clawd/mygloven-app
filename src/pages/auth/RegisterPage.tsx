import { useState } from "react"
import { useNavigate } from "react-router"
import { useAuth } from "../../hooks/useAuth"
import RegisterForm from "../../components/auth/RegisterForm"

export default function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async (email: string, password: string, nombre: string) => {
    setError(null)
    const { error } = await signUp(email, password, nombre)
    if (error) {
      setError(error.message)
    } else {
      navigate("/select-role")
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
          <p className="text-gray-400 text-sm">Crea tu cuenta</p>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-8">
          <RegisterForm onSubmit={handleRegister} error={error} />
        </div>
      </div>
    </div>
  )
}
