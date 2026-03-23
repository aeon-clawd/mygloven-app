import { useState } from "react"
import { useNavigate } from "react-router"
import { useAuth } from "../../hooks/useAuth"
import RoleSelect from "../../components/auth/RoleSelect"
import type { Role } from "../../data/mockData"

export default function SelectRolePage() {
  const { setRole } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSelectRole = async (role: Role) => {
    setLoading(true)
    await setRole(role)
    navigate("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-1">
            <span className="text-gray-400">my</span>
            <span className="text-coral">|</span>
            <span className="text-white">G</span>
          </h1>
          <h2 className="text-xl font-semibold mt-4 mb-2">Elige tu rol</h2>
          <p className="text-gray-400 text-sm">Selecciona cómo usarás mygloven. Puedes cambiarlo después.</p>
        </div>
        <RoleSelect onSelect={handleSelectRole} loading={loading} />
      </div>
    </div>
  )
}
