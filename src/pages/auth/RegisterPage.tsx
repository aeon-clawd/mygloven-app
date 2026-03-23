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
      navigate("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/images/mygloven-logo-white.svg" alt="mygloven" className="h-14 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Crea tu cuenta</p>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-8">
          <RegisterForm onSubmit={handleRegister} error={error} />
        </div>
      </div>
    </div>
  )
}
