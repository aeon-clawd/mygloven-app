import { useState, useEffect } from "react"
import { UserPlus, X, Users, Shield, Building2, Music, Wrench, CalendarDays } from "lucide-react"
import { supabase } from "../../lib/supabase"
import { useAuth } from "../../hooks/useAuth"
import type { Profile, Role } from "../../data/mockData"

const roleIcons: Record<Role, React.ElementType> = {
  admin: Shield,
  venue: Building2,
  artista: Music,
  proveedor: Wrench,
  cliente: CalendarDays,
}

const roleLabels: Record<Role, string> = {
  admin: "Admin",
  venue: "Venue",
  artista: "Artista",
  proveedor: "Proveedor",
  cliente: "Cliente",
}

const estadoColors: Record<string, string> = {
  activo: "bg-green-500/10 text-green-400 border-green-500/30",
  pendiente: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  bloqueado: "bg-red-500/10 text-red-400 border-red-500/30",
}

export default function UsersPage() {
  const { createUser } = useAuth()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  // Form state
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rol, setRol] = useState<Role>("cliente")

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
    if (data) setUsers(data as Profile[])
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)
    setFormSuccess(null)

    const result = await createUser(email, password, nombre, rol)

    if (result.error) {
      setFormError(result.error.message)
    } else {
      setFormSuccess(`Usuario ${nombre} (${email}) creado como ${roleLabels[rol]}`)
      setNombre("")
      setEmail("")
      setPassword("")
      setRol("cliente")
      fetchUsers()
      setTimeout(() => {
        setShowModal(false)
        setFormSuccess(null)
      }, 2000)
    }
    setFormLoading(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-gray-400 text-sm mt-1">{users.length} usuarios registrados</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-coral hover:bg-coral-hover text-white font-medium px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors text-sm"
        >
          <UserPlus className="w-4 h-4" />
          Crear usuario
        </button>
      </div>

      {/* Users table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Nombre</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Email</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Rol</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Estado</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Registro</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  <div className="w-5 h-5 border-2 border-coral border-t-transparent rounded-full animate-spin mx-auto" />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No hay usuarios registrados</p>
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const Icon = roleIcons[u.rol] || Users
                return (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-surface-alt/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">{u.nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-300">
                        <Icon className="w-3.5 h-3.5 text-coral" />
                        {roleLabels[u.rol] || u.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${estadoColors[u.estado] || ""}`}>
                        {u.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(u.created_at).toLocaleDateString("es-ES")}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create user modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Crear usuario</h2>
              <button onClick={() => { setShowModal(false); setFormError(null); setFormSuccess(null) }} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg px-4 py-3 mb-4">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-coral/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-coral/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-coral/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Rol</label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value as Role)}
                  className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-coral/50"
                >
                  <option value="admin">Admin</option>
                  <option value="venue">Venue Owner</option>
                  <option value="artista">Artista</option>
                  <option value="proveedor">Proveedor</option>
                  <option value="cliente">Cliente / Organizador</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-coral hover:bg-coral-hover text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-sm"
              >
                <UserPlus className="w-4 h-4" />
                {formLoading ? "Creando..." : "Crear usuario"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
