"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Rol, EstadoUsuario } from "@/types/database";

const rolLabels: Record<string, string> = {
  admin: "Admin",
  productor: "Productor",
  venue: "Espacio",
  artista: "Artista",
  proveedor: "Proveedor",
};

const estadoBadge: Record<string, "success" | "warning" | "error"> = {
  activo: "success",
  pendiente: "warning",
  bloqueado: "error",
};

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filtroRol, setFiltroRol] = useState<string>("todos");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newUser, setNewUser] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "admin" as Rol,
  });

  async function loadUsers() {
    const supabase = createClient();
    let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (filtroRol !== "todos") {
      query = query.eq("rol", filtroRol);
    }
    const { data } = await query;
    setUsers((data as Profile[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    loadUsers();
  }, [filtroRol]);

  async function updateEstado(userId: string, estado: EstadoUsuario) {
    const supabase = createClient();
    await supabase.from("profiles").update({ estado }).eq("id", userId);
    setSelected(null);
    loadUsers();
  }

  async function updateRol(userId: string, rol: Rol) {
    const supabase = createClient();
    await supabase.from("profiles").update({ rol }).eq("id", userId);
    setSelected(null);
    loadUsers();
  }

  async function handleCreateUser() {
    setCreating(true);
    setCreateError("");

    const res = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    const data = await res.json();

    if (!res.ok) {
      setCreateError(data.error || "Error al crear usuario");
      setCreating(false);
      return;
    }

    setShowCreate(false);
    setNewUser({ nombre: "", email: "", password: "", rol: "admin" });
    setCreating(false);
    loadUsers();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">Filtrar:</span>
            <Select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="w-40"
            >
              <option value="todos">Todos</option>
              <option value="productor">Productores</option>
              <option value="venue">Espacios</option>
              <option value="artista">Artistas</option>
              <option value="proveedor">Proveedores</option>
              <option value="admin">Admins</option>
            </Select>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Crear usuario
          </Button>
        </div>
      </div>

      {loading ? (
        <Card className="animate-pulse h-32" />
      ) : users.length === 0 ? (
        <Card>
          <p className="text-text-secondary text-sm">No hay usuarios registrados.</p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="px-6 py-3 font-medium">Nombre</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Rol</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium">Fecha</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors"
                >
                  <td className="px-6 py-3 font-medium">{user.nombre}</td>
                  <td className="px-6 py-3 text-text-secondary">{user.email}</td>
                  <td className="px-6 py-3">
                    <Badge>{rolLabels[user.rol]}</Badge>
                  </td>
                  <td className="px-6 py-3">
                    <Badge variant={estadoBadge[user.estado]}>{user.estado}</Badge>
                  </td>
                  <td className="px-6 py-3 text-text-muted">
                    {new Date(user.created_at).toLocaleDateString("es-ES")}
                  </td>
                  <td className="px-6 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelected(user)}
                    >
                      Ver
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Modal detalle usuario */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Detalle de usuario"
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-muted">Nombre</p>
                <p className="font-medium">{selected.nombre}</p>
              </div>
              <div>
                <p className="text-text-muted">Email</p>
                <p className="font-medium">{selected.email}</p>
              </div>
              <div>
                <p className="text-text-muted">Ciudad</p>
                <p className="font-medium">{selected.ciudad || "—"}</p>
              </div>
              <div>
                <p className="text-text-muted">Teléfono</p>
                <p className="font-medium">{selected.telefono || "—"}</p>
              </div>
              <div>
                <p className="text-text-muted">Registrado</p>
                <p className="font-medium">
                  {new Date(selected.created_at).toLocaleString("es-ES")}
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-sm text-text-secondary w-16">Rol</label>
                <Select
                  value={selected.rol}
                  onChange={(e) => updateRol(selected.id, e.target.value as Rol)}
                  className="w-40"
                >
                  <option value="productor">Productor</option>
                  <option value="venue">Espacio</option>
                  <option value="artista">Artista</option>
                  <option value="proveedor">Proveedor</option>
                  <option value="admin">Admin</option>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-text-secondary w-16">Estado</label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={selected.estado === "activo" ? "primary" : "secondary"}
                    onClick={() => updateEstado(selected.id, "activo")}
                  >
                    Activo
                  </Button>
                  <Button
                    size="sm"
                    variant={selected.estado === "pendiente" ? "primary" : "secondary"}
                    onClick={() => updateEstado(selected.id, "pendiente")}
                  >
                    Pendiente
                  </Button>
                  <Button
                    size="sm"
                    variant={selected.estado === "bloqueado" ? "primary" : "secondary"}
                    onClick={() => updateEstado(selected.id, "bloqueado")}
                  >
                    Bloqueado
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal crear usuario */}
      <Modal
        open={showCreate}
        onClose={() => {
          setShowCreate(false);
          setCreateError("");
        }}
        title="Crear usuario"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Nombre</label>
            <Input
              value={newUser.nombre}
              onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
              placeholder="Nombre completo"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Email</label>
            <Input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="email@ejemplo.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Contraseña</label>
            <Input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Rol</label>
            <Select
              value={newUser.rol}
              onChange={(e) => setNewUser({ ...newUser, rol: e.target.value as Rol })}
            >
              <option value="admin">Admin</option>
              <option value="productor">Productor</option>
              <option value="venue">Espacio</option>
              <option value="artista">Artista</option>
              <option value="proveedor">Proveedor</option>
            </Select>
          </div>

          {createError && <p className="text-sm text-error">{createError}</p>}

          <div className="flex gap-3 border-t border-border pt-4">
            <Button
              onClick={handleCreateUser}
              disabled={creating || !newUser.nombre || !newUser.email || !newUser.password}
              className="flex-1"
            >
              {creating ? "Creando..." : "Crear usuario"}
            </Button>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
