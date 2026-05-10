"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/ui/icon";
import type { Profile } from "@/types/database";

export interface NavItem {
  label: string;
  href: string;
  badge?: number | string;
}

interface SidebarProps {
  items: NavItem[];
  role: string;
}

export function Sidebar({ items, role }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="mark">
          my<span className="ap">&apos;</span>G
        </div>
        <span className="role">{role}</span>
      </div>

      <div className="sidebar-section">
        <div className="lbl">— Navegación</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {items.map((item, i) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const num = String(i + 1).padStart(2, "0");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item${isActive ? " active" : ""}`}
                data-cursor="ir →"
              >
                <span className="num">{num}</span>
                <span>{item.label}</span>
                {item.badge !== undefined && <span className="badge">{item.badge}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <UserMenu />
      </div>
    </aside>
  );
}

function UserMenu() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
          .then(({ data }) => {
            if (data) setProfile(data as Profile);
          });
      }
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    const res = await fetch("/auth/signout", { method: "POST" });
    if (res.redirected) {
      router.push(new URL(res.url).pathname);
    } else {
      router.push("/select-role");
    }
    router.refresh();
  }

  const initials = profile?.nombre
    ? profile.nombre
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const meta = profile?.rol
    ? `${profile.rol}${profile.ciudad ? ` · ${profile.ciudad}` : ""}`
    : "";

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen(!open)} className="user" data-cursor="cuenta">
        <div className="avatar">
          {profile?.avatar_url ? (
            <Image src={profile.avatar_url} alt="" width={32} height={32} unoptimized />
          ) : (
            initials
          )}
        </div>
        <div className="info">
          <div className="name">{profile?.nombre || "Mi cuenta"}</div>
          {meta && <div className="meta">{meta}</div>}
        </div>
      </button>

      {open && (
        <div className="user-menu-pop">
          <button type="button" onClick={handleSignOut} data-cursor="salir">
            <Icon.logout /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
