"use client";

import { useEffect, useState, useCallback } from "react";
import { Pill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { PageHead } from "@/components/ui/page-head";
import { Icon } from "@/components/ui/icon";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Rol, EstadoUsuario } from "@/types/database";

const rolLabels: Record<string, string> = {
  admin: "Admin",
  productor: "Productor",
  venue: "Espacio",
  artista: "Artista",
  proveedor: "Proveedor",
};

const estadoVariant: Record<string, "success" | "warning" | "error"> = {
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

  const loadUsers = useCallback(async () => {
    const supabase = createClient();
    let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (filtroRol !== "todos") {
      query = query.eq("rol", filtroRol);
    }
    const { data } = await query;
    setUsers((data as Profile[]) || []);
    setLoading(false);
  }, [filtroRol]);

  useEffect(() => {
    setLoading(true);
    loadUsers();
  }, [loadUsers]);

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

  const filtros = [
    { k: "todos", l: "Todos" },
    { k: "productor", l: "Productores" },
    { k: "venue", l: "Espacios" },
    { k: "artista", l: "Artistas" },
    { k: "proveedor", l: "Proveedores" },
    { k: "admin", l: "Admins" },
  ];

  return (
    <>
      <PageHead
        eyebrow="Quién compone la red"
        title="Usuarios"
        sub="Productores, espacios, artistas y proveedores. Todo el mapa humano del sistema."
        actions={
          <Button variant="primary" onClick={() => setShowCreate(true)} data-cursor="crear →">
            <Icon.plus /> Crear usuario
          </Button>
        }
      />

      <div className="flex-row between" style={{ marginBottom: 24 }}>
        <div className="segmented">
          {filtros.map((f) => (
            <button
              key={f.k}
              type="button"
              className={filtroRol === f.k ? "active" : ""}
              onClick={() => setFiltroRol(f.k)}
              data-cursor="filtrar"
            >
              {f.l}
            </button>
          ))}
        </div>
        <span className="text-mute">
          {users.length} usuario{users.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="empty">
          <div className="msg">Cargando…</div>
        </div>
      ) : users.length === 0 ? (
        <div className="empty">
          <div className="num">0</div>
          <div className="msg">Sin usuarios</div>
        </div>
      ) : (
        <div className="table-wrap">
          {users.map((u) => {
            const initials = u.nombre
              ? u.nombre
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "?";
            return (
              <button
                type="button"
                key={u.id}
                className="user-row"
                data-cursor="abrir →"
                onClick={() => setSelected(u)}
              >
                <div className="avatar">{initials}</div>
                <div>
                  <div className="name">{u.nombre || "Sin nombre"}</div>
                  <div className="email">{u.email}</div>
                </div>
                <Pill>{rolLabels[u.rol] || u.rol}</Pill>
                <span className="text-mute">{u.ciudad || "—"}</span>
                <Pill variant={estadoVariant[u.estado] || "default"} dot>
                  {u.estado}
                </Pill>
              </button>
            );
          })}
        </div>
      )}

      {/* Modal detalle */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.nombre || "Usuario"}
      >
        {selected && (
          <div className="flex-col">
            <div className="card-grid cols-2" style={{ borderRadius: 4 }}>
              <div>
                <div className="text-mute" style={{ marginBottom: 4 }}>
                  EMAIL
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{selected.email}</div>
              </div>
              <div>
                <div className="text-mute" style={{ marginBottom: 4 }}>
                  CIUDAD
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>
                  {selected.ciudad || "—"}
                </div>
              </div>
              <div>
                <div className="text-mute" style={{ marginBottom: 4 }}>
                  TELÉFONO
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
                  {selected.telefono || "—"}
                </div>
              </div>
              <div>
                <div className="text-mute" style={{ marginBottom: 4 }}>
                  REGISTRADO
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
                  {new Date(selected.created_at).toLocaleString("es-ES")}
                </div>
              </div>
            </div>

            <hr className="hr" />

            <Field label="Rol">
              <Select
                value={selected.rol}
                onChange={(e) => updateRol(selected.id, e.target.value as Rol)}
              >
                <option value="productor">Productor</option>
                <option value="venue">Espacio</option>
                <option value="artista">Artista</option>
                <option value="proveedor">Proveedor</option>
                <option value="admin">Admin</option>
              </Select>
            </Field>

            <Field label="Estado">
              <div className="segmented">
                {(["activo", "pendiente", "bloqueado"] as const).map((e) => (
                  <button
                    key={e}
                    type="button"
                    className={selected.estado === e ? "active" : ""}
                    onClick={() => updateEstado(selected.id, e)}
                    data-cursor={`marcar ${e}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        )}
      </Modal>

      {/* Modal crear */}
      <Modal
        open={showCreate}
        onClose={() => {
          setShowCreate(false);
          setCreateError("");
        }}
        title="Crear usuario"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCreate(false)} data-cursor="cancelar">
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateUser}
              disabled={creating || !newUser.nombre || !newUser.email || !newUser.password}
              data-cursor="crear →"
            >
              {creating ? "Creando…" : "Crear usuario"}
            </Button>
          </>
        }
      >
        <div className="flex-col">
          <Field label="Nombre">
            <Input
              value={newUser.nombre}
              onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
              placeholder="Nombre completo"
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="email@ejemplo.com"
            />
          </Field>
          <Field label="Contraseña">
            <Input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
            />
          </Field>
          <Field label="Rol">
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
          </Field>

          {createError && (
            <div
              style={{
                padding: 12,
                background: "rgba(255,59,59,0.08)",
                color: "var(--color-error)",
                borderRadius: 4,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {createError}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
